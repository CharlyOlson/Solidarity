/**
 * Integration test: JS wrapper <-> real Python bridge, compared against direct
 * Python execution (tests/fixtures/direct_bridge_run.py).
 * Tolerance: abs 1e-12 / rel 1e-9. Skipped (reported) when python+numpy are
 * unavailable. No network, secrets or accounts are used.
 */
const path = require('path');
const { spawnSync } = require('child_process');
const { EnhancedAudioProcessingWrapper } = require('../src/enhancedAudioProcessingWrapper');

const PYTHON = process.env.PYTHON || 'python3';
const probe = spawnSync(PYTHON, ['-c', 'import numpy'], { encoding: 'utf8' });
const available = probe.status === 0;
// Set REQUIRE_PYTHON_INTEGRATION=1 (e.g. in CI) so missing Python/NumPy fails instead of silently skipping
const required = process.env.REQUIRE_PYTHON_INTEGRATION === '1';
const maybe = available ? describe : describe.skip;

if (!available && required) {
    test('python3 with numpy is available (REQUIRE_PYTHON_INTEGRATION=1)', () => {
        throw new Error(`Python integration prerequisites missing: ${probe.stderr || probe.error}`);
    });
}

const sine = (n) => Array.from({ length: n }, (_, i) => 0.5 * Math.sin(2 * Math.PI * 440 * i / 44100));

const direct = (operation, parameters) => {
    const res = spawnSync(PYTHON, [path.join(__dirname, 'fixtures', 'direct_bridge_run.py')], {
        input: JSON.stringify({ operation, parameters }),
        encoding: 'utf8',
        maxBuffer: 512 * 1024 * 1024,
        timeout: 120000
    });
    if (res.status !== 0) throw new Error(`direct run failed: ${res.stderr}`);
    return JSON.parse(res.stdout);
};

const expectClose = (a, b, where = 'root') => {
    if (Array.isArray(a)) {
        expect(Array.isArray(b)).toBe(true);
        expect(b.length).toBe(a.length);
        a.forEach((x, i) => expectClose(x, b[i], `${where}[${i}]`));
    } else if (a && typeof a === 'object') {
        expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort());
        Object.keys(a).forEach((k) => expectClose(a[k], b[k], `${where}.${k}`));
    } else if (typeof a === 'number') {
        const diff = Math.abs(a - b);
        if (!(diff <= 1e-12 + 1e-9 * Math.abs(a))) throw new Error(`${where}: ${a} vs ${b}`);
    } else {
        expect(b).toEqual(a);
    }
};

maybe('JS wrapper with real Python bridge', () => {
    let wrapper;

    beforeAll(async () => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        wrapper = new EnhancedAudioProcessingWrapper({ pythonExecutable: PYTHON, timeout: 60000 });
        await wrapper.initialize();
    }, 70000);

    afterAll(async () => {
        if (wrapper) await wrapper.shutdown();
        jest.restoreAllMocks();
    });

    test.each([100, 4500, 20000])('complete_audio_pipeline with %i samples matches direct Python', async (n) => {
        const signal = sine(n);
        const res = await wrapper.processCompleteAudioPipeline(signal);
        expect(res.success).toBe(true);
        expectClose(direct('complete_audio_pipeline', { signal, config: {}, frequency: 440, duration: 1.0 }), res.result);
    }, 70000);

    test('spatial audio (4500 samples) matches direct Python', async () => {
        const signal = sine(4500);
        const res = await wrapper.processSpatialAudio(signal);
        expectClose(direct('spatial_audio_processing', { signal, frequency: 440, duration: 1.0 }), res.result);
    }, 70000);

    test('system status reports ready systems', async () => {
        const res = await wrapper.getSystemStatus();
        expect(res.result.sample_rate).toBe(44100);
        expect(res.result.sample_rate_hz).toBe(44100);
    });

    test.each([16000, 44100, 48000])(
        'configured %i Hz is reported and used to analyze a 440 Hz tone',
        async (sampleRateHz) => {
            const configured = new EnhancedAudioProcessingWrapper({
                pythonExecutable: PYTHON,
                timeout: 60000,
                sample_rate_hz: sampleRateHz
            });
            try {
                await configured.initialize();
                const status = await configured.getSystemStatus();
                expect(status.result.sample_rate_hz).toBe(sampleRateHz);
                expect(status.result.sample_rate).toBe(sampleRateHz);

                const tone = await configured.processHarmonicSeries(
                    [{ frequency: 440, amplitude: 1 }],
                    { duration: 1 }
                );
                const detectedFrequency = tone.result.harmonic_analysis.harmonic_0.frequency;
                expect(Math.abs(detectedFrequency - 440)).toBeLessThanOrEqual(sampleRateHz / sampleRateHz);
            } finally {
                await configured.shutdown();
            }
        },
        70000
    );

    test('request sample rate conflicting with bridge configuration is rejected', async () => {
        const signal = sine(1024);
        await expect(wrapper.processCompleteAudioPipeline(signal, { sample_rate_hz: 48000 }))
            .rejects.toThrow(/conflicts with configured sample_rate_hz 44100/);
    });
});
