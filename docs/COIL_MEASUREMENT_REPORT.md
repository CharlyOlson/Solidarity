# Coil Measurement Layer: Design, Inventory and Results

Status: analysis-only, opt-in. Nothing here touches ledger, payment, token, contract or API paths.
Base commit: `e55fb083b8d8e394cccbe171809344cf4e6ae61b`; final results JSON was regenerated at `23dd422` plus the review-fix edits (numbers identical to the first run, confirming seeded reproducibility).
Open PRs (14, incl. #25) were inspected; none merged, closed or overwritten.

## 1. What was added
| File | Purpose |
|---|---|
| `src/analysis/coil_measurement.py` | `C = q/r` with exact `Fraction` value/reference, quantity kind, native unit, reference provenance, explicit JSON serialization, opt-in `CoilLayer` |
| `tests/test_coil_measurement.py` | 20 generated-case tests |
| `benchmarks/coil_audio_benchmark.py`, `benchmarks/node_inventory_probe.js` | seeded benchmark, processor/bridge integration, JS probes |
| `docs/coil_benchmark_results.json` | raw results of the run below |

"Coil" here is a measurement ratio only. It is separate from the financial COIL currency (1 USD = 10,000,000 Coils) and the data-unit COIL described in `SOLIDARITY_SYSTEM_SPEC.md`; financial kinds/units (`payment`, `ledger`, `token`, `USD`, `COIL`, `wei`, ...) are rejected.

Conventions implemented and tested:
- Rebasing `r' = 7^n r` (q fixed) gives `C' = C/7^n`. Physical scaling `q' = s q` gives `C' = sC`. They are separate methods and tests assert they differ. `|n| <= 64`.
- Exact-scale invariance: a unit change multiplies q and r together and leaves C exactly unchanged.
- First-order covariance propagation with Jacobian `[1/r, -q/r^2]`; shared-reference mode gives correlated Coil values (`Cov(C_i,C_j) = q_i q_j sigma_r^2 / r^4` when q's are uncorrelated). A guard `first_order_valid` flags large `sigma_r/r`.
- Fixed positive `s`: `p_new(c) = s p_old(s c)`; checked against the closed form and by Simpson normalization to 1 (tolerance 1e-9) and against a histogram of samples.
- Seeded sampling for data-dependent scales and node snapping. The snapping rule (nearest node, ties to the lower node, over `[1,3,4,7,14,21,49]`) is an explicit choice made here.
- Quarter-step `p + k p/4, k=0..4` is labelled `experimental`. For p=7 it gives 7, 35/4, 21/2, 49/4, 14; only 7 and 14 are in the sacred-node list. No optimality claim.

## 2. Inventory and actual connections (what the code shows)
| Item | Finding |
|---|---|
| `src/audio/solidarityAudioProcessor.py` vs `src/solidarityAudioProcessor.py` | byte-identical copies |
| `harmonic_analyzer` | hardcodes 44100 Hz; returns every bin above 10% of max, not peaks |
| `enhancedAudioProcessingBridge.py` | imports `solidarityAudioProcessor` (the `src/` copy) |
| `enhancedAudioProcessingWrapper.js` | spawns the bridge; default executable is `python` (only `python3` exists here, so it was configured explicitly) |
| `main_integration.py` | import fails as shipped (`core_harmonics` not found: `sys.path` uses `../harmonics`, files are in `src/harmonics`). With the path supplied externally it imports and initialises, but `process_audio_with_complete_pipeline` did not finish a 1024-sample signal in 60 s (blocker, not investigated further) |
| RJO | no code. Spec defines a Gini-intercept adjustment; the task/instructions describe "nearest node + signed offset". These conflict. No equation was invented; only an explicit snapping helper was added |
| Henry ladder | `SacredNumericSequence.js` loads; spec lists both a 7-node set and a wider set H. Which one a caller wants is left as a parameter |
| Tunneling | `QuantumGoldenProcessor.processKleinTunneling` runs; it is a classical phi-weighted formula, not quantum evidence |
| Greek nodes | `GreekLetterNodesSystem` instantiates alpha/beta/theta/omega (4 classes) |
| Twelve nodes | The only enumeration is a menu in `archive_contracts/enhancedAudioStudioCommands.js`; `utils/README.md` describes 12 nodes of 4 types without a list; contracts tag Nodes 2, 3, 4, 5 only. Node 12 is "Custom/External" (undefined). Connections and equations between the twelve are not specified |

Twelve-part status: NOT a pass. Executed: Node 9 CorrectedSolidaritySystem, Node 10 ComprehensiveSolidarityDiscovery (load+instantiate only). Not executed: Nodes 2-5, 8 (Solidity; `hardhat compile` blocked, cannot download solc offline), Node 1 (no clearly matching file), Node 6 (archived; spec path differs), Node 7 (archived JS, needs Perplexity key path), Node 11 (needs API key, not run), Node 12 (undefined). So at most 2 of 12 executed, with smoke-level depth.

## 3. Environment and commands
Python 3.12.3, numpy 2.5.3, scipy 1.18.1, pytest 9.1.1, Node v22.23.3, Linux x86_64. No keys, RPC, accounts or funds used.

```
npm ci
npx jest --coverage=false
python3 tests/test_numpy_quick.py ; python3 tests/test_discovery.py ; python3 tests/test_advanced_audio.py
python3 -m pytest tests/test_advanced_audio.py tests/test_numpy_quick.py tests/test_coil_measurement.py -rs -q
python3 benchmarks/coil_audio_benchmark.py        # seed 20260101, 20 trials/cell/family, 22.5 s
```

## 4. Existing-suite results (baseline, before and after)
| Suite | Result |
|---|---|
| jest | 3 suites, 8 tests pass |
| test_numpy_quick | OK |
| test_advanced_audio | 4 tests OK, 1 skipped (`transfer_gradient` method not found) |
| test_discovery | 5 tests: 2 FAIL (pre-existing: `comprehensive-discovery.js`, `setup_python_env.py` missing; no OneDrive path), 1 skipped |
| new `test_coil_measurement` | 20 pass |
| imports | `solidarityAudioProcessor`, bridge OK; `main_integration` fails (above) |

## 5. Synthetic benchmark (generated signals, not measured data)
Grid: rates 8000/22050/44100 x durations 0.25/0.5/1.0 s x SNR clean/20/5/0 dB x 3 candidate-ratio families x 20 trials = 2160 signals. Two tones, unequal amplitude (a2 in [0.2,0.9]), random phases, continuous (off-bin) frequencies, paired across families (same f1/amplitudes/phases/noise; only the ratio differs). Blind estimator: Hann FFT, 8x zero-pad, parabolic peak interpolation, no truth used.
Families (4 ratios each): `henry` {3/2, 2, 3, 7/2}; `shifted_x1.1` (x1.1); `random_matched` (seeded, min gap 0.3).

| Family | Accuracy (all) | Detection (all) | Median rel. ratio error (all / clean / 0 dB) |
|---|---|---|---|
| henry | 1.000 | 0.9986 | 2.02e-5 / 3.5e-8 / 4.9e-5 |
| shifted_x1.1 | 1.000 | 0.9972 | 1.89e-5 / 3.4e-8 / 5.0e-5 |
| random_matched | 1.000 | 1.000 | 2.01e-5 / 3.7e-8 / 5.3e-5 |

Noise-only false alarms: 0/20 at each rate. Rebase invariance failures: 0 (exact rational check, n in {-2,1,3}).
Classification accuracy is saturated at 1.0 (4 well-separated candidates), so it cannot discriminate families; the error and detection columns show no meaningful difference between Henry ratios and matched alternatives.

## 6. Actual processor integration (44100 Hz, 0.5 s, 20 dB SNR, 20 trials)
| Path | Result |
|---|---|
| `harmonic_analyzer` + cluster centroids | median ratio error 2.2e-4 (about 10x worse than the FFT estimator, resolution/leakage limited) |
| Pipeline `{}` (disabled) | output identical to input 20/20; Coil preserved 20/20 |
| compressor+limiter | Coil preserved 20/20 |
| spatial_transmission | Coil preserved 20/20 |
| frequency_shifter (default) | Coil preserved 0/20; median error 0.45 (additive shift is not ratio-preserving) |
| use_spatial_processing | Coil preserved 0/20; median error 0.46 |

The pipeline wraps effects in `except: pass`, so a failing effect would be silently skipped; direct calls to compressor, limiter and frequency_shifter succeeded, so these runs were real.

JS wrapper -> Python bridge: short (128-sample) `applyProfessionalEffects` round trip works and matches a direct Python call. Failures reproduced: signals of 4000 samples time out (wrapper parses stdout per chunk, so large JSON is split), and `processCompleteAudioPipeline` times out (bridge returns an ndarray that is not JSON serializable). These are pre-existing and were not modified.

## 7. What this does and does not show
- Shows: the layer is exact and reversible algebraically (rebasing, unit change), uncertainty propagation matches closed forms and sampling, Gaussian transformation normalizes.
- Does not show: any predictive or detection advantage of 7-based ratios; they behaved the same as matched alternatives. Standard DSP only; no quantum simulation or physical quantum evidence. No measured datasets were used.

## 8. Skipped / blocked
Solidity compile (no network for solc); `main_integration` pipeline (import path bug, then >60 s on 1024 samples); Perplexity-dependent nodes (no keys by design); 10 of 12 nodes not executed; spec ambiguities listed in section 2; Windows `setup.bat`/OneDrive-dependent tests.
