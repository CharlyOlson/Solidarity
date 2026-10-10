#!/usr/bin/env python3
"""
Reproducible, seeded synthetic-audio benchmark for the analysis-only Coil layer.

All signals are GENERATED test cases (no measured datasets).  The DSP is
standard FFT peak estimation; nothing here simulates or evidences quantum
behaviour.  No keys, RPC, accounts or funds are used.

Usage:  python3 benchmarks/coil_audio_benchmark.py [--trials N] [--seed S] [--out FILE]
"""
import argparse
import json
import math
import os
import pathlib
import platform
import subprocess
import sys
import time
from fractions import Fraction as F

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "src"))
sys.path.insert(0, os.path.join(ROOT, "src", "audio"))

from analysis.coil_measurement import CoilLayer  # noqa: E402

RATES = (8000, 22050, 44100)
DURATIONS = (0.25, 0.5, 1.0)
SNRS_DB = (None, 20.0, 5.0, 0.0)          # None = clean
PEAK_THRESHOLD = 6.0                       # peak magnitude / median spectrum magnitude
PAD = 8
HENRY_RATIOS = [F(3, 2), F(2), F(3), F(7, 2)]   # 21/14, 14/7, 21/7, 49/14


def families(seed):
    """Matched candidate-ratio families: same count (4) and range; Henry vs alternatives."""
    rng = np.random.default_rng(seed + 991)
    while True:
        r = np.sort(rng.uniform(1.5, 3.5, 4))
        if np.min(np.diff(r)) >= 0.3:
            break
    return {
        "henry": [float(x) for x in HENRY_RATIOS],
        "shifted_x1.1": [float(x) * 1.1 for x in HENRY_RATIOS],
        "random_matched": [float(x) for x in r],
    }


def synth(rng, rate, dur, ratio, snr_db, f1, a2, ph1, ph2, noise_seed):
    n = int(round(rate * dur))
    t = np.arange(n) / rate
    x = np.sin(2 * np.pi * f1 * t + ph1) + a2 * np.sin(2 * np.pi * ratio * f1 * t + ph2)
    if snr_db is not None:
        p = (1.0 + a2 * a2) / 2.0
        sigma = math.sqrt(p / 10 ** (snr_db / 10.0))
        x = x + np.random.default_rng(noise_seed).normal(0.0, sigma, n)
    return x


def spectrum(x, rate):
    n = len(x)
    nfft = 1 << int(math.ceil(math.log2(PAD * n)))
    mag = np.abs(np.fft.rfft(x * np.hanning(n), nfft))
    return mag, rate / nfft, rate / n


def blind_two_tone(x, rate):
    """Blind: no knowledge of truth.  Returns (f_low, f_high, detected) via parabolic peak interpolation."""
    mag, df, res = spectrum(x, rate)
    floor = float(np.median(mag)) + 1e-300
    local = np.where((mag[1:-1] > mag[:-2]) & (mag[1:-1] >= mag[2:]))[0] + 1
    order = local[np.argsort(mag[local])[::-1]]
    min_sep = 4 * res / df
    picks = []
    for k in order:
        if all(abs(k - j) >= min_sep for j in picks):
            picks.append(int(k))
        if len(picks) == 2:
            break
    if len(picks) < 2:
        return None, None, False
    freqs = []
    for k in picks:
        a, b, c = np.log(mag[k - 1] + 1e-300), np.log(mag[k] + 1e-300), np.log(mag[k + 1] + 1e-300)
        den = a - 2 * b + c
        d = 0.5 * (a - c) / den if den != 0 else 0.0
        freqs.append((k + d) * df)
    detected = all(mag[k] / floor >= PEAK_THRESHOLD for k in picks)
    lo, hi = sorted(freqs)
    return lo, hi, detected


def coil_ratio(layer, f_lo, f_hi):
    """Coil of f_hi against the blindly estimated f_lo reference."""
    return layer.measure("frequency", "Hz", f_hi, f_lo, "blind_fft_peak_low")


def run_synthetic(layer, trials, seed):
    fams = families(seed)
    cells, invariance_fail, n_signals = [], 0, 0
    for rate in RATES:
        for dur in DURATIONS:
            for snr in SNRS_DB:
                acc = {k: dict(correct=0, detected=0, relerr=[], n=0) for k in fams}
                for t in range(trials):
                    s = np.random.SeedSequence([seed, rate, int(dur * 1000), 999 if snr is None else int(snr), t])
                    rng = np.random.default_rng(s)
                    f1_max = min(1200.0, 0.45 * rate / 3.85)
                    f1 = rng.uniform(150.0, f1_max)
                    a2 = rng.uniform(0.2, 0.9)
                    ph1, ph2 = rng.uniform(0, 2 * np.pi, 2)
                    noise_seed = int(rng.integers(0, 2 ** 31))
                    idx = t % 4
                    for name, ratios in fams.items():
                        x = synth(rng, rate, dur, ratios[idx], snr, f1, a2, ph1, ph2, noise_seed)
                        n_signals += 1
                        lo, hi, det = blind_two_tone(x, rate)
                        a = acc[name]
                        a["n"] += 1
                        a["detected"] += int(det)
                        if lo is None:
                            a["relerr"].append(1.0)
                            continue
                        m = coil_ratio(layer, lo, hi)
                        c = float(m.coil)
                        for n in (-2, 1, 3):          # rebasing must be exactly invertible
                            if m.rebase(n).coil * F(7) ** n != m.coil:
                                invariance_fail += 1
                        a["relerr"].append(abs(c - ratios[idx]) / ratios[idx])
                        best = min(range(4), key=lambda j: abs(c - ratios[j]))
                        a["correct"] += int(best == idx)
                cells.append({"rate": rate, "duration_s": dur,
                              "snr_db": "clean" if snr is None else snr,
                              "families": {k: {"n": v["n"],
                                               "accuracy": v["correct"] / v["n"],
                                               "detection_rate": v["detected"] / v["n"],
                                               "median_rel_error": float(np.median(v["relerr"]))}
                                           for k, v in acc.items()}})
    return fams, cells, n_signals, invariance_fail


def aggregate(cells):
    out = {}
    for key in cells[0]["families"]:
        for label, sel in (("all", lambda c: True),
                           ("clean", lambda c: c["snr_db"] == "clean"),
                           ("snr0dB", lambda c: c["snr_db"] == 0.0)):
            cs = [c["families"][key] for c in cells if sel(c)]
            out.setdefault(key, {})[label] = {
                "mean_accuracy": float(np.mean([c["accuracy"] for c in cs])),
                "mean_detection_rate": float(np.mean([c["detection_rate"] for c in cs])),
                "mean_median_rel_error": float(np.mean([c["median_rel_error"] for c in cs]))}
    return out


def false_alarms(trials, seed):
    """Noise-only signals: how often the blind detector claims two tones."""
    res = {}
    for rate in RATES:
        hits = 0
        for t in range(trials):
            x = np.random.default_rng([seed, rate, 77, t]).normal(0, 1, int(rate * 0.5))
            hits += int(blind_two_tone(x, rate)[2])
        res[str(rate)] = {"n": trials, "false_alarm_rate": hits / trials}
    return res


def processor_integration(layer, trials, seed):
    """Real wiring: src/audio/solidarityAudioProcessor.py (also run via src/ copy check)."""
    import solidarityAudioProcessor as sap
    rate = 44100
    pro = sap.ProfessionalAudioProcessor()
    master = sap.MasterSolidarityAudioSystem()
    fam = families(seed)["henry"]
    rows = {"harmonic_analyzer": [], "pipeline": {}}
    configs = {
        "disabled(config={})": {},
        "compressor+limiter": {"professional_effects": {"compressor": {}, "limiter": {}}},
        "frequency_shifter(default 100 bins)": {"professional_effects": {"frequency_shifter": {}}},
        "use_spatial_processing": {"use_spatial_processing": True},
        "spatial_transmission": {"spatial_transmission": True},
    }
    pstat = {k: dict(n=0, errors=0, noop=0, preserved=0, relerr=[], exc={}) for k in configs}
    for t in range(trials):
        rng = np.random.default_rng([seed, 4410, t])
        f1 = rng.uniform(150, 1000)
        a2, ph = rng.uniform(0.2, 0.9), rng.uniform(0, 2 * np.pi, 2)
        idx = t % 4
        x = synth(rng, rate, 0.5, fam[idx], 20.0, f1, a2, ph[0], ph[1], int(rng.integers(0, 2 ** 31)))
        lo, hi, _ = blind_two_tone(x, rate)
        base = float(coil_ratio(layer, lo, hi).coil)
        # analyzer path: contiguous above-threshold bins -> magnitude-weighted centroids
        peaks = pro.harmonic_analyzer(x)
        pts = sorted((v["frequency"], v["magnitude"]) for v in peaks.values() if v["frequency"] > 0)
        clusters, cur = [], []
        for fr, mg in pts:
            if cur and fr - cur[-1][0] > 2 * rate / len(x):
                clusters.append(cur); cur = []
            cur.append((fr, mg))
        if cur:
            clusters.append(cur)
        clusters = sorted(clusters, key=lambda c: -max(m for _, m in c))[:2]
        if len(clusters) == 2:
            cents = sorted(sum(f * m for f, m in c) / sum(m for _, m in c) for c in clusters)
            rows["harmonic_analyzer"].append(abs(float(coil_ratio(layer, cents[0], cents[1]).coil) - fam[idx]) / fam[idx])
        else:
            rows["harmonic_analyzer"].append(None)
        for name, cfg in configs.items():
            st = pstat[name]
            st["n"] += 1
            np.random.seed(seed + t)            # processors use the global RNG in places
            try:
                y = np.asarray(master.process_complete_audio_pipeline(x.copy(), cfg), dtype=float)
                if y.ndim > 1:
                    y = y[:, 0]
                st["noop"] += int(y.shape == x.shape and np.array_equal(y, x))
                l2, h2, _ = blind_two_tone(y, rate)
                if l2 is None:
                    st["errors"] += 1
                    continue
                c2 = float(coil_ratio(layer, l2, h2).coil)
                st["preserved"] += int(abs(c2 - base) / base < 1e-3)
                st["relerr"].append(abs(c2 - fam[idx]) / fam[idx])
            except Exception as e:
                st["errors"] += 1
                st["exc"][type(e).__name__] = st["exc"].get(type(e).__name__, 0) + 1
    ha = [v for v in rows["harmonic_analyzer"] if v is not None]
    rows["harmonic_analyzer"] = {"n": trials, "no_two_cluster": trials - len(ha),
                                 "median_rel_error": float(np.median(ha)) if ha else None,
                                 "note": "hardcodes 44100 Hz; returns all bins >10% of max, not peaks"}
    rows["pipeline"] = {k: {"n": v["n"], "errors_or_unmeasurable": v["errors"],
                            "output_identical_to_input": v["noop"],
                            "exception_types": v["exc"],
                            "coil_preserved_within_1e-3": v["preserved"],
                            "median_rel_error_vs_truth": float(np.median(v["relerr"])) if v["relerr"] else None}
                        for k, v in pstat.items()}
    # swallowed-exception check: does each pipeline "effect" actually run when called directly?
    direct = {}
    for eff in ("compressor", "limiter", "frequency_shifter"):
        try:
            getattr(pro, eff)(x)
            direct[eff] = "ok"
        except Exception as e:
            direct[eff] = f"raises {type(e).__name__}"
    rows["direct_effect_calls"] = direct
    rows["identical_processor_copies"] = (
        pathlib.Path(ROOT, "src", "solidarityAudioProcessor.py").read_bytes()
        == pathlib.Path(ROOT, "src", "audio", "solidarityAudioProcessor.py").read_bytes())
    return rows


def js_wrapper_probe():
    """JS wrapper -> Python bridge round trip with a SHORT signal (stdout chunking limit)."""
    script = r"""
const { EnhancedAudioProcessingWrapper } = require(%r);
const log = console.log; console.log = () => {}; console.error = () => {};
(async () => {
  const out = {};
  const w = new EnhancedAudioProcessingWrapper({ pythonExecutable: 'python3', timeout: 8000 });
  try {
    await w.initialize();
    const sig = Array.from({ length: 128 }, (_, i) => 0.9 * Math.sin(2 * Math.PI * 5 * i / 128));
    const r = await w.applyProfessionalEffects(sig, ['compressor']);
    out.short_signal = { ok: true, keys: Object.keys(r.result || {}).sort(), n: ((r.result || {}).processed_signal || []).length, processed_signal: (r.result || {}).processed_signal || null };
    out.short_input = sig;
    try { await w.processCompleteAudioPipeline(sig, {}); out.complete_pipeline = { ok: true }; }
    catch (e) { out.complete_pipeline = { ok: false, error: String(e.message) }; }
    const big = Array.from({ length: 4000 }, (_, i) => Math.sin(i / 10));
    try { await w.applyProfessionalEffects(big, ['compressor']); out.large_signal = { ok: true }; }
    catch (e) { out.large_signal = { ok: false, error: String(e.message) }; }
  } catch (e) { out.init_error = String(e.message); }
  try { await w.shutdown(); } catch (e) {}
  log(JSON.stringify(out)); process.exit(0);
})();
""" % os.path.join(ROOT, "src", "enhancedAudioProcessingWrapper.js")
    try:
        p = subprocess.run(["node", "-e", script], capture_output=True, text=True, timeout=120, cwd=ROOT)
        res = json.loads(p.stdout.strip().splitlines()[-1])
    except Exception as e:  # report honestly instead of failing the run
        return {"error": f"{type(e).__name__}: {e}"}
    if res.get("short_signal", {}).get("processed_signal"):
        import solidarityAudioProcessor as sap
        direct = sap.ProfessionalAudioProcessor().compressor(np.array(res.pop("short_input")))
        got = np.array(res["short_signal"].pop("processed_signal"))
        res["short_signal"]["matches_direct_python_call"] = bool(np.allclose(direct, got))
    return res


def node_inventory():
    try:
        p = subprocess.run(["node", os.path.join(ROOT, "benchmarks", "node_inventory_probe.js")],
                           capture_output=True, text=True, timeout=120, cwd=ROOT)
        return json.loads(p.stdout.strip().splitlines()[-1])
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}


def environment():
    def sh(cmd):
        try:
            return subprocess.run(cmd, capture_output=True, text=True, timeout=30, cwd=ROOT).stdout.strip()
        except Exception as e:
            return f"unavailable: {e}"
    import scipy
    return {"commit": sh(["git", "rev-parse", "HEAD"]), "dirty_files": sh(["git", "status", "--short"]).splitlines(),
            "python": sys.version.split()[0], "numpy": np.__version__, "scipy": scipy.__version__,
            "node": sh(["node", "--version"]), "platform": platform.platform(),
            "argv": sys.argv}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trials", type=int, default=20, help="signals per grid cell and family")
    ap.add_argument("--proc-trials", type=int, default=20)
    ap.add_argument("--seed", type=int, default=20260101)
    ap.add_argument("--out", default=os.path.join(ROOT, "docs", "coil_benchmark_results.json"))
    a = ap.parse_args()
    layer = CoilLayer(enabled=True)
    t0 = time.time()
    fams, cells, n_signals, inv_fail = run_synthetic(layer, a.trials, a.seed)
    res = {
        "environment": environment(),
        "parameters": {"seed": a.seed, "trials_per_cell_and_family": a.trials, "rates": RATES,
                       "durations_s": DURATIONS, "snr_db": ["clean" if s is None else s for s in SNRS_DB],
                       "peak_threshold": PEAK_THRESHOLD, "fft_pad": PAD, "families": fams,
                       "data_kind": "generated synthetic signals; no measured datasets"},
        "synthetic": {"n_signals": n_signals, "n_cells": len(cells), "rebase_invariance_failures": inv_fail,
                      "aggregate": aggregate(cells), "cells": cells},
        "noise_only_false_alarms": false_alarms(a.trials, a.seed),
        "processor_integration": processor_integration(layer, a.proc_trials, a.seed),
        "js_wrapper_bridge": js_wrapper_probe(),
        "node_probes": node_inventory(),
        "runtime_s": round(time.time() - t0, 1),
    }
    with open(a.out, "w") as fh:
        json.dump(res, fh, indent=1, sort_keys=True, default=float)
    print(json.dumps({"n_signals": n_signals, "aggregate": res["synthetic"]["aggregate"],
                      "rebase_invariance_failures": inv_fail, "runtime_s": res["runtime_s"]}, indent=1))


if __name__ == "__main__":
    main()
