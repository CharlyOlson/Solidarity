"""
Regression test for the import paths in src/main_integration.py.

Only imports are exercised. The demo/main pipeline is deliberately NOT run
here: its reported stall is a separate issue.
Run: REQUIRE_PYTHON_INTEGRATION=1 python3 -m unittest tests/test_main_integration_imports.py
"""
import os
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MODULE = os.path.join(ROOT, 'src', 'main_integration.py')

try:
    import numpy  # noqa: F401
except ImportError:
    if os.environ.get('REQUIRE_PYTHON_INTEGRATION') == '1':
        raise
    raise unittest.SkipTest('numpy unavailable')

LOAD = (
    "import importlib.util, sys\n"
    f"spec = importlib.util.spec_from_file_location('main_integration', {MODULE!r})\n"
    "m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)\n"
)


class MainIntegrationImportTests(unittest.TestCase):
    def run_snippet(self, code):
        # Foreign cwd and no PYTHONPATH: the module must find its own components
        env = {k: v for k, v in os.environ.items() if k != 'PYTHONPATH'}
        with tempfile.TemporaryDirectory() as tmp:
            return subprocess.run([sys.executable, '-c', LOAD + code], cwd=tmp, env=env,
                                  capture_output=True, text=True, timeout=60)

    def test_imports_without_external_path_help(self):
        proc = self.run_snippet("print(m.SolidarityHarmonicSystem.__name__)\n")
        self.assertEqual(proc.returncode, 0, proc.stderr[-800:])
        self.assertIn('SolidarityHarmonicSystem', proc.stdout)

    def test_component_modules_resolve_inside_src(self):
        proc = self.run_snippet(
            "for n in ('core_harmonics','advanced_analysis','dynamic_processing','audio_zoom','temporal_control'):\n"
            "    print(n, sys.modules[n].__file__)\n")
        self.assertEqual(proc.returncode, 0, proc.stderr[-800:])
        src = os.path.join(ROOT, 'src') + os.sep
        lines = proc.stdout.strip().splitlines()
        self.assertEqual(len(lines), 5)
        for line in lines:
            self.assertTrue(line.split(' ', 1)[1].startswith(src), line)


if __name__ == '__main__':
    unittest.main()
