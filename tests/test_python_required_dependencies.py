"""Ensure required Python audio suites fail, rather than skip, without NumPy/SciPy."""

import importlib.abc
import io
import json
import os
import subprocess
import sys
import unittest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TESTS = os.path.join(ROOT, "tests")


class RequiredDependencyTests(unittest.TestCase):
    def run_suite_without_dependency(self, module, dependency):
        script = """
import importlib.abc
import io
import json
import os
import sys
import unittest

tests = sys.argv[1]
module = sys.argv[2]
dependency = sys.argv[3]
os.environ["REQUIRE_PYTHON_INTEGRATION"] = "1"
sys.path.insert(0, tests)

class BlockDependency(importlib.abc.MetaPathFinder):
    def find_spec(self, fullname, path=None, target=None):
        if fullname == dependency or fullname.startswith(dependency + "."):
            raise ModuleNotFoundError("injected missing dependency: " + fullname, name=fullname)
        return None

sys.meta_path.insert(0, BlockDependency())
suite = unittest.defaultTestLoader.discover(tests, pattern=module + ".py")
output = io.StringIO()
result = unittest.TextTestRunner(stream=output).run(suite)
print(json.dumps({
    "tests_run": result.testsRun,
    "skipped": len(result.skipped),
    "failures": len(result.failures),
    "errors": len(result.errors),
}))
"""
        env = os.environ.copy()
        env["REQUIRE_PYTHON_INTEGRATION"] = "1"
        result = subprocess.run(
            [sys.executable, "-c", script, TESTS, module, dependency],
            cwd=ROOT,
            env=env,
            capture_output=True,
            text=True,
            timeout=15,
        )
        self.assertEqual(result.returncode, 0, result.stderr[-1000:])
        summary = json.loads(result.stdout.strip().splitlines()[-1])
        self.assertEqual(summary["skipped"], 0, result.stdout)
        self.assertGreater(summary["failures"] + summary["errors"], 0, result.stdout)

    def test_main_pipeline_requires_numpy(self):
        self.run_suite_without_dependency("test_main_integration_pipeline", "numpy")

    def test_main_pipeline_requires_scipy(self):
        self.run_suite_without_dependency("test_main_integration_pipeline", "scipy")

    def test_advanced_audio_suite_requires_numpy(self):
        self.run_suite_without_dependency("test_advanced_audio", "numpy")

    def test_numpy_quick_audio_import_fails_closed(self):
        self.run_suite_without_dependency("test_numpy_quick", "numpy")


if __name__ == "__main__":
    unittest.main()
