"""Regression tests for audio stress-process supervision."""

import sys
import unittest

from tests.audio_stack_limits import MAX_CAPTURE_BYTES, MAX_RSS_BYTES, planned_sizes, supervised_run


class AudioStackHarnessTests(unittest.TestCase):
    def test_short_length_schedule_covers_zero_through_sixteen(self):
        self.assertTrue(set(range(17)).issubset(planned_sizes()))

    def test_supervisor_drains_both_pipes_before_process_exit(self):
        output_bytes = 1024 * 1024
        code = (
            "import sys; "
            f"sys.stdout.buffer.write(b'o' * {output_bytes}); "
            f"sys.stderr.buffer.write(b'e' * {output_bytes})"
        )
        result = supervised_run(
            [sys.executable, "-c", code],
            {},
            timeout_seconds=5,
            memory_limit_bytes=MAX_RSS_BYTES,
            remaining_budget=5,
        )
        self.assertEqual(result["return_code"], 0)
        self.assertFalse(result["timed_out"])
        self.assertFalse(result["output_limit_triggered"])
        self.assertEqual(result["stdout_bytes_drained"], output_bytes)
        self.assertEqual(result["stderr_bytes_drained"], output_bytes)

    def test_supervisor_bounds_capture_and_kills_excessive_output(self):
        code = (
            "import sys; "
            f"chunk = b'x' * {MAX_CAPTURE_BYTES}; "
            "sys.stdout.buffer.write(chunk); sys.stdout.buffer.flush(); "
            "sys.stdout.buffer.write(chunk); sys.stdout.buffer.flush()"
        )
        result = supervised_run(
            [sys.executable, "-c", code],
            {},
            timeout_seconds=5,
            memory_limit_bytes=MAX_RSS_BYTES,
            remaining_budget=5,
        )
        self.assertTrue(result["output_limit_triggered"])
        self.assertLessEqual(len(result["stdout"]), MAX_CAPTURE_BYTES)
        self.assertTrue(result["timed_out"] is False)


if __name__ == "__main__":
    unittest.main()
