/**
 * Regression tests for the JS side of the audio bridge transport
 * (src/enhancedAudioProcessingWrapper.js). Uses a standalone fake bridge
 * (tests/fixtures/fakeAudioBridge.js) so no Python, live API, RPC, account
 * or funds are needed.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { EnhancedAudioProcessingWrapper } = require('../src/enhancedAudioProcessingWrapper');

const FIXTURE = path.join(__dirname, 'fixtures', 'fakeAudioBridge.js');

const alive = (pid) => {
    try { process.kill(pid, 0); return true; } catch (_) { return false; }
};
const waitFor = async (predicate, ms = 3000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
        if (predicate()) return true;
        await new Promise((r) => setTimeout(r, 20));
    }
    return predicate();
};

describe('EnhancedAudioProcessingWrapper transport', () => {
    let wrapper;
    let logSpy;
    let errSpy;

    const make = (mode, config = {}) => {
        wrapper = new EnhancedAudioProcessingWrapper({
            env: { FAKE_BRIDGE_MODE: mode },
            pythonExecutable: process.execPath,
            bridgeScript: FIXTURE,
            timeout: 5000,
            killGraceMs: 200,
            ...config
        });
        return wrapper;
    };

    beforeEach(() => {
        logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(async () => {
        if (wrapper) await wrapper.shutdown();
        wrapper = null;
        jest.restoreAllMocks();
    });

    test('short signal round-trips and stats update', async () => {
        make('echo');
        await wrapper.initialize();
        const res = await wrapper.processCompleteAudioPipeline([0.1, 0.2, 0.3]);
        expect(res.success).toBe(true);
        expect(res.result.length).toBe(3);
        expect(res.result.operation).toBe('complete_audio_pipeline');
        expect(wrapper.getStats()).toMatchObject({ successfulRequests: 1, pendingRequests: 0, isReady: true });
    });

    test('4000+ sample request is delivered intact', async () => {
        make('echo');
        await wrapper.initialize();
        const signal = Array.from({ length: 4500 }, (_, i) => i);
        const res = await wrapper.processSpatialAudio(signal);
        expect(res.result.length).toBe(4500);
        expect(res.result.sum).toBe(signal.reduce((a, b) => a + b, 0));
    });

    test('large response split over many chunks resolves (no per-chunk parse)', async () => {
        make('large_chunked');
        await wrapper.initialize();
        const res = await wrapper.processCompleteAudioPipeline([0]);
        expect(res.result.processed_signal).toHaveLength(50000);
        expect(res.result.processed_signal[49999]).toBeCloseTo(49.999, 10);
    });

    test('multibyte UTF-8 split across single-byte chunks is preserved', async () => {
        make('utf8_split');
        await wrapper.initialize();
        const res = await wrapper.getSystemStatus();
        expect(res.result.text).toBe('é€😀 ñ 日本語');
    });

    test('multiple messages in one chunk; unknown request ids are ignored', async () => {
        make('two_in_one_chunk');
        await wrapper.initialize();
        const res = await wrapper.getSystemStatus();
        expect(res.result.n).toBe(1);
        expect(wrapper.getStats().pendingRequests).toBe(0);
    });

    test('stderr diagnostics are logged, never parsed as protocol', async () => {
        make('stderr_noise');
        const seen = [];
        wrapper.on('stderr', (t) => seen.push(t));
        await wrapper.initialize();
        const res = await wrapper.getSystemStatus();
        expect(res.result.fine).toBe(true);
        await waitFor(() => seen.join('').includes('diagnostic'));
        expect(seen.join('')).toContain('diagnostic');
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('Python Bridge Error: diagnostic'));
    });

    test('python-reported failure rejects with its message', async () => {
        make('error_response');
        await wrapper.initialize();
        await expect(wrapper.getSystemStatus()).rejects.toThrow('python exploded');
        expect(wrapper.getStats().failedRequests).toBe(1);
    });

    test.each([
        ['malformed', /Malformed Python bridge output/],
        ['invalid_utf8', /Malformed Python bridge output/],
        ['not_object', /not a JSON object/]
    ])('%s output rejects pending request and terminates child', async (mode, pattern) => {
        make(mode);
        await wrapper.initialize();
        const pid = wrapper.pythonProcess.pid;
        await expect(wrapper.getSystemStatus()).rejects.toThrow(pattern);
        expect(await waitFor(() => !alive(pid))).toBe(true);
        expect(wrapper.isReady).toBe(false);
    });

    test('truncated final message rejects with truncation error', async () => {
        make('truncated');
        await wrapper.initialize();
        await expect(wrapper.getSystemStatus()).rejects.toThrow(/truncated output/);
    });

    test('nonzero exit rejects all pending requests exactly once', async () => {
        make('exit_nonzero');
        await wrapper.initialize();
        const disconnected = new Promise((r) => wrapper.once('disconnected', r));
        const results = await Promise.allSettled([wrapper.getSystemStatus(), wrapper.getSystemStatus()]);
        results.forEach((r) => {
            expect(r.status).toBe('rejected');
            expect(r.reason.message).toMatch(/exited with code 3/);
        });
        await disconnected;
        expect(wrapper.getStats().pendingRequests).toBe(0);
        await expect(wrapper.getSystemStatus()).rejects.toThrow('Python bridge not ready');
    });

    test('response exceeding maxResponseBytes without terminator fails safely', async () => {
        make('oversize', { maxResponseBytes: 1000 });
        await wrapper.initialize();
        const pid = wrapper.pythonProcess.pid;
        await expect(wrapper.getSystemStatus()).rejects.toThrow(/exceeded 1000 bytes/);
        expect(await waitFor(() => !alive(pid))).toBe(true);
    });

    test('request timeout rejects once, clears state and kills the child', async () => {
        make('hang', { timeout: 300 });
        await wrapper.initialize();
        const pid = wrapper.pythonProcess.pid;
        await expect(wrapper.getSystemStatus()).rejects.toThrow('Request timeout');
        expect(wrapper.getStats().pendingRequests).toBe(0);
        expect(await waitFor(() => !alive(pid))).toBe(true);
        expect(wrapper.isReady).toBe(false);
    });

    test('child ignoring SIGTERM is escalated to SIGKILL', async () => {
        make('ignore_sigterm', { timeout: 300, killGraceMs: 100 });
        await wrapper.initialize();
        const pid = wrapper.pythonProcess.pid;
        await expect(wrapper.getSystemStatus()).rejects.toThrow('Request timeout');
        expect(await waitFor(() => !alive(pid), 5000)).toBe(true);
    });

    test('shutdown rejects pending requests and terminates the child', async () => {
        make('hang');
        await wrapper.initialize();
        const pid = wrapper.pythonProcess.pid;
        const assertion = expect(wrapper.getSystemStatus()).rejects.toThrow('Bridge shutting down');
        await wrapper.shutdown();
        await assertion;
        expect(alive(pid)).toBe(false);
        expect(wrapper.pythonProcess).toBeNull();
    });

    test('bridge can be re-initialized after a failure', async () => {
        make('exit_nonzero');
        await wrapper.initialize();
        await expect(wrapper.getSystemStatus()).rejects.toThrow();
        await waitFor(() => wrapper.pythonProcess === null);
        wrapper.config.env = { FAKE_BRIDGE_MODE: 'echo' };
        await wrapper.initialize();
        const res = await wrapper.processCompleteAudioPipeline([1, 2]);
        expect(res.result.length).toBe(2);
    });

    test('concurrent initialize() calls share one worker startup', async () => {
        const log = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-')), 'spawns.log');
        make('echo', { env: { FAKE_BRIDGE_MODE: 'echo', FAKE_BRIDGE_SPAWN_LOG: log } });
        const [a, b, c] = await Promise.all([wrapper.initialize(), wrapper.initialize(), wrapper.initialize()]);
        expect([a, b, c]).toEqual([true, true, true]);
        expect(fs.readFileSync(log, 'utf8').trim().split('\n')).toHaveLength(1);
        await expect(wrapper.initialize()).resolves.toBe(true); // already ready: still no new worker
        expect(fs.readFileSync(log, 'utf8').trim().split('\n')).toHaveLength(1);
    });

    test('concurrent initialize() calls all reject when startup fails, and a retry is possible', async () => {
        make('exit_before_ready');
        const results = await Promise.allSettled([wrapper.initialize(), wrapper.initialize()]);
        results.forEach((r) => expect(r.status).toBe('rejected'));
        wrapper.config.env = { FAKE_BRIDGE_MODE: 'echo' };
        await expect(wrapper.initialize()).resolves.toBe(true);
    });

    test('a dying old worker does not cancel the replacement worker\'s requests', async () => {
        make('ignore_sigterm', { timeout: 400, killGraceMs: 600 });
        await wrapper.initialize();
        const oldPid = wrapper.pythonProcess.pid;
        await expect(wrapper.getSystemStatus()).rejects.toThrow('Request timeout');
        // Old worker is still alive (ignores SIGTERM) while we start its replacement
        wrapper.config.env = { FAKE_BRIDGE_MODE: 'hang' };
        wrapper.config.timeout = 5000;
        await wrapper.initialize();
        const newPid = wrapper.pythonProcess.pid;
        expect(newPid).not.toBe(oldPid);
        let settled = false;
        const pending = wrapper.getSystemStatus();
        pending.catch(() => {}).then(() => { settled = true; });
        expect(await waitFor(() => !alive(oldPid), 4000)).toBe(true);
        await new Promise((r) => setTimeout(r, 100));
        expect(settled).toBe(false);
        expect(wrapper.isReady).toBe(true);
        expect(wrapper.getStats().pendingRequests).toBe(1);
        const assertion = expect(pending).rejects.toThrow('Bridge shutting down');
        await wrapper.shutdown();
        await assertion;
    });

    describe('initialize failures', () => {
        test('spawn error (missing executable) rejects once', async () => {
            make('echo', { pythonExecutable: '/nonexistent/python-binary' });
            await expect(wrapper.initialize()).rejects.toMatchObject({ code: 'ENOENT' });
            expect(wrapper.isReady).toBe(false);
        });

        test('exit before ready rejects with exit code', async () => {
            make('exit_before_ready');
            await expect(wrapper.initialize()).rejects.toThrow(/exited with code 4/);
        });

        test('fatal error message before ready rejects with its text (no unhandled error event)', async () => {
            make('fatal_error_before_ready');
            await expect(wrapper.initialize()).rejects.toThrow('fatal init failure');
        });

        test('garbage before ready rejects and terminates child', async () => {
            make('garbage_before_ready');
            await expect(wrapper.initialize()).rejects.toThrow(/Malformed/);
        });

        test('initialization timeout rejects and terminates child', async () => {
            make('no_ready', { timeout: 300 });
            const p = wrapper.initialize();
            const pid = wrapper.pythonProcess.pid;
            await expect(p).rejects.toThrow('Python bridge initialization timeout');
            expect(await waitFor(() => !alive(pid))).toBe(true);
        });
    });
});
