#!/usr/bin/env node
/* One supervised JS/Python bridge stress case; see audio_stack_limits.py. */

const { spawnSync } = require('child_process');
const path = require('path');
const { EnhancedAudioProcessingWrapper } = require('../src/enhancedAudioProcessingWrapper');

const ROOT = path.resolve(__dirname, '..');
const PYTHON = process.env.PYTHON || 'python3';
const DIRECT = path.join(__dirname, 'fixtures', 'direct_bridge_run.py');
const FIXTURE = path.join(__dirname, 'fixtures', 'fakeAudioBridge.js');
const ABS_TOL = 1e-12;
const REL_TOL = 1e-9;

function seededNoise(length, seed) {
    let state = seed >>> 0;
    return Array.from({ length }, () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return (state / 0x100000000) * 2 - 1;
    });
}

function makeSignal(length, kind, seed) {
    const phase = (seed % 360) * Math.PI / 180;
    if (kind === 'two_dimensional') {
        return Array.from({ length }, (_, row) => [row / 10, -row / 10]);
    }
    if (kind === 'string_dtype') return Array.from({ length }, () => 'audio');
    if (kind === 'nan_inf') return [NaN, Infinity, -Infinity];
    if (kind === 'null') return null;
    if (kind === 'silence') return Array(length).fill(0);
    if (kind === 'dc') return Array(length).fill(0.25);
    if (kind === 'impulse') return Array.from({ length }, (_, i) => i === Math.floor(length / 2) ? 1 : 0);
    if (kind === 'noise') return seededNoise(length, seed);
    if (kind === 'tiny' || kind === 'large') {
        const amplitude = kind === 'tiny' ? 1e-200 : 1e150;
        return Array.from({ length }, (_, i) => amplitude * Math.sin(2 * Math.PI * 440 * i / 44100 + phase));
    }
    if (kind === 'mixed') {
        return Array.from({ length }, (_, i) => (
            0.35 * Math.sin(2 * Math.PI * 440 * i / 44100 + phase)
            + 0.15 * Math.sin(2 * Math.PI * 880 * i / 44100 + 2 * phase)
        ));
    }
    return Array.from({ length }, (_, i) => 0.5 * Math.sin(2 * Math.PI * 440 * i / 44100 + phase));
}

function shapeOf(value) {
    if (!Array.isArray(value)) return [];
    return [value.length, ...(value.length ? shapeOf(value[0]) : [])];
}

function finiteDeep(value) {
    if (typeof value === 'number') return Number.isFinite(value);
    if (Array.isArray(value)) return value.every(finiteDeep);
    if (value && typeof value === 'object') return Object.values(value).every(finiteDeep);
    return false;
}

function compare(actual, expected, location = 'root') {
    if (Array.isArray(actual)) {
        if (!Array.isArray(expected) || actual.length !== expected.length) {
            return `${location}: shape mismatch`;
        }
        for (let i = 0; i < actual.length; i += 1) {
            const error = compare(actual[i], expected[i], `${location}[${i}]`);
            if (error) return error;
        }
        return null;
    }
    if (actual && expected && typeof actual === 'object' && typeof expected === 'object') {
        const keys = Object.keys(actual).sort();
        if (JSON.stringify(keys) !== JSON.stringify(Object.keys(expected).sort())) {
            return `${location}: object keys differ`;
        }
        for (const key of keys) {
            const error = compare(actual[key], expected[key], `${location}.${key}`);
            if (error) return error;
        }
        return null;
    }
    if (typeof actual === 'number' && typeof expected === 'number') {
        if (Math.abs(actual - expected) <= ABS_TOL + REL_TOL * Math.abs(expected)) return null;
        return `${location}: ${actual} differs from ${expected}`;
    }
    return actual === expected ? null : `${location}: ${String(actual)} differs from ${String(expected)}`;
}

function directResult(signal) {
    const request = JSON.stringify({
        operation: 'complete_audio_pipeline',
        parameters: { signal, config: {} }
    });
    const result = spawnSync(PYTHON, [DIRECT], {
        cwd: ROOT,
        env: process.env,
        input: request,
        encoding: 'utf8',
        maxBuffer: 512 * 1024 * 1024,
        timeout: 50000,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`direct Python returned ${result.status}: ${result.stderr.slice(-1500)}`);
    return JSON.parse(result.stdout);
}

async function bridgeSignal(testCase) {
    const signal = makeSignal(testCase.size, testCase.signal_kind, testCase.seed);
    const inputBefore = JSON.stringify(signal);
    const wrapper = new EnhancedAudioProcessingWrapper({
        pythonExecutable: PYTHON,
        timeout: 50000,
        sampleRate: testCase.sample_rate || 44100,
    });
    const start = process.hrtime.bigint();
    const rssStart = process.memoryUsage().rss;
    try {
        await wrapper.initialize();
        const promise = wrapper.processCompleteAudioPipeline(signal);
        const pendingBefore = wrapper.getStats().pendingRequests;
        const response = await promise;
        const direct = directResult(signal);
        const mismatch = compare(response.result, direct);
        const stats = wrapper.getStats();
        const record = {
            status: response.success && !mismatch && stats.pendingRequests === 0 ? 'ok' : 'fail',
            path: 'js_python_bridge',
            size: Array.isArray(signal) ? signal.length : null,
            signal_kind: testCase.signal_kind,
            input_shape: shapeOf(signal),
            output_shape: shapeOf(response.result),
            output_finite: finiteDeep(response.result),
            input_mutated: JSON.stringify(signal) !== inputBefore,
            direct_match: !mismatch,
            direct_mismatch: mismatch,
            tolerance: { absolute: ABS_TOL, relative: REL_TOL },
            pending_before: pendingBefore,
            pending_after: stats.pendingRequests,
            request_count: stats.totalRequests,
            request_timeout_ms: wrapper.config.timeout,
            js_rss_start_bytes: rssStart,
            js_rss_end_bytes: process.memoryUsage().rss,
            response_payload_bytes: Buffer.byteLength(JSON.stringify(response.result)),
            json_nonfinite_values_become_null: testCase.signal_kind === 'nan_inf',
            elapsed_seconds: Number(process.hrtime.bigint() - start) / 1e9,
        };
        if (testCase.signal_kind === 'null') {
            record.specification_note = 'null signal is treated as omitted and generates the default-duration tone';
        }
        if (record.status === 'fail') record.failure_reason = mismatch || 'request counters or success flag disagree';
        return record;
    } finally {
        await wrapper.shutdown();
    }
}

async function concurrency(testCase) {
    const wrapper = new EnhancedAudioProcessingWrapper({
        pythonExecutable: PYTHON,
        timeout: 50000,
    });
    try {
        await wrapper.initialize();
        const signals = Array.from({ length: testCase.pending_count }, (_, i) => Array(i + 1).fill(i + 0.25));
        const promises = signals.map((signal) => wrapper.processCompleteAudioPipeline(signal));
        const pendingBefore = wrapper.getStats().pendingRequests;
        const results = await Promise.all(promises);
        const stats = wrapper.getStats();
        const routingOk = results.every((response, i) => (
            response.success && Array.isArray(response.result) && response.result.length === i + 1
        ));
        return {
            status: routingOk && stats.pendingRequests === 0 ? 'ok' : 'fail',
            path: 'js_python_bridge',
            phase: 'concurrency',
            pending_requested: testCase.pending_count,
            pending_before: pendingBefore,
            pending_after: stats.pendingRequests,
            result_count: results.length,
            request_count: stats.totalRequests,
            request_ids_routed_to_expected_callers: routingOk,
            is_ready_after: stats.isReady,
        };
    } finally {
        await wrapper.shutdown();
    }
}

function summarize(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
    return {
        samples: values.length,
        mean_seconds: mean,
        median_seconds: sorted[Math.floor(sorted.length / 2)],
        p95_seconds: sorted[Math.max(0, Math.ceil(sorted.length * 0.95) - 1)],
        standard_deviation_seconds: Math.sqrt(variance),
        coefficient_of_variation: mean ? Math.sqrt(variance) / mean : 0,
    };
}

async function lifecycle(testCase) {
    const wrapper = new EnhancedAudioProcessingWrapper({
        pythonExecutable: PYTHON,
        timeout: 50000,
    });
    const timings = [];
    const pids = [];
    let peakRss = process.memoryUsage().rss;
    let peakActiveChildren = 0;
    let successful = 0;
    let pendingBefore = 0;
    for (let i = 0; i < testCase.cycles; i += 1) {
        const started = process.hrtime.bigint();
        await wrapper.initialize();
        if (wrapper.pythonProcess) pids.push(wrapper.pythonProcess.pid);
        peakActiveChildren = Math.max(peakActiveChildren, wrapper.pythonProcess ? 1 : 0);
        const pending = wrapper.getSystemStatus();
        pendingBefore = Math.max(pendingBefore, wrapper.getStats().pendingRequests);
        const response = await pending;
        if (!response.success) throw new Error(`cycle ${i} status request failed`);
        successful += 1;
        peakRss = Math.max(peakRss, process.memoryUsage().rss);
        await wrapper.shutdown();
        timings.push(Number(process.hrtime.bigint() - started) / 1e9);
        peakRss = Math.max(peakRss, process.memoryUsage().rss);
        if (wrapper.pythonProcess !== null || wrapper.pendingRequests.size !== 0) {
            throw new Error(`cycle ${i} did not clean up worker state`);
        }
    }
    const livePidsAfter = pids.filter((pid) => {
        try { process.kill(pid, 0); return true; } catch (_) { return false; }
    });
    return {
        status: successful === testCase.cycles && livePidsAfter.length === 0 ? 'ok' : 'fail',
        path: 'js_python_bridge',
        phase: 'lifecycle',
        cycles_requested: testCase.cycles,
        cycles_completed: successful,
        latency_distribution: summarize(timings),
        peak_js_rss_bytes: peakRss,
        worker_processes_peak: peakActiveChildren,
        distinct_worker_pids: new Set(pids).size,
        live_worker_pids_after: livePidsAfter,
        pending_requests_peak: pendingBefore,
        pending_requests_after: wrapper.pendingRequests.size,
        worker_reference_after: wrapper.pythonProcess,
    };
}

async function sampleRate(testCase) {
    const wrapper = new EnhancedAudioProcessingWrapper({
        pythonExecutable: PYTHON,
        timeout: 50000,
        sampleRate: testCase.sample_rate,
    });
    try {
        await wrapper.initialize();
        const response = await wrapper.getSystemStatus();
        const tone = await wrapper.processHarmonicSeries(
            [{ frequency: 440, amplitude: 1 }],
            { duration: 1 }
        );
        const detectedFrequency = tone.result.harmonic_analysis.harmonic_0.frequency;
        const frequencyToleranceHz = testCase.sample_rate / testCase.sample_rate;
        const rateMatches = response.result.sample_rate_hz === testCase.sample_rate
            && response.result.sample_rate === testCase.sample_rate;
        const computationMatches = Math.abs(detectedFrequency - 440) <= frequencyToleranceHz;
        return {
            status: response.success && rateMatches && computationMatches ? 'ok' : 'fail',
            path: 'js_python_bridge',
            phase: 'sample_rate',
            wrapper_configured_sample_rate_hz: testCase.sample_rate,
            bridge_reported_sample_rate_hz: response.result.sample_rate,
            bridge_reported_sample_rate_hz_canonical: response.result.sample_rate_hz,
            wrapper_rate_propagated: rateMatches,
            expected_frequency_hz: 440,
            computed_frequency_hz: detectedFrequency,
            frequency_tolerance_hz: frequencyToleranceHz,
            computation_matches: computationMatches,
        };
    } finally {
        await wrapper.shutdown();
    }
}

async function fakeFaults() {
    const modes = [
        'utf8_split', 'stderr_noise', 'two_in_one_chunk',
        'malformed', 'invalid_utf8', 'not_object', 'truncated', 'exit_nonzero', 'hang', 'ignore_sigterm',
    ];
    const observations = [];
    for (const mode of modes) {
        const wrapper = new EnhancedAudioProcessingWrapper({
            pythonExecutable: process.execPath,
            bridgeScript: FIXTURE,
            env: { FAKE_BRIDGE_MODE: mode },
            timeout: mode === 'hang' || mode === 'ignore_sigterm' ? 250 : 2000,
            killGraceMs: 100,
        });
        try {
            await wrapper.initialize();
            let error = '';
            let response = null;
            try { response = await wrapper.getSystemStatus(); } catch (caught) { error = caught.message; }
            const expectedError = {
                malformed: /Malformed/,
                invalid_utf8: /Malformed/,
                not_object: /not a JSON object/,
                truncated: /truncated/,
                exit_nonzero: /exited with code 3/,
                hang: /Request timeout/,
                ignore_sigterm: /Request timeout/,
            }[mode];
            observations.push({
                mode,
                succeeded_as_expected: expectedError
                    ? Boolean(error && expectedError.test(error))
                    : Boolean(response && response.success),
                error,
                result: response && response.result,
                pending_after: wrapper.getStats().pendingRequests,
                ready_after: wrapper.isReady,
            });
        } finally {
            await wrapper.shutdown();
        }
    }
    const writeWrapper = new EnhancedAudioProcessingWrapper({
        pythonExecutable: process.execPath,
        bridgeScript: FIXTURE,
        env: { FAKE_BRIDGE_MODE: 'hang' },
        timeout: 2000,
        killGraceMs: 100,
    });
    let writeFailureMessage = '';
    try {
        await writeWrapper.initialize();
        writeWrapper.pythonProcess.stdin.write = (_payload, callback) => {
            queueMicrotask(() => callback(new Error('fixture write failure')));
            return false;
        };
        try { await writeWrapper.getSystemStatus(); } catch (error) { writeFailureMessage = error.message; }
    } finally {
        await writeWrapper.shutdown();
    }

    const writeFailureRecord = {
        injected: true,
        error: writeFailureMessage,
        pending_after: writeWrapper.pendingRequests.size,
    };

    const frameBoundary = [];
    for (const frameBytes of [127, 128, 129]) {
        const wrapper = new EnhancedAudioProcessingWrapper({
            pythonExecutable: process.execPath,
            bridgeScript: FIXTURE,
            env: { FAKE_BRIDGE_MODE: 'frame_size', FAKE_FRAME_BYTES: String(frameBytes) },
            timeout: 2000,
            maxResponseBytes: 128,
        });
        const stderr = [];
        wrapper.on('stderr', (text) => stderr.push(text));
        let error = '';
        try {
            await wrapper.initialize();
            try { await wrapper.getSystemStatus(); } catch (caught) { error = caught.message; }
            await new Promise((resolve) => setTimeout(resolve, 10));
            frameBoundary.push({
                complete_frame_bytes: frameBytes,
                configured_cap_bytes: 128,
                accepted: !error,
                error,
                frame_bytes_diagnostic: stderr.join(''),
                pending_after: wrapper.getStats().pendingRequests,
            });
        } finally {
            await wrapper.shutdown();
        }
    }
    const unterminatedWrapper = new EnhancedAudioProcessingWrapper({
        pythonExecutable: process.execPath,
        bridgeScript: FIXTURE,
        env: { FAKE_BRIDGE_MODE: 'oversize' },
        timeout: 2000,
        maxResponseBytes: 128,
    });
    let unterminatedFrameError = '';
    try {
        await unterminatedWrapper.initialize();
        try { await unterminatedWrapper.getSystemStatus(); } catch (error) {
            unterminatedFrameError = error.message;
        }
    } finally {
        await unterminatedWrapper.shutdown();
    }
    const unterminatedFrame = {
        configured_cap_bytes: 128,
        rejected: /unterminated frame exceeded the response limit of 128 bytes/.test(unterminatedFrameError),
        error: unterminatedFrameError,
        pending_after: unterminatedWrapper.getStats().pendingRequests,
    };
    return {
        status: observations.every((item) => item.succeeded_as_expected && item.pending_after === 0)
            && Boolean(writeFailureRecord.error.match(/Failed to send request.*fixture write failure/))
            && frameBoundary.every((item) => item.accepted === (item.complete_frame_bytes <= 128)
                && item.pending_after === 0
                && (item.complete_frame_bytes <= 128 || /complete frame exceeded the response limit/.test(item.error)))
            && unterminatedFrame.rejected && unterminatedFrame.pending_after === 0
            ? 'ok' : 'fail',
        path: 'js_python_bridge',
        phase: 'fault_injection',
        fault_observations: observations,
        write_failure: writeFailureRecord,
        max_response_boundary: frameBoundary,
        unterminated_response_limit: unterminatedFrame,
    };
}

async function main() {
    if (process.env.SOLIDARITY_AUDIO_STRESS !== '1') {
        throw new Error('Set SOLIDARITY_AUDIO_STRESS=1 to opt in to bounded stress execution.');
    }
    const testCase = JSON.parse(process.argv[2]);
    const originalLog = console.log;
    const originalError = console.error;
    console.log = () => {};
    console.error = () => {};
    try {
        let result;
        if (testCase.phase === 'concurrency') result = await concurrency(testCase);
        else if (testCase.phase === 'lifecycle') result = await lifecycle(testCase);
        else if (testCase.phase === 'sample_rate') result = await sampleRate(testCase);
        else if (testCase.phase === 'fault_injection') result = await fakeFaults();
        else result = await bridgeSignal(testCase);
        process.stdout.write(`${JSON.stringify(result)}\n`);
        process.exitCode = result.status === 'ok' ? 0 : 2;
    } finally {
        console.log = originalLog;
        console.error = originalError;
    }
}

main().catch((error) => {
    process.stdout.write(`${JSON.stringify({
        status: 'error',
        path: 'js_python_bridge',
        exception_type: error.name,
        exception: error.message,
        stack: error.stack,
    })}\n`);
    process.exitCode = 0;
});
