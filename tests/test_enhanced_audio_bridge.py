"""
Regression tests for src/enhancedAudioProcessingBridge.py (Python side of the
JS/Python audio bridge). Run with: python3 -m unittest tests.test_enhanced_audio_bridge
or: python3 tests/test_enhanced_audio_bridge.py

Tolerance for comparing bridge output with direct execution: abs 1e-12 /
rel 1e-9 (identical code path; JSON floats round-trip exactly, so this only
guards against accidental precision loss).
"""
import asyncio
import json
import math
import os
import subprocess
import sys
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, 'src')
BRIDGE = os.path.join(SRC, 'enhancedAudioProcessingBridge.py')
sys.path.insert(0, SRC)

try:
    import numpy as np
    import enhancedAudioProcessingBridge as bridge_module
except ImportError as exc:  # pragma: no cover
    if os.environ.get('REQUIRE_PYTHON_INTEGRATION') == '1':
        raise  # fail loudly instead of reporting a skip
    raise unittest.SkipTest(f"numpy/bridge unavailable: {exc}")


def sine(n):
    return [0.5 * math.sin(2 * math.pi * 440 * i / 44100) for i in range(n)]


def run_bridge(requests, timeout=120):
    stdin = ''.join(json.dumps(r) + '\n' for r in requests)
    proc = subprocess.run([sys.executable, BRIDGE], input=stdin, capture_output=True,
                          text=True, timeout=timeout, cwd=SRC)
    return proc


def assert_close(test, a, b, path='root'):
    if isinstance(a, dict):
        test.assertEqual(set(a), set(b), path)
        for k in a:
            assert_close(test, a[k], b[k], f'{path}.{k}')
    elif isinstance(a, list):
        test.assertEqual(len(a), len(b), path)
        for i, (x, y) in enumerate(zip(a, b)):
            assert_close(test, x, y, f'{path}[{i}]')
    elif isinstance(a, float):
        test.assertTrue(math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12), f'{path}: {a} != {b}')
    else:
        test.assertEqual(a, b, path)


class ToJsonableTests(unittest.TestCase):
    def test_nested_numpy_arrays_and_scalars(self):
        value = {
            'a': np.arange(4, dtype=np.int32),
            'b': {'c': np.float32(1.5), 'd': np.bool_(True), 'e': np.int64(7)},
            'f': [np.array([[1.0, 2.0], [3.0, 4.0]]), (np.float64(0.25), 'x')],
            1: np.str_('k'),
        }
        out = bridge_module.to_jsonable(value)
        self.assertEqual(out, {'a': [0, 1, 2, 3],
                               'b': {'c': 1.5, 'd': True, 'e': 7},
                               'f': [[[1.0, 2.0], [3.0, 4.0]], [0.25, 'x']],
                               '1': 'k'})
        self.assertEqual(json.loads(json.dumps(out, allow_nan=False)), out)

    def test_non_finite_become_null_and_are_counted_by_converter(self):
        counter = {'non_finite': 0}
        out = bridge_module.to_jsonable(
            {'x': np.array([1.0, np.nan, np.inf, -np.inf]), 's': np.float64('nan'), 'p': float('inf')},
            counter)
        self.assertEqual(out, {'x': [1.0, None, None, None], 's': None, 'p': None})
        self.assertEqual(counter['non_finite'], 5)

    def test_edge_case_numpy_objects(self):
        self.assertEqual(bridge_module.to_jsonable(np.array(2.5)), 2.5)           # 0-d float
        self.assertEqual(bridge_module.to_jsonable(np.array(3)), 3)               # 0-d int
        self.assertEqual(bridge_module.to_jsonable(np.array([])), [])             # empty
        self.assertEqual(bridge_module.to_jsonable(np.float16(0.5)), 0.5)
        self.assertEqual(bridge_module.to_jsonable(np.array([[1, 2], [3, 4]], dtype=np.uint8)), [[1, 2], [3, 4]])
        self.assertEqual(bridge_module.to_jsonable(np.array([np.array([1.0]), 'a'], dtype=object)), [[1.0], 'a'])
        self.assertEqual(bridge_module.to_jsonable({np.int64(3): 1}), {'3': 1})
        counter = {'non_finite': 0}
        self.assertIsNone(bridge_module.to_jsonable(np.array(np.nan), counter))
        self.assertEqual(counter['non_finite'], 1)
        counter = {'non_finite': 0}
        self.assertEqual(bridge_module.to_jsonable(np.array([[1.0, np.inf], [np.nan, 2.0]]), counter),
                         [[1.0, None], [None, 2.0]])
        self.assertEqual(counter['non_finite'], 2)

    def test_conflicting_dict_keys_are_rejected(self):
        with self.assertRaises(ValueError):
            bridge_module.to_jsonable({1: 'a', '1': 'b'})
        with self.assertRaises(ValueError):
            bridge_module.to_jsonable({np.int64(1): 'a', '1': 'b'})

    def test_unsupported_keys_and_dtypes_are_rejected(self):
        for bad in ({(1, 2): 'x'}, {1.5: 'x'}, {None: 'x'}, {True: 'x'},
                    np.array(['2020-01-01'], dtype='datetime64[D]'),
                    np.array([(1, 2.0)], dtype=[('a', 'i4'), ('b', 'f8')]),
                    np.array([b'x']), np.complex64(1 + 1j), np.timedelta64(1, 's')):
            with self.assertRaises(TypeError, msg=repr(bad)):
                bridge_module.to_jsonable(bad)

    def test_unsupported_types_raise(self):
        for bad in (np.array([1 + 2j]), object(), b'bytes', {1, 2}):
            with self.assertRaises(TypeError):
                bridge_module.to_jsonable(bad)


class ResponseEncodingTests(unittest.TestCase):
    def setUp(self):
        self.bridge = bridge_module.EnhancedAudioProcessingBridge()

    def encode(self, result):
        return self.bridge._encode_response(bridge_module.AudioProcessingResponse(
            success=True, result=result, error=None, processing_time=0.1, request_id='r1'))

    def test_encoding_is_single_line_strict_json(self):
        line = self.encode({'signal': np.array([0.0, np.nan]), 'text': 'é\n'})
        self.assertNotIn('\n', line)
        def reject_constant(token):
            raise AssertionError(f'bare {token} literal in JSON')
        json.loads(line, parse_constant=reject_constant)
        parsed = json.loads(line)
        self.assertFalse(parsed['success'])  # NaN/Inf must never be reported as success
        self.assertEqual(parsed['result'], {})
        self.assertIn('non-finite', parsed['error'])
        self.assertEqual(parsed['non_finite_count'], 1)

    def test_conflicting_keys_answer_with_error_response(self):
        import io
        original, sys.stdout = sys.stdout, io.StringIO()
        try:
            asyncio.run(self.bridge._send_response(bridge_module.AudioProcessingResponse(
                success=True, result={1: 'a', '1': 'b'}, error=None, processing_time=0.0, request_id='k')))
            out = sys.stdout.getvalue().splitlines()
        finally:
            sys.stdout = original
        parsed = json.loads(out[0])
        self.assertFalse(parsed['success'])
        self.assertIn('Conflicting', parsed['error'])

    def test_unserializable_result_still_answers_request_with_error(self):
        captured = []
        original = sys.stdout
        import io
        sys.stdout = io.StringIO()
        try:
            asyncio.run(self.bridge._send_response(bridge_module.AudioProcessingResponse(
                success=True, result={'bad': object()}, error=None, processing_time=0.0, request_id='r9')))
            captured = sys.stdout.getvalue().splitlines()
        finally:
            sys.stdout = original
        self.assertEqual(len(captured), 1)
        parsed = json.loads(captured[0])
        self.assertFalse(parsed['success'])
        self.assertEqual(parsed['request_id'], 'r9')
        self.assertIn('serialize', parsed['error'])


class ProtocolSubprocessTests(unittest.TestCase):
    def test_pipeline_short_and_large_signals_match_direct_execution(self):
        sizes = (100, 4500)
        requests = [{'operation': 'complete_audio_pipeline',
                     'parameters': {'signal': sine(n), 'config': {}},
                     'request_id': f'p{n}'} for n in sizes]
        proc = run_bridge(requests)
        self.assertEqual(proc.returncode, 0, proc.stderr[-500:])

        lines = proc.stdout.splitlines()
        messages = [json.loads(line) for line in lines]  # every stdout line is protocol JSON
        self.assertEqual(messages[0]['status'], 'ready')
        by_id = {m['request_id']: m for m in messages[1:]}
        bridge = bridge_module.EnhancedAudioProcessingBridge()
        for n in sizes:
            msg = by_id[f'p{n}']
            self.assertTrue(msg['success'], msg.get('error'))
            direct = bridge_module.to_jsonable(asyncio.run(
                bridge._route_operation('complete_audio_pipeline', {'signal': sine(n), 'config': {}})))
            assert_close(self, direct, msg['result'])
            self.assertEqual(len(msg['result']), n)

    def test_logs_go_to_stderr_not_stdout(self):
        proc = run_bridge([{'operation': 'get_system_status', 'parameters': {}, 'request_id': 's'}])
        self.assertIn('INFO', proc.stderr)
        for line in proc.stdout.splitlines():
            self.assertNotIn(' - INFO - ', line)
            json.loads(line)

    def test_unknown_operation_returns_error_response(self):
        proc = run_bridge([{'operation': 'nope', 'parameters': {}, 'request_id': 'u'}])
        msg = json.loads(proc.stdout.splitlines()[1])
        self.assertFalse(msg['success'])
        self.assertEqual(msg['request_id'], 'u')
        self.assertIn('Unknown operation', msg['error'])

    def test_exits_cleanly_on_stdin_eof(self):
        proc = run_bridge([], timeout=30)  # would spin forever before the EOF fix
        self.assertEqual(proc.returncode, 0)


if __name__ == '__main__':
    unittest.main()
