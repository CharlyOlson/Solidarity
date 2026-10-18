"""Bounded regression coverage for the main audio pipeline."""

import json
import os
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODULE = os.path.join(ROOT, 'src', 'main_integration.py')

try:
    import numpy  # noqa: F401
    import scipy  # noqa: F401
except ImportError as exc:
    if os.environ.get('REQUIRE_PYTHON_INTEGRATION') == '1':
        raise
    raise unittest.SkipTest(f'Audio dependencies unavailable: {exc}')

RUN_PIPELINE = (
    'import importlib.util, json, numpy as np\n'
    f'spec = importlib.util.spec_from_file_location("main_integration", {MODULE!r})\n'
    'module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)\n'
    'signal = np.sin(2 * np.pi * 440 * np.arange(1024) / 44100)\n'
    'result = module.SolidarityHarmonicSystem().process_audio_with_complete_pipeline(\n'
    '    signal, enable_compression=False)\n'
    'error = float(np.max(np.abs(result["output"]["processed_audio"] - signal * 1.1)))\n'
    'print(json.dumps({"error": error, "diagnostics": result["pipeline_diagnostics"]}))\n'
)


class MainIntegrationPipelineTests(unittest.TestCase):
    def test_1024_sample_pipeline_completes_and_reports_stage_timings(self):
        env = {key: value for key, value in os.environ.items() if key != 'PYTHONPATH'}
        with tempfile.TemporaryDirectory() as cwd:
            result = subprocess.run(
                [sys.executable, '-c', RUN_PIPELINE],
                cwd=cwd,
                env=env,
                capture_output=True,
                text=True,
                timeout=10,
            )

        self.assertEqual(result.returncode, 0, result.stderr[-1000:])
        payload = json.loads(result.stdout)
        self.assertLessEqual(payload['error'], 1e-12)
        diagnostics = payload['diagnostics']
        self.assertEqual(diagnostics['sample_count'], 1024)
        self.assertEqual(diagnostics['sample_rate_hz'], 44100)
        timings = diagnostics['stage_timings_seconds']
        self.assertEqual(
            set(timings),
            {
                'initial_harmonic_analysis',
                'audio_zoom',
                'dynamic_processing',
                'temporal_control',
                'final_harmonic_analysis',
                'total',
            },
        )
        self.assertTrue(all(value >= 0 for value in timings.values()))


if __name__ == '__main__':
    unittest.main()
