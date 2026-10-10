/**
 * Standalone fake of the Python bridge's stdout/stdin protocol, used by
 * tests/enhancedAudioProcessingWrapper.test.js. Behaviour is selected with the
 * FAKE_BRIDGE_MODE environment variable. No Python, network or secrets needed.
 */
const readline = require('readline');

const mode = process.env.FAKE_BRIDGE_MODE || 'echo';
if (process.env.FAKE_BRIDGE_SPAWN_LOG) {
    require('fs').appendFileSync(process.env.FAKE_BRIDGE_SPAWN_LOG, `${process.pid}\n`);
}
const out = (obj) => process.stdout.write(JSON.stringify(obj) + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Write a buffer in small slices so the parent sees arbitrary chunk boundaries
async function writeSliced(buffer, size) {
    for (let i = 0; i < buffer.length; i += size) {
        process.stdout.write(buffer.subarray(i, i + size));
        await sleep(1);
    }
}

if (mode === 'exit_before_ready') {
    process.stderr.write('boot failure diagnostics\n');
    process.exit(4);
}
if (mode === 'ignore_sigterm') {
    process.on('SIGTERM', () => {});
}
if (mode === 'no_ready') {
    setInterval(() => {}, 1000);
} else if (mode === 'fatal_error_before_ready') {
    out({ status: 'error', message: 'fatal init failure' });
} else if (mode === 'garbage_before_ready') {
    process.stdout.write('not json at all\n');
    setInterval(() => {}, 1000);
} else {
    out({ status: 'ready', message: 'fake bridge' });
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', async (line) => {
    const req = JSON.parse(line);
    const id = req.request_id;
    const signal = (req.parameters && req.parameters.signal) || [];
    const ok = (result) => ({ success: true, result, error: null, processing_time: 0.001, request_id: id });

    switch (mode) {
        case 'echo':
            out(ok({ length: signal.length, sum: signal.reduce((a, b) => a + b, 0), operation: req.operation }));
            break;
        case 'large_chunked': {
            const big = Array.from({ length: 50000 }, (_, i) => i / 1000);
            await writeSliced(Buffer.from(JSON.stringify(ok({ processed_signal: big })) + '\n'), 1000);
            break;
        }
        case 'utf8_split': {
            const text = 'é€😀 ñ 日本語';
            const buf = Buffer.from(JSON.stringify(ok({ text })) + '\n');
            await writeSliced(buf, 1); // splits every multibyte sequence
            break;
        }
        case 'two_in_one_chunk':
            process.stdout.write(
                JSON.stringify(ok({ n: 1 })) + '\n' +
                JSON.stringify({ ...ok({ n: 2 }), request_id: 'unknown' }) + '\n'
            );
            break;
        case 'stderr_noise':
            process.stderr.write('diagnostic: {"request_id":"x"} not protocol\n');
            out(ok({ fine: true }));
            break;
        case 'error_response':
            out({ success: false, result: {}, error: 'python exploded', processing_time: 0, request_id: id });
            break;
        case 'malformed':
            process.stdout.write('{"request_id": "' + id + '", "succ\n');
            break;
        case 'invalid_utf8':
            process.stdout.write(Buffer.concat([Buffer.from('{"request_id":"a","x":"'), Buffer.from([0xff, 0xfe]), Buffer.from('"}\n')]));
            break;
        case 'not_object':
            process.stdout.write('[1,2,3]\n');
            break;
        case 'truncated':
            process.stdout.write(JSON.stringify(ok({ a: 'b' })).slice(0, 20));
            process.exit(0);
            break;
        case 'exit_nonzero':
            process.stderr.write('crashing\n');
            process.exit(3);
            break;
        case 'oversize':
            process.stdout.write('x'.repeat(5000));
            break;
        case 'hang':
        case 'ignore_sigterm':
            break;
        default:
            break;
    }
});
rl.on('close', () => process.exit(0));
