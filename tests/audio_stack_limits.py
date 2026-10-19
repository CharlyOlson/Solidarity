#!/usr/bin/env python3
"""Opt-in, externally supervised limits probe for the two Solidarity audio paths."""

import argparse
import csv
import hashlib
import json
import math
import os
import platform
import selectors
import signal
import subprocess
import sys
import time
import traceback
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NODE_CASE = ROOT / "tests" / "audio_stack_bridge_case.js"
MAX_WALL_SECONDS = 60
MAX_AGGREGATE_SECONDS = 30 * 60
MAX_RSS_BYTES = 1024**3
MAX_CAPTURE_BYTES = 4 * 1024**2
STRESS_SIZES = (128, 1024, 4500, 20000, 50000, 100000, 250000, 500000, 1000000)
SIGNAL_KINDS = ("silence", "dc", "impulse", "tone", "mixed", "noise", "tiny", "large")
PRIME_SIZES = (5, 7, 11, 13, 17, 31, 127, 257, 509, 1021, 4093)
BENCHMARK_SIZES = {128, 1024, 4500, 20000, 50000}


def _is_prime(value):
    if value < 2:
        return False
    return all(value % divisor for divisor in range(2, math.isqrt(value) + 1))


def planned_sizes():
    sizes = {*range(17), *PRIME_SIZES, *STRESS_SIZES}
    for exponent in range(20):
        power = 1 << exponent
        for value in (power - 1, power, power + 1):
            if 0 <= value <= 1_000_000:
                sizes.add(value)
    return sorted(sizes)


def size_classes(size):
    labels = []
    if size in (0, 1, 2, 3):
        labels.append("minimum")
    if size and size & (size - 1) == 0:
        labels.append("power_of_two")
    if any(size == (1 << exponent) + delta for exponent in range(20) for delta in (-1, 1)):
        labels.append("adjacent_to_power")
    if _is_prime(size):
        labels.append("prime")
    if size in STRESS_SIZES:
        labels.append("requested_stress_size")
    return labels or ["boundary"]


def worker_signal(np, case):
    size = int(case.get("size", 128))
    kind = case.get("signal_kind", "tone")
    seed = int(case.get("seed", 314159))

    if kind == "scalar":
        return np.asarray(0.5)
    if kind == "python_list":
        return [0.25] * size
    if kind == "integer_dtype":
        return np.arange(size, dtype=np.int32)
    if kind == "two_dimensional":
        return np.arange(max(size, 1) * 2, dtype=np.float64).reshape(max(size, 1), 2) / 100
    if kind == "non_contiguous":
        return np.arange(size * 2, dtype=np.float64)[::2] / 100
    if kind == "string_dtype":
        return np.asarray(["audio"] * size)
    if kind == "object_dtype":
        return np.asarray([object() for _ in range(size)], dtype=object)
    if kind == "nan":
        values = np.zeros(size, dtype=np.float64)
        if size:
            values[0] = np.nan
        return values
    if kind == "infinity":
        values = np.zeros(size, dtype=np.float64)
        if size:
            values[0] = np.inf
        if size > 1:
            values[1] = -np.inf
        return values

    index = np.arange(size, dtype=np.float64)
    phase = 2 * np.pi * (seed % 360) / 360
    if kind == "silence":
        return np.zeros(size, dtype=np.float64)
    if kind == "dc":
        return np.full(size, 0.25, dtype=np.float64)
    if kind == "impulse":
        values = np.zeros(size, dtype=np.float64)
        if size:
            values[size // 2] = 1.0
        return values
    if kind == "tone":
        return 0.5 * np.sin(2 * np.pi * 440 * index / 44100 + phase)
    if kind == "mixed":
        return (0.35 * np.sin(2 * np.pi * 440 * index / 44100 + phase)
                + 0.15 * np.sin(2 * np.pi * 880 * index / 44100 + 2 * phase))
    if kind == "noise":
        return np.random.default_rng(seed).standard_normal(size)
    if kind == "tiny":
        return 1e-200 * np.sin(2 * np.pi * 440 * index / 44100 + phase)
    if kind == "large":
        return 1e150 * np.sin(2 * np.pi * 440 * index / 44100 + phase)
    raise ValueError(f"Unknown signal kind: {kind}")


def worker_main(case):
    import numpy as np

    sys.path.insert(0, str(ROOT / "src"))
    from main_integration import SolidarityHarmonicSystem

    kind = case.get("signal_kind", "tone")
    sample_rate = int(case.get("sample_rate", 44100))
    signal_data = worker_signal(np, case)
    before = signal_data.copy()
    system = SolidarityHarmonicSystem(sample_rate=sample_rate)
    enable_compression = bool(case.get("enable_compression", False))
    enable_temporal = bool(case.get("enable_temporal_control", True))
    started = time.perf_counter()
    result = system.process_audio_with_complete_pipeline(
        signal_data,
        enable_compression=enable_compression,
        enable_temporal_control=enable_temporal,
    )
    wall_seconds = time.perf_counter() - started
    output = np.asarray(result["output"]["processed_audio"])
    mutation = not np.array_equal(signal_data, before, equal_nan=True)
    expected = None
    max_abs_error = None
    reference_applies = not enable_compression
    if reference_applies:
        expected = signal_data * (1.1 if enable_temporal else 1.0)
        if expected.shape == output.shape and expected.size:
            delta = np.abs(output - expected)
            max_abs_error = float(np.nanmax(delta))
        elif expected.shape == output.shape:
            max_abs_error = 0.0

    diagnostics = result["pipeline_diagnostics"]
    non_finite_metrics = []
    invalid_non_finite_metrics = []
    thd_analysis = result.get("harmonic_analysis", {}).get("thd", {})
    for section_name, section in result.get("harmonic_analysis", {}).items():
        if isinstance(section, dict):
            for name, value in section.items():
                if isinstance(value, (int, float, np.number)) and not np.isfinite(value):
                    non_finite_metrics.append(f"{section_name}.{name}")
                    meaningful_negative_infinity = (
                        section_name == "thd"
                        and name == "thd_db"
                        and np.isneginf(value)
                        and thd_analysis.get("fundamental_power") == 0
                    )
                    if not meaningful_negative_infinity:
                        invalid_non_finite_metrics.append(f"{section_name}.{name}")

    record = {
        "status": "ok",
        "path": "main_integration",
        "size": int(signal_data.shape[0]) if signal_data.ndim else 1,
        "signal_kind": kind,
        "input_shape": list(signal_data.shape),
        "input_dtype": str(signal_data.dtype),
        "input_contiguous": bool(signal_data.flags.c_contiguous),
        "sample_rate_hz": sample_rate,
        "fundamental_frequency_hz": result["input"]["fundamental_frequency"],
        "enable_compression": enable_compression,
        "enable_temporal_control": enable_temporal,
        "output_shape": list(output.shape),
        "output_finite": bool(np.isfinite(output).all()),
        "input_mutated": mutation,
        "reference_applies": reference_applies,
        "reference_max_abs_error": max_abs_error,
        "reference_within_tolerance": (
            None if max_abs_error is None
            else bool(np.allclose(output, expected, atol=1e-12, rtol=1e-9, equal_nan=True))
        ),
        "non_finite_metric_fields": non_finite_metrics,
        "invalid_non_finite_metric_fields": invalid_non_finite_metrics,
        "total_samples_processed": result["system_state"]["total_samples_processed"],
        "stage_timings_seconds": diagnostics["stage_timings_seconds"],
        "worker_wall_seconds": wall_seconds,
    }
    if kind == "tone" and signal_data.size < 20 and result["input"]["fundamental_frequency"] <= 0:
        record["status"] = "observed_undefined_result"
        record["classification"] = "short_tone_has_no_non_dc_hps_candidate"

    if case.get("repeatability"):
        fresh = SolidarityHarmonicSystem(sample_rate=sample_rate)
        fresh_initial_samples = fresh.system_state["total_samples_processed"]
        fresh_output = np.asarray(fresh.process_audio_with_complete_pipeline(
            signal_data.copy(),
            enable_compression=enable_compression,
            enable_temporal_control=enable_temporal,
        )["output"]["processed_audio"])
        same_instance_output = np.asarray(system.process_audio_with_complete_pipeline(
            signal_data.copy(),
            enable_compression=enable_compression,
            enable_temporal_control=enable_temporal,
        )["output"]["processed_audio"])
        record["fresh_instance_repeatable"] = bool(np.array_equal(output, fresh_output, equal_nan=True))
        record["sequential_same_instance_output_equal"] = bool(
            np.array_equal(output, same_instance_output, equal_nan=True)
        )
        record["sequential_total_samples_processed"] = system.system_state["total_samples_processed"]
        record["fresh_instance_initial_samples"] = fresh_initial_samples

    if case.get("shared_controller"):
        controller = system.temporal_controller
        repetitions = int(case.get("concurrency_repetitions", 32))
        workers = int(case.get("concurrency_workers", 4))
        sample = np.ones(128, dtype=np.float64)
        initial_state = controller.get_complete_temporal_state()
        initial_cog_samples = initial_state["cog_controller"]["samples_processed"]
        initial_lock_samples = initial_state["lock_stop_controller"]["current_time"]

        def run_once(_):
            return controller.process_with_temporal_control(sample, lambda values: values.copy())

        with ThreadPoolExecutor(max_workers=workers) as pool:
            values = list(pool.map(run_once, range(repetitions)))
        state = controller.get_complete_temporal_state()
        cog_count = state["cog_controller"]["samples_processed"]
        lock_count = state["lock_stop_controller"]["current_time"]
        expected_cog_samples = initial_cog_samples + repetitions * len(sample)
        expected_lock_samples = initial_lock_samples + repetitions * len(sample)
        record["shared_controller_calls"] = len(values)
        record["shared_controller_workers"] = workers
        record["shared_controller_expected_samples"] = repetitions * len(sample)
        record["shared_controller_initial_cog_samples"] = initial_cog_samples
        record["shared_controller_initial_lock_samples"] = initial_lock_samples
        record["shared_controller_cog_samples"] = cog_count
        record["shared_controller_lock_samples"] = lock_count
        record["shared_controller_shape_ok"] = all(value.shape == sample.shape for value in values)
        record["shared_controller_state_consistent"] = (
            cog_count == expected_cog_samples and lock_count == expected_lock_samples
        )
        if not record["shared_controller_state_consistent"] or not record["shared_controller_shape_ok"]:
            record["status"] = "fail"

    if case.get("valid_signal", True):
        checks = [
            output.shape == signal_data.shape,
            bool(np.isfinite(output).all()),
            not mutation,
            record["reference_within_tolerance"] is not False,
            not invalid_non_finite_metrics,
        ]
        if checks and not all(checks):
            record["status"] = "fail"
    else:
        record["status"] = "observed_unspecified_input"
    return record


def worker_rate_probe(case):
    import numpy as np

    sys.path.insert(0, str(ROOT / "src"))
    from solidarityAudioProcessor import ProfessionalAudioProcessor
    from main_integration import SolidarityHarmonicSystem

    sample_rate = int(case["sample_rate"])
    length = sample_rate
    signal_data = np.sin(2 * np.pi * 440 * np.arange(length) / sample_rate)
    processor = ProfessionalAudioProcessor(sample_rate_hz=sample_rate)
    analysis = processor.harmonic_analyzer(signal_data)
    dominant = max(analysis.values(), key=lambda entry: entry["magnitude"])
    system = SolidarityHarmonicSystem(sample_rate_hz=sample_rate)
    pipeline_result = system.process_audio_with_complete_pipeline(
        signal_data,
        enable_compression=False,
        enable_temporal_control=False,
    )
    pipeline_analysis = system.advanced_analyzer.analyze_harmonics_fft(signal_data, 440, 1)[1]
    tolerance = sample_rate / length
    processor_matches = abs(dominant["frequency"] - 440) <= tolerance
    analyzer_matches = abs(pipeline_analysis["actual_frequency"] - 440) <= tolerance
    status_matches = system.get_complete_system_status()["system"]["sample_rate_hz"] == sample_rate
    return {
        "status": "ok" if processor_matches and analyzer_matches and status_matches else "fail",
        "path": "main_integration",
        "size": length,
        "signal_kind": "440_hz_tone",
        "sample_rate_hz": sample_rate,
        "expected_frequency_hz": 440,
        "reported_frequency_hz": dominant["frequency"],
        "processor_rate_matches": processor_matches,
        "pipeline_analyzer_frequency_hz": pipeline_analysis["actual_frequency"],
        "pipeline_analyzer_rate_matches": analyzer_matches,
        "system_status_sample_rate_hz": system.get_complete_system_status()["system"]["sample_rate_hz"],
        "system_status_rate_matches": status_matches,
        "pipeline_output_sample_count": len(pipeline_result["output"]["processed_audio"]),
        "frequency_tolerance_hz": tolerance,
        "frequency_ratio_to_expected": dominant["frequency"] / 440,
        "reported_harmonic_count": len(analysis),
        "sample_rate_inconsistency_observed": not (processor_matches and analyzer_matches and status_matches),
        "implementation_note": "Rate assertions use one-second tones and one FFT-bin tolerance",
    }


def worker_overflow_probe(case):
    import warnings
    import numpy as np

    sys.path.insert(0, str(ROOT / "src"))
    from harmonics.advanced_analysis import AdvancedHarmonicAnalyzer

    sample_rate = 44100
    length = 16384
    signal_data = 1e100 * np.sin(2 * np.pi * 440 * np.arange(length) / sample_rate)
    analyzer = AdvancedHarmonicAnalyzer(sample_rate_hz=sample_rate)
    with warnings.catch_warnings(record=True) as captured:
        warnings.simplefilter("always", RuntimeWarning)
        estimate = analyzer.harmonic_product_spectrum(signal_data)
    silence_thd = analyzer.calculate_total_harmonic_distortion(np.zeros(1024), 0)
    overflow_warnings = [str(item.message) for item in captured if "overflow" in str(item.message).lower()]
    return {
        "status": "observed_numerical_overflow" if overflow_warnings else "no_overflow_observed",
        "path": "main_integration",
        "phase": "harmonic_product_overflow",
        "sample_rate_hz": sample_rate,
        "sample_count": length,
        "input_amplitude": 1e100,
        "input_finite": bool(np.isfinite(signal_data).all()),
        "estimated_frequency_hz": estimate,
        "overflow_warnings": overflow_warnings,
        "defined_negative_infinite_thd_db": bool(
            silence_thd["fundamental_power"] == 0 and np.isneginf(silence_thd["thd_db"])
        ),
    }


def worker_entry(case):
    try:
        if case.get("kind") == "main":
            if case.get("phase") == "rate_probe":
                record = worker_rate_probe(case)
            elif case.get("phase") == "harmonic_product_overflow":
                record = worker_overflow_probe(case)
            else:
                record = worker_main(case)
        else:
            raise ValueError(f"Unknown worker kind: {case.get('kind')}")
        print(json.dumps(record, allow_nan=False, separators=(",", ":")))
        return 0
    except Exception as exc:
        short_unspecified = case.get("phase") == "size_sweep" and int(case.get("size", 0)) < 128
        record = {
            "status": "observed_error" if (not case.get("valid_signal", True) or short_unspecified) else "error",
            "path": "main_integration",
            "size": case.get("size"),
            "signal_kind": case.get("signal_kind"),
            "classification": "no_minimum_supported_length_specified" if short_unspecified else None,
            "exception_type": type(exc).__name__,
            "exception": str(exc),
            "traceback": traceback.format_exc(limit=8),
        }
        print(json.dumps(record, allow_nan=False, separators=(",", ":")))
        return 0


def _rss_for_group(pgid):
    total = 0
    try:
        entries = Path("/proc").iterdir()
    except OSError:
        return None
    for entry in entries:
        if not entry.name.isdigit():
            continue
        try:
            stat = (entry / "stat").read_text()
            fields = stat[stat.rfind(")") + 2:].split()
            if int(fields[2]) != pgid:
                continue
            for line in (entry / "status").read_text().splitlines():
                if line.startswith("VmRSS:"):
                    total += int(line.split()[1]) * 1024
                    break
        except (OSError, ValueError, IndexError):
            continue
    return total


def _terminate_group(process):
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    deadline = time.monotonic() + 2
    while time.monotonic() < deadline:
        try:
            os.killpg(process.pid, 0)
        except ProcessLookupError:
            break
        time.sleep(0.05)
    try:
        os.killpg(process.pid, 0)
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    process.wait()


def supervised_run(command, env, timeout_seconds, memory_limit_bytes, remaining_budget):
    timeout_seconds = min(MAX_WALL_SECONDS, timeout_seconds, remaining_budget)
    started = time.monotonic()
    process = subprocess.Popen(
        command,
        cwd=ROOT,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        start_new_session=True,
    )
    selector = selectors.DefaultSelector()
    captures = {"stdout": bytearray(), "stderr": bytearray()}
    total_output_bytes = {"stdout": 0, "stderr": 0}
    truncated_streams = set()
    for name, stream in (("stdout", process.stdout), ("stderr", process.stderr)):
        os.set_blocking(stream.fileno(), False)
        selector.register(stream, selectors.EVENT_READ, name)
    peak_rss = 0
    rss_sampling_available = False
    timed_out = False
    memory_limited = False
    output_limited = False
    cleanup_deadline = None
    while process.poll() is None or selector.get_map():
        rss = _rss_for_group(process.pid)
        if rss is not None:
            rss_sampling_available = True
            peak_rss = max(peak_rss, rss)
            if rss > memory_limit_bytes and not memory_limited:
                memory_limited = True
                _terminate_group(process)
                cleanup_deadline = time.monotonic() + 3
        elapsed = time.monotonic() - started
        if elapsed >= timeout_seconds and not timed_out and (process.poll() is None or selector.get_map()):
            timed_out = True
            _terminate_group(process)
            cleanup_deadline = time.monotonic() + 3
        if cleanup_deadline is not None and time.monotonic() >= cleanup_deadline:
            for key in list(selector.get_map().values()):
                selector.unregister(key.fileobj)
                key.fileobj.close()
            break
        for key, _ in selector.select(0.05):
            try:
                chunk = os.read(key.fd, 65536)
            except BlockingIOError:
                continue
            if not chunk:
                selector.unregister(key.fileobj)
                key.fileobj.close()
                continue
            name = key.data
            total_output_bytes[name] += len(chunk)
            captures[name].extend(chunk)
            if len(captures[name]) > MAX_CAPTURE_BYTES:
                del captures[name][:-MAX_CAPTURE_BYTES]
                truncated_streams.add(name)
            if total_output_bytes[name] > MAX_CAPTURE_BYTES and not output_limited:
                output_limited = True
                _terminate_group(process)
                cleanup_deadline = time.monotonic() + 3
    selector.close()
    process.wait()
    remaining_group_rss = _rss_for_group(process.pid) or 0
    orphan_processes = remaining_group_rss > 0
    if orphan_processes:
        _terminate_group(process)
    elapsed = time.monotonic() - started
    record = {
        "wall_seconds": round(elapsed, 6),
        "return_code": process.returncode,
        "peak_process_group_rss_bytes_sampled": peak_rss,
        "rss_limit_bytes": memory_limit_bytes,
        "rss_sampling_available": rss_sampling_available,
        "wall_limit_seconds": round(timeout_seconds, 3),
        "timed_out": timed_out,
        "memory_limit_triggered": memory_limited,
        "output_limit_triggered": output_limited,
        "output_capture_limit_bytes_per_stream": MAX_CAPTURE_BYTES,
        "stdout_bytes_drained": total_output_bytes["stdout"],
        "stderr_bytes_drained": total_output_bytes["stderr"],
        "truncated_output_streams": sorted(truncated_streams),
        "orphan_processes_detected": orphan_processes,
        "remaining_process_group_rss_bytes": remaining_group_rss,
        "stdout": captures["stdout"].decode("utf-8", errors="replace"),
        "stderr": captures["stderr"].decode("utf-8", errors="replace")[-6000:],
    }
    return record


def run_and_record(case, output_records, start_time, budget_seconds, case_timeout, rss_limit):
    remaining = budget_seconds - (time.monotonic() - start_time)
    case_window = min(case_timeout, MAX_WALL_SECONDS)
    if remaining < case_window:
        output_records.append({
            **WORKTREE_ID,
            **case,
            "harness_status": "not_run_aggregate_budget",
            "case_window_required_seconds": case_window,
            "budget_remaining_seconds": round(max(0, remaining), 3),
        })
        return False
    env = os.environ.copy()
    env["REQUIRE_PYTHON_INTEGRATION"] = "1"
    env["PYTHON"] = os.environ.get("PYTHON", sys.executable)
    env["NODE_OPTIONS"] = "--max-old-space-size=1536"
    env["SOLIDARITY_AUDIO_STRESS"] = "1"
    if case["path"] == "main_integration":
        command = [env["PYTHON"], str(Path(__file__).resolve()), "--worker", json.dumps(case)]
    else:
        command = ["node", str(NODE_CASE), json.dumps(case)]

    supervised = supervised_run(
        command,
        env,
        min(case_timeout, MAX_WALL_SECONDS),
        rss_limit,
        remaining,
    )
    worker_records = []
    if supervised["output_limit_triggered"]:
        combined["harness_status"] = "output_limit"
    if supervised["stdout"].strip() and "stdout" not in supervised["truncated_output_streams"]:
        try:
            worker_records.append(json.loads(supervised["stdout"].strip().splitlines()[-1]))
        except json.JSONDecodeError:
            supervised["stderr"] += "\nWorker produced non-JSON output."
    combined = {
        **case,
        "harness_status": "ok",
        **{key: value for key, value in supervised.items() if key not in ("stdout", "stderr")},
        "worker_stderr": supervised["stderr"],
    }
    if supervised["memory_limit_triggered"]:
        combined["harness_status"] = "memory_limit"
    elif supervised["timed_out"]:
        combined["harness_status"] = (
            "aggregate_budget_interrupted"
            if supervised["wall_limit_seconds"] < case_timeout
            else "timeout"
        )
    elif supervised["orphan_processes_detected"]:
        combined["harness_status"] = "orphan_processes"
    elif supervised["output_limit_triggered"]:
        combined["harness_status"] = "output_limit"
    elif supervised["return_code"] != 0:
        combined["harness_status"] = "process_failure"
    if worker_records:
        combined.update(worker_records[0])
    elif combined["harness_status"] == "ok":
        combined["harness_status"] = "no_worker_record"
    combined = {**WORKTREE_ID, **combined}
    if combined["harness_status"] == "ok" and combined.get("status") in ("fail", "error"):
        combined["harness_status"] = "observed_failure"
    output_records.append(combined)
    return combined["harness_status"] not in (
        "timeout", "memory_limit", "process_failure", "orphan_processes",
        "aggregate_budget_interrupted", "output_limit"
    )


def run_main_cases(records, start_time, budget, case_timeout, rss_limit):
    sizes = planned_sizes()
    warmup = {
        "kind": "main",
        "path": "main_integration",
        "phase": "warmup",
        "case_id": "main-warmup-128-tone",
        "size": 128,
        "signal_kind": "tone",
        "seed": 314287,
        "sample_rate": 44100,
        "enable_compression": False,
        "enable_temporal_control": True,
        "valid_signal": True,
    }
    if not run_and_record(warmup, records, start_time, budget, case_timeout, rss_limit):
        return False
    reps = {}
    for size in sizes:
        reps[size] = 3 if size in BENCHMARK_SIZES else 1
    for size in sizes:
        if time.monotonic() - start_time >= budget:
            break
        kind = "tone"
        if size in STRESS_SIZES:
            kind = SIGNAL_KINDS[STRESS_SIZES.index(size) % len(SIGNAL_KINDS)]
        for repeat in range(reps[size]):
            case = {
                "kind": "main",
                "path": "main_integration",
                "phase": "size_sweep",
                "case_id": f"main-{size}-{kind}-r{repeat + 1}",
                "size": size,
                "size_classes": size_classes(size),
                "signal_kind": kind,
                "seed": 314159 + size,
                "sample_rate": 44100,
                "enable_compression": False,
                "enable_temporal_control": True,
                "valid_signal": True,
                "benchmark_repeat": repeat + 1,
                "benchmark_repeats": reps[size],
            }
            can_continue = run_and_record(case, records, start_time, budget, case_timeout, rss_limit)
            if not can_continue:
                return False

    extras = []
    extras.extend(
        {
            "case_id": f"main-pattern-{name}",
            "phase": "signal_matrix",
            "size": 1024,
            "signal_kind": name,
        }
        for name in SIGNAL_KINDS
    )
    extras.extend(
        {
            "case_id": f"main-flags-c{compression}-t{temporal}",
            "phase": "enable_matrix",
            "size": 1024,
            "signal_kind": "mixed",
            "enable_compression": bool(compression),
            "enable_temporal_control": bool(temporal),
        }
        for compression, temporal in ((0, 0), (0, 1), (1, 0), (1, 1))
    )
    extras.extend(
        {
            "case_id": f"main-rate-{rate}",
            "phase": "sample_rate",
            "size": 1024,
            "signal_kind": "tone",
            "sample_rate": rate,
        }
        for rate in (16000, 44100, 48000)
    )
    extras.extend(
        {
            "case_id": f"main-professional-analyzer-rate-probe-{rate}",
            "phase": "rate_probe",
            "size": 16384,
            "sample_rate": rate,
        }
        for rate in (16000, 44100, 48000)
    )
    extras.append(
        {
            "case_id": f"main-overflow-probe-1e100",
            "phase": "harmonic_product_overflow",
            "size": 16384,
            "signal_kind": "large_finite_tone",
        }
    )
    extras.extend(
        {
            "case_id": f"main-seeded-{kind}-{size}",
            "phase": "seeded_stress",
            "size": size,
            "signal_kind": kind,
            "enable_compression": False,
            "enable_temporal_control": True,
        }
        for kind in ("tone", "mixed", "noise")
        for size in (1024, 20000, 50000, 100000, 250000, 500000, 1000000)
    )
    extras.extend(
        {
            "case_id": f"main-input-{name}",
            "phase": "input_shape_type",
            "size": 128,
            "signal_kind": name,
            "valid_signal": False,
        }
        for name in (
            "non_contiguous", "two_dimensional", "scalar", "python_list", "integer_dtype",
            "string_dtype", "object_dtype", "nan", "infinity",
        )
    )
    extras.append(
        {
            "case_id": "main-repeatability-and-sequential-state",
            "phase": "state",
            "size": 1024,
            "signal_kind": "tone",
            "repeatability": True,
        }
    )
    extras.append(
        {
            "case_id": "main-shared-controller-concurrency",
            "phase": "concurrency",
            "size": 128,
            "signal_kind": "tone",
            "shared_controller": True,
            "concurrency_repetitions": 64,
            "concurrency_workers": 8,
            "valid_signal": True,
        }
    )
    for extra in extras:
        extra.update({
            "kind": "main",
            "path": "main_integration",
            "seed": 314159 + int(extra["size"]),
            "sample_rate": extra.get("sample_rate", 44100),
            "enable_compression": extra.get("enable_compression", False),
            "enable_temporal_control": extra.get("enable_temporal_control", True),
        })
        can_continue = run_and_record(extra, records, start_time, budget, case_timeout, rss_limit)
        if not can_continue:
            return False
    return True


def run_bridge_cases(records, start_time, budget, case_timeout, rss_limit):
    sizes = planned_sizes()
    warmup = {
        "kind": "bridge",
        "path": "js_python_bridge",
        "phase": "warmup",
        "case_id": "bridge-warmup-128-tone",
        "size": 128,
        "signal_kind": "tone",
        "seed": 271956,
    }
    if not run_and_record(warmup, records, start_time, budget, case_timeout, rss_limit):
        return False
    for size in sizes:
        if time.monotonic() - start_time >= budget:
            break
        kind = "tone"
        if size in STRESS_SIZES:
            kind = SIGNAL_KINDS[STRESS_SIZES.index(size) % len(SIGNAL_KINDS)]
        reps = 3 if size in BENCHMARK_SIZES else 1
        for repeat in range(reps):
            case = {
                "kind": "bridge",
                "path": "js_python_bridge",
                "phase": "size_sweep",
                "case_id": f"bridge-{size}-{kind}-r{repeat + 1}",
                "size": size,
                "size_classes": size_classes(size),
                "signal_kind": kind,
                "seed": 271828 + size,
                "benchmark_repeat": repeat + 1,
                "benchmark_repeats": reps,
            }
            can_continue = run_and_record(case, records, start_time, budget, case_timeout, rss_limit)
            if not can_continue:
                return False

    extras = [
        {
            "kind": "bridge",
            "path": "js_python_bridge",
            "phase": "concurrency",
            "case_id": f"bridge-concurrency-{count}",
            "pending_count": count,
        }
        for count in (1, 2, 4, 8)
    ]
    extras.extend(
        {
            "kind": "bridge",
            "path": "js_python_bridge",
            "phase": "sample_rate",
            "case_id": f"bridge-configured-rate-{rate}",
            "sample_rate": rate,
        }
        for rate in (16000, 44100, 48000)
    )
    extras.extend(
        {
            "kind": "bridge",
            "path": "js_python_bridge",
            "phase": "input_shape_type",
            "case_id": f"bridge-input-{name}",
            "size": 8,
            "signal_kind": name,
        }
        for name in ("two_dimensional", "string_dtype", "nan_inf", "null")
    )
    extras.append({
        "kind": "bridge",
        "path": "js_python_bridge",
        "phase": "lifecycle",
        "case_id": "bridge-100-initialize-request-shutdown-cycles",
        "cycles": 100,
    })
    extras.append({
        "kind": "bridge",
        "path": "js_python_bridge",
        "phase": "fault_injection",
        "case_id": "bridge-fault-injection-fixture-set",
    })
    extras.extend(
        {
            "kind": "bridge",
            "path": "js_python_bridge",
            "phase": "seeded_stress",
            "case_id": f"bridge-seeded-{kind}-{size}",
            "size": size,
            "signal_kind": kind,
        }
        for kind in ("tone", "mixed", "noise")
        for size in (1024, 20000, 50000, 100000, 250000, 500000, 1000000)
    )
    for extra in extras:
        extra.setdefault("size", 128)
        extra.setdefault("signal_kind", "tone")
        extra.setdefault("seed", 271828 + int(extra["size"]))
        can_continue = run_and_record(extra, records, start_time, budget, case_timeout, rss_limit)
        if not can_continue:
            return False
    return True


def _resource_snapshot():
    snapshot = {"memory_limit_bytes": MAX_RSS_BYTES, "memory_enforcement": "sampled /proc process-group RSS; supervisor kill"}
    try:
        for line in Path("/proc/meminfo").read_text().splitlines():
            if line.startswith("MemTotal:") or line.startswith("MemAvailable:"):
                name, value, _unit = line.split()
                snapshot[name.rstrip(":") + "_bytes"] = int(value) * 1024
    except OSError:
        snapshot["meminfo_available"] = False
    cgroup = Path("/proc/self/cgroup").read_text().strip().split(":")[-1].lstrip("/")
    path = Path("/sys/fs/cgroup") / cgroup
    snapshot["cgroup_path"] = str(path)
    snapshot["cgroup_memory_max"] = None
    for parent in (path, *path.parents):
        if not str(parent).startswith("/sys/fs/cgroup"):
            continue
        limit = parent / "memory.max"
        if limit.exists():
            snapshot["cgroup_memory_max"] = limit.read_text().strip()
            events = parent / "memory.events"
            if events.exists():
                snapshot["cgroup_memory_events"] = events.read_text().strip()
            break
    snapshot["proc_rss_sampling_available"] = Path("/proc").is_dir()
    return snapshot


def _git_value(*args):
    return subprocess.run(["git", "-C", str(ROOT), *args], check=True, capture_output=True, text=True).stdout.strip()


def write_results(output_dir, metadata, records):
    output_dir.mkdir(parents=True, exist_ok=True)
    payload = {"metadata": metadata, "records": records}
    json_path = output_dir / "audio_stack_limits.json"
    csv_path = output_dir / "audio_stack_limits.csv"
    json_path.write_text(json.dumps(payload, indent=2, allow_nan=False) + "\n")
    columns = sorted({key for record in records for key in record})
    with csv_path.open("w", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for record in records:
            writer.writerow({
                key: json.dumps(value, allow_nan=False, separators=(",", ":"))
                if isinstance(value, (dict, list)) else value
                for key, value in record.items()
            })
    return json_path, csv_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--path", choices=("main", "bridge", "all"), default="all")
    parser.add_argument("--budget-seconds", type=int, default=MAX_AGGREGATE_SECONDS)
    parser.add_argument("--case-timeout-seconds", type=int, default=MAX_WALL_SECONDS)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "tests" / "results")
    args = parser.parse_args()
    if os.environ.get("SOLIDARITY_AUDIO_STRESS") != "1":
        parser.error("Set SOLIDARITY_AUDIO_STRESS=1 to opt in to bounded stress execution.")
    budget = min(MAX_AGGREGATE_SECONDS, max(1, args.budget_seconds))
    case_timeout = min(MAX_WALL_SECONDS, max(1, args.case_timeout_seconds))
    metadata = {
        "started_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "repository": "CharlyOlson/Solidarity",
        "worktree_path": str(ROOT),
        "branch": _git_value("branch", "--show-current"),
        "head_sha": _git_value("rev-parse", "HEAD"),
        "head_tree": _git_value("rev-parse", "HEAD^{tree}"),
        "worktree_dirty_at_start": bool(_git_value("status", "--porcelain")),
        "python": sys.version,
        "node": subprocess.run(["node", "--version"], check=False, capture_output=True, text=True).stdout.strip(),
        "npm": subprocess.run(["npm", "--version"], check=False, capture_output=True, text=True).stdout.strip(),
        "jest": subprocess.run(
            ["node", "-p", "require('./node_modules/jest/package.json').version"],
            cwd=ROOT, check=False, capture_output=True, text=True,
        ).stdout.strip(),
        "numpy_scipy": subprocess.run(
            [os.environ.get("PYTHON", sys.executable), "-c",
             "import numpy,scipy; print(numpy.__version__ + '/' + scipy.__version__)"],
            check=False, capture_output=True, text=True,
        ).stdout.strip(),
        "platform": sys.platform,
        "platform_release": platform.platform(),
        "package_lock_sha256": hashlib.sha256((ROOT / "package-lock.json").read_bytes()).hexdigest(),
        "audio_requirements_sha256": hashlib.sha256((ROOT / "requirements-audio.txt").read_bytes()).hexdigest(),
        "resource_snapshot": _resource_snapshot(),
        "budget_seconds": budget,
        "case_timeout_seconds": case_timeout,
        "requested_path": args.path,
    }
    global WORKTREE_ID
    WORKTREE_ID = {
        "tested_repository": metadata["repository"],
        "tested_worktree": metadata["worktree_path"],
        "tested_branch": metadata["branch"],
        "tested_head_sha": metadata["head_sha"],
        "tested_head_tree": metadata["head_tree"],
    }
    records = []
    started = time.monotonic()
    if args.path in ("main", "all"):
        run_main_cases(records, started, budget, case_timeout, MAX_RSS_BYTES)
    if args.path in ("bridge", "all") and time.monotonic() - started < budget:
        run_bridge_cases(records, started, budget, case_timeout, MAX_RSS_BYTES)
    elapsed = time.monotonic() - started
    metadata["finished_utc"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    metadata["elapsed_seconds"] = round(elapsed, 6)
    metadata["record_count"] = len(records)
    metadata["harness_status_counts"] = {}
    for item in records:
        status = item.get("harness_status", "unknown")
        metadata["harness_status_counts"][status] = metadata["harness_status_counts"].get(status, 0) + 1
    metadata["planned_size_lengths"] = planned_sizes()
    metadata["size_sweep_lengths_by_path"] = {
        path: sorted({
            int(item["size"]) for item in records
            if item.get("path") == path and item.get("phase") == "size_sweep"
            and isinstance(item.get("size"), int)
        })
        for path in ("main_integration", "js_python_bridge")
    }
    metadata["not_started_size_lengths_by_path"] = {
        path: sorted(set(metadata["planned_size_lengths"]) - set(lengths))
        for path, lengths in metadata["size_sweep_lengths_by_path"].items()
    }
    json_path, csv_path = write_results(args.output_dir, metadata, records)
    print(json.dumps({
        "metadata": metadata,
        "json_results": str(json_path),
        "csv_results": str(csv_path),
    }, indent=2))
    return 1 if any(item.get("harness_status") in (
        "timeout",         "memory_limit", "process_failure", "orphan_processes", "output_limit", "observed_failure"
    ) for item in records) else 0


WORKTREE_ID = {}


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--worker":
        raise SystemExit(worker_entry(json.loads(sys.argv[2])))
    raise SystemExit(main())
