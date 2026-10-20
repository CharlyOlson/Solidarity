"""Regression tests for audio stress-process supervision."""

import json
import sys
import time
import unittest
from unittest import mock

from tests.audio_stack_limits import (
    MAX_CAPTURE_BYTES,
    MAX_RSS_BYTES,
    planned_sizes,
    run_and_record,
    worker_main,
    supervised_run,
    worker_rate_probe,
)


class AudioStackHarnessTests(unittest.TestCase):
    def test_short_length_schedule_covers_zero_through_sixteen(self):
        self.assertTrue(set(range(17)).issubset(planned_sizes()))

    def test_rate_probe_assertions_are_serializable_and_pass_at_all_rates(self):
        for sample_rate_hz in (16000, 44100, 48000):
            with self.subTest(sample_rate_hz=sample_rate_hz):
                result = worker_rate_probe({"sample_rate": sample_rate_hz})
                json.dumps(result, allow_nan=False)
                self.assertEqual(result["status"], "ok")
                self.assertEqual(result["system_status_sample_rate_hz"], sample_rate_hz)
                self.assertLessEqual(
                    abs(result["reported_frequency_hz"] - 440),
                    result["frequency_tolerance_hz"],
                )

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

    def test_compression_cases_record_that_compression_ran_and_changed_output(self):
        base = {"size": 2048, "signal_kind": "tone", "seed": 7, "sample_rate": 44100,
                "enable_temporal_control": True, "valid_signal": True}
        enabled = worker_main({**base, "enable_compression": True})
        disabled = worker_main({**base, "enable_compression": False})
        self.assertEqual(enabled["status"], "ok")
        self.assertIs(enabled["dynamic_processing_enabled"], True)
        self.assertTrue(enabled["compression_flag_honored"])
        self.assertTrue(enabled["compression_changed_output"])
        self.assertLess(enabled["compression_output_max_abs"], enabled["uncompressed_reference_max_abs"])
        self.assertTrue(enabled["output_checks_passed"])
        self.assertTrue(enabled["analysis_checks_passed"])
        self.assertIs(disabled["dynamic_processing_enabled"], False)
        self.assertNotIn("compression_changed_output", disabled)

    def test_run_and_record_classifies_output_limit(self):
        supervised = {
            "output_limit_triggered": True,
            "memory_limit_triggered": False,
            "timed_out": False,
            "orphan_processes_detected": False,
            "return_code": -9,
            "wall_limit_seconds": 5,
            "truncated_output_streams": ["stdout"],
            "stdout": "x",
            "stderr": "",
        }
        records = []
        case = {"path": "node_case", "name": "output_limit_regression"}
        with mock.patch("tests.audio_stack_limits.supervised_run", return_value=supervised):
            run_and_record(case, records, time.monotonic(), 100, 5, MAX_RSS_BYTES)
        self.assertEqual(records[0]["harness_status"], "output_limit")


if __name__ == "__main__":
    unittest.main()
