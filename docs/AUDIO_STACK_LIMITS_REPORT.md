# Bounded audio-stack limits, evidence, and handoff

## Scope and identity

This is a test-only continuation in **CharlyOlson/Solidarity#29**
([existing PR](https://github.com/CharlyOlson/Solidarity/pull/29)). No new PR
was opened. The approved baseline is
`28a27afebd761f49eb78a05802ed6a4398f474cb` (tree
`342dc96f73221a3917658fa548ed35976534a981`). The initial planning commit
`905d5c652120cf44814cc763f830e4ef412e6c9a` is its direct child and has the
same tree; its different commit SHA did not represent code drift.

The final test-bearing commit is
`c90625f4b6e33403681a25a9dd53d2d0a53c2e61` (tree
`c4531121f8811189f4e37eeeb1914bc39b459b6a`), on
`copilot/solidarity-26-27-test-pr`, based on the approved #27 head. Both final
stress runs began from a clean worktree at that exact SHA. Report and raw-data
files are added afterward and are report-only changes. No production code,
algorithms, dependency manifests/locks, contracts, financial behavior, test
expectations, or existing PR metadata were changed.

The harness is opt-in (`SOLIDARITY_AUDIO_STRESS=1`), runs each risky case in an
isolated process group, applies a 60-second wall limit per case, and stops size
escalation on a supervisor timeout or memory-limit event. Its 2 GiB process
group RSS ceiling is sampled from `/proc` every 50 ms and enforced by killing
the group; it is **not** a kernel-enforced memory limit. The runner's cgroup
reported `memory.max=max`, no OOM events, 16 GiB total host memory, and about
14 GiB available at sweep start. Do not interpret these measurements as
universal capacity guarantees.

## Chronological reconciliation ledger

Session references and repository-qualified PR numbers below are intentionally
distinct. SHA values are full when available.

| Date / item | Head and base | Relevant work and evidence | Presence, dependency, disposition |
|---|---|---|---|
| 2025-10-01 — `CharlyOlson/Solidarity#17` | Head `e331025fb896a8305967a77bd3206d5968d5c086`; base `8ffb94850b01e309ac74aaf0bc6a8be31c03e44b` | Open/draft branch `copilot/fix-cc4df29e-9ef2-4ba5-ad6d-dac5c0c4e663`. Repository cleanup and an earlier `src/main_integration.py` import-path edit (`6261047…`); other changes repair `.gitattributes`, remove tracked caches/backups, and add `CURRENT_STATUS.md`. The PR has a dirty mergeable state. No review threads were returned. | The narrow import-path concern is superseded by the tested #26 import fix, now present in #29's baseline; the rest of #17 is not replaced by this audio test PR. Keep #17 open for separate review; do not copy or close it as a duplicate. |
| 2026-10-10 — `CharlyOlson/Solidarity#25` | Head `c6ae1236c6f306dde8d67ba4d53e808f85ba7f0f`; base `f52e042b47aad70824df1d25fa2b8b42bf6dd8ce` | Open/draft branch `copilot/inspect-audio-processors`. Analysis-only Coil measurement layer, seeded synthetic benchmark, and inventory/report. Its files are disjoint from the #26/#27 audio fixes. A disposable patch-only overlay of #25 head on #27 head passed **34/34** with `cd /tmp/Solidarity-pr25-combined && timeout --signal=TERM --kill-after=5s 60s prlimit --as=2147483648 -- env REQUIRE_PYTHON_INTEGRATION=1 /tmp/solidarity-audio-venv/bin/python -m unittest tests.test_coil_measurement tests.test_main_integration_pipeline tests.test_enhanced_audio_bridge`; no merge or code copy occurred. No review threads were returned. | Independent of the audio stack; retain for separate review. It is not a dependency of #29. Do not close based on age or this limited combined test. |
| 2026-10-10 — `CharlyOlson/Solidarity#26` | Head `3eba5634a23b06a4695d0598e4afcc87a35c6159`; base `f52e042b47aad70824df1d25fa2b8b42bf6dd8ce` | Open/draft branch `copilot/fix-js-python-audio-bridge-defects`. JS/Python bridge framing, serialization, lifecycle and error handling; final commit also fixes `main_integration.py` imports from a foreign working directory. CharlyOlson's two PR conversation comments correct stale description/evidence: the `627c911…` non-finite description was superseded, and the final `3eba563…` head includes the import-path fix. At that head, the owner reported JS 38/38 and Python bridge/import tests 15/15; those tests do not exercise the main pipeline. No review threads were returned. | #27 is stacked directly on this head, and #29 indirectly depends on it. Retain; review/merge before #27, then rerun the combined stack. The import fix already exists; do not duplicate it. |
| 2026-10-12 — `CharlyOlson/Solidarity#27` | Head `28a27afebd761f49eb78a05802ed6a4398f474cb`; base `3eba5634a23b06a4695d0598e4afcc87a35c6159` | Open/draft branch `copilot/audio-bridge-import-pr-26`. Fixes temporal self-deadlock with `RLock`, adds stage diagnostics and pins `requirements-audio.txt`. `docs/AUDIO_PIPELINE_TIMEOUT_REPORT.md` records the original lock trace, tests, rate follow-up, and PR dependencies. On the exact #27 baseline, the 1024-sample integration regression passed; the corresponding #26 parent pipeline was externally stopped after 60 seconds. No review threads were returned. | Required parent of #29 and dependent on #26. Retain; merge/review after #26 and before #29. |
| 2026-10-18 — current local task `5c553a0c-697a-4166-83eb-9f1eadd39c2c`, `CharlyOlson/Solidarity#29` | Final test-bearing head `c90625f4b6e33403681a25a9dd53d2d0a53c2e61`; base `28a27afebd761f49eb78a05802ed6a4398f474cb` | Open/draft branch `copilot/solidarity-26-27-test-pr`. Adds only tests/harness/evidence. Commits on this branch after the plan are `d4d137d…` (bounded harness), `3cf4fb8…` (required dependency fail-closed tests), `cae4786…` and `76c4f6c…` (rate-probe size/JSON fixes), `d973ee2…` (controller baseline accounting), and `c90625f…` (valid-input classification). Final tests/results are detailed below. | Retain this existing PR; it is stacked on #27. Its GitHub title/body still claim “No changes made: starting SHA mismatch.” That metadata was deliberately not edited. Request owner approval before changing it. |

The local session store exposed only the current task session
`5c553a0c-697a-4166-83eb-9f1eadd39c2c` and refs to Solidarity #25, #26, #27 and
#29. A prior handoff associated truncated session prefixes `e994b93b-…` with
#26 and `b2c6ae0b-…` / `659be5d3-…` with work across #25–#27; their full IDs,
records, turns/checkpoints, and branch associations could not be retrieved
here. The cloud session query returned no rows. One visible
`audio-test-explorer` subagent is idle; its inventory was based on the earlier
`905d5c6` plan state, not current test evidence. No session-stop/close control
is available, so it was left idle. `CharlyOlson/-Solidarity-Clean#26` is **not**
`CharlyOlson/Solidarity#26`; GitHub returned 404 for the Clean repository PR,
so its head/base/dependency and disposition remain unverified.

For #17, #25, #26, #27 and #29, GitHub returned no review threads. #26 has the two owner
conversation comments described above; #25, #27, and #29 had no conversation
comments in the retrieved results. No PR was merged or closed by this task;
existing PR metadata was not edited.

## Environment and reproducible commands

Environment: Linux x86_64, kernel `6.17.0-1022-azure`; Node `v22.23.3`;
npm `10.9.9`; Python `3.12.3`; Jest `29.7.0`; NumPy `1.26.4`; SciPy
`1.13.1`. JavaScript dependencies were installed from the checked-in lockfile
(`package-lock.json` SHA-256
`b567cf2e2793bc66f98b79797d37b9c70eb0a9b20b430550189f5e355c1596bf`).
Python dependencies came from `requirements-audio.txt` (SHA-256
`40cc00a32e4f03e71246b5fa06ccb8d1ce5f23b3a9f2d374b4867c5348d8ecab`).

Environment setup:

```sh
python3 -m venv /tmp/solidarity-audio-venv
/tmp/solidarity-audio-venv/bin/python -m pip install -r requirements-audio.txt
npm ci --ignore-scripts --no-audit --no-fund
```

Exact final regression commands at `c90625f…`:

```sh
timeout --signal=TERM --kill-after=5s 60s \
  env PYTHON=/tmp/solidarity-audio-venv/bin/python \
  NODE_OPTIONS=--max-old-space-size=1536 REQUIRE_PYTHON_INTEGRATION=1 \
  npm test -- --runInBand --coverage=false

timeout --signal=TERM --kill-after=5s 60s \
  prlimit --as=2147483648 -- env REQUIRE_PYTHON_INTEGRATION=1 \
  /tmp/solidarity-audio-venv/bin/python -m unittest discover -s tests -v

timeout --signal=TERM --kill-after=5s 60s \
  prlimit --as=2147483648 -- env REQUIRE_PYTHON_INTEGRATION=1 \
  /tmp/solidarity-audio-venv/bin/python -m unittest tests.test_python_required_dependencies -v
```

Final results: Jest **5 suites, 42 passed, 0 failed, 0 skipped**; Python
discovery **36 run: 32 passed, 2 failed, 2 skipped**; required-dependency
fail-closed subprocess tests **4/4 passed**. The two Python failures are
pre-existing discovery assumptions, reproduced at the exact baseline:
missing root `comprehensive-discovery.js` and `setup_python_env.py`, and no
OneDrive path in this Linux runner. The two skips are the absent
`transfer_gradient` method (explicitly outside this task) and absent
`simple-discovery-test.js`. No expectations were weakened. On the detached
baseline worktree `/tmp/Solidarity-baseline-28a27af`, the existing JS suite
was **5 suites/38 passed**, Python discovery was **30 run: 26 passed, 2
failed, 2 skipped**, and the focused bridge/import/main integration subset
was **16/16 passed**.

Final opt-in sweeps, run sequentially at the same clean code-bearing worktree
SHA (`c90625f…`, tree `c453112…`):

```sh
timeout --signal=TERM --kill-after=5s 730s \
  env SOLIDARITY_AUDIO_STRESS=1 REQUIRE_PYTHON_INTEGRATION=1 \
  PYTHON=/tmp/solidarity-audio-venv/bin/python \
  NODE_OPTIONS=--max-old-space-size=1536 \
  /tmp/solidarity-audio-venv/bin/python tests/audio_stack_limits.py \
  --path main --budget-seconds 720 --case-timeout-seconds 60 \
  --output-dir /tmp/solidarity-audio-final/c906/main-integration

timeout --signal=TERM --kill-after=5s 610s \
  env SOLIDARITY_AUDIO_STRESS=1 REQUIRE_PYTHON_INTEGRATION=1 \
  PYTHON=/tmp/solidarity-audio-venv/bin/python \
  NODE_OPTIONS=--max-old-space-size=1536 \
  /tmp/solidarity-audio-venv/bin/python tests/audio_stack_limits.py \
  --path bridge --budget-seconds 600 --case-timeout-seconds 60 \
  --output-dir /tmp/solidarity-audio-final/c906/js-python-bridge
```

The final sweeps took **56.664 s** and **67.666 s** (124.330 s combined);
per-run aggregate budgets were 720 s and 600 s, respectively. A preceding
main-path rehearsal stopped at a harness setup error (missing rate-probe
length); the setup and NumPy boolean serialization issues were fixed and
focused probes passed before the final SHA was tested. Its incomplete output
was discarded. No final sweep hit a timeout, RSS ceiling, orphan-process
condition, or aggregate budget, and all planned sizes started.
One CSV row preserves a trailing space from NumPy's raw multiline
`ValueError` message for the two-dimensional main input; it is retained rather
than normalized in this evidence artifact.

## Final limits results

Raw results (109 and 93 JSON records, respectively) are committed alongside
this report:

- [`main_integration` JSON](../tests/results/audio-stack-limits/main-integration/audio_stack_limits.json) and [CSV](../tests/results/audio-stack-limits/main-integration/audio_stack_limits.csv)
- [JS/Python bridge JSON](../tests/results/audio-stack-limits/js-python-bridge/audio_stack_limits.json) and [CSV](../tests/results/audio-stack-limits/js-python-bridge/audio_stack_limits.csv)

Each record includes repository, worktree, branch, tested SHA/tree, case,
seed, elapsed/wall time, sampled peak process-group RSS, return code, and
supervisor status. The main path separately records stage timings, finite
outputs, shapes, input mutation, reference comparisons, rate and state data.
The bridge path records direct-Python comparisons, pending requests, process
cleanup, response size, lifecycle latency and fault-fixture observations.

| Path | Size coverage and observed boundary | Numerical/state/transport results |
|---|---|---|
| `main_integration` | 68 distinct scheduled lengths, 79 size-sweep records (3 repeats at 128, 1024, 4500, 20000, 50000), plus warm-up and 30 supplemental cases. All requested large sizes through **1,000,000** were tested. Of 79 size cases, **70 passed** and **9 raised observed exceptions** (length 0 and lengths 1–9). Largest passing: **1,000,000**. Smallest observed exception: **0** (`ValueError: invalid number of data points (0) specified`); lengths 1–9 also raised `ValueError: attempt to get argmax of an empty sequence`. Smallest sampled pass: **11**. Length 10 was not scheduled. No supported minimum-length contract was found, so this is an observed boundary, not a declared DSP limit. | All 70 passing size cases were finite, shape-preserving, unmutated and within the existing no-compression reference (`signal * 1.1` with temporal control enabled, `abs=1e-12`, `rel=1e-9`). Fresh-instance and same-instance repeat outputs were identical. Eight seeded patterns and all four compression/temporal combinations ran; compression-enabled output has shape/finite checks but no invented numerical reference. |
| `js_python_bridge` | Same 68 distinct lengths, 79 size-sweep records, and all sizes through **1,000,000**. All 79 passed; largest pass **1,000,000**, with **no observed failing size** in the scheduled range. | All 79 matched direct Python at `abs=1e-12`, `rel=1e-9`; no pending requests remained. Tested pending counts **1/2/4/8** with correct caller routing. **100/100** initialize/request/shutdown cycles completed: latency mean 154.3 ms, median 151.8 ms, p95 166.7 ms, standard deviation 6.2 ms (CV 4.0%); 100 distinct child PIDs, at most one active child, no live worker afterward, pending requests 1→0. These are runner observations, not service guarantees. |

Main-path benchmark repeats (`n=3`; wall seconds, min / median / max):

| Samples | Wall seconds |
|---:|---:|
| 128 | 0.001539 / 0.001583 / 0.001957 |
| 1,024 | 0.001779 / 0.001796 / 0.001838 |
| 4,500 | 0.002622 / 0.002644 / 0.002650 |
| 20,000 | 0.006121 / 0.006217 / 0.006898 |
| 50,000 | 0.014847 / 0.014915 / 0.015116 |

Bridge benchmark repeats (`n=3`; request plus initialization, direct-Python
comparison and shutdown; seconds, min / median / max):

| Samples | Wall seconds |
|---:|---:|
| 128 | 0.330875 / 0.336998 / 0.347684 |
| 1,024 | 0.313071 / 0.318606 / 0.325343 |
| 4,500 | 0.309676 / 0.313653 / 0.318054 |
| 20,000 | 0.382803 / 0.387504 / 0.397204 |
| 50,000 | 0.479522 / 0.483232 / 0.494265 |

These are small-sample distributions with observed runner noise, not
cross-machine performance claims. Warm-up is recorded separately.

### Inputs, rates, and faults

- Main pipeline configured at 16,000, 44,100 and 48,000 Hz produced finite,
  shape-preserving output and passed its existing reference where applicable.
  The separate `ProfessionalAudioProcessor.harmonic_analyzer` probe on a
  16,384-sample 440 Hz tone reported 1,213.934 Hz at 16 kHz, 438.739 Hz at
  44.1 kHz, and 403.748 Hz at 48 kHz. This exposes its fixed 44.1 kHz bin
  mapping; it is not corrected here.
- The JS bridge configured for 16 kHz and 48 kHz still reported 44.1 kHz in
  `getSystemStatus`; only a 44.1 kHz configuration matched. This is an
  observed propagation inconsistency, not an approved alternate contract.
- Main non-contiguous and integer arrays passed shape/finite/reference checks
  without mutation. Main 2-D, scalar, Python-list, string and object inputs
  raised observed exceptions; no rejection contract was invented.
  Main NaN/Inf inputs returned non-finite output. Their expected DSP behavior
  is unspecified. On the bridge, 2-D input was echoed/processed as a finite
  2-D result and string input was returned with a non-finite check of false;
  both matched direct Python, but are not declared supported. JS
  `JSON.stringify` converted NaN/±Inf input entries to JSON `null`; the
  resulting null-containing output matched direct Python. This records
  transport behavior, not numeric NaN/Inf preservation. A `null` signal was
  treated as omitted and generated the default 44,100-sample result; this is
  likewise an observed behavior, not a validated user-facing specification.
- Fixtures passed for split multibyte UTF-8, stderr noise, multiple messages
  in one chunk, malformed/truncated JSON, invalid UTF-8, non-object output,
  early nonzero exit, hangs, SIGTERM resistance, stdin write failure and
  pending-request cleanup. Existing wrapper regression coverage also verifies
  recovery and reinitialization after failure.
- With `maxResponseBytes=128`, complete frames of 127 and 128 bytes were
  accepted, and 129 bytes were rejected; pending requests returned to zero.
  The cap+1 error says “without a message terminator” although the fixture
  emitted a complete newline-terminated frame. This wording issue is
  reproducible and does not indicate that the cap was bypassed.
- Main shared-controller concurrency ran 64 calls across 8 threads in an
  isolated process. Its initial state was 128 samples; final counters were
  8,320 (= 128 + 64×128) for both controllers, with all output shapes intact.
  The first harness assertion omitted the existing 128-sample setup call; it
  was corrected and the final run passes. No lost/duplicated counter update
  was observed in this one case; this does not establish general thread safety.
- Maximum sampled process-group RSS was about 187 MiB on the main path and
  346 MiB on the bridge path, below the 2 GiB sampled ceiling. No OOM is
  claimed. Kernel/cgroup memory enforcement was unavailable.

## Prioritized findings and proposed destinations

1. **Measured, high priority — sample-rate propagation.** The bridge ignores
   the wrapper's configured rate in system status, and the professional
   analyzer maps bins as though every signal were 44.1 kHz. Propose a separate
   production PR after explicit approval: define/validate one `sample_rate_hz`
   field, propagate it through bridge/system/processor construction, and add
   16/44.1/48 kHz frequency tests without silently changing analyzer output
   shape or peak-selection semantics. `docs/AUDIO_PIPELINE_TIMEOUT_REPORT.md`
   already records this as separate work.
2. **Measured, contract gap — empty/tiny `main_integration` signals.** Inputs
   of lengths 0–9 raise FFT/empty-argmax exceptions; 11 and above in the
   scheduled set passed. Propose a separate production PR only after the
   accepted minimum and empty-input behavior are specified; then validate
   input at the boundary and return the specified error/result. Do not infer
   that 10 is the threshold.
3. **Measured, low priority — misleading size-cap diagnostic.** Preserve the
   response cap, but in a separate production fix distinguish an oversized
   complete frame from an unterminated frame and test both errors.
4. **Specification gap — invalid/ambiguous payloads.** Define whether the
   bridge must reject non-finite, null, strings and multidimensional inputs;
   validate at the boundary only after that contract is approved. No behavior
   was changed here.
5. **Out of scope — missing `transfer_gradient`.** Existing test remains
   skipped; do not implement it in this audio-stack PR.

The #26-versus-#27 deadlock reproduction remains measured evidence: the #26
parent `3eba563…` emits its start marker and is externally terminated at the
60-second bound; the #27 baseline's bounded 1,024-sample pipeline regression
passes. The failure is the known non-reentrant temporal lock, not an OOM or
runner memory limit. Reproduction commands:

```sh
timeout --signal=TERM --kill-after=5s 60s \
  prlimit --as=2147483648 -- env PYTHONPATH= \
  /tmp/solidarity-audio-venv/bin/python -c \
  'import sys,numpy as np; sys.path.insert(0,"/tmp/Solidarity-parent-26/src"); from main_integration import SolidarityHarmonicSystem; print("START",flush=True); result=SolidarityHarmonicSystem().process_audio_with_complete_pipeline(np.sin(2*np.pi*440*np.arange(1024)/44100),enable_compression=False); print("DONE",result["pipeline_diagnostics"]["sample_count"],flush=True)'

cd /tmp/Solidarity-baseline-28a27af &&
  timeout --signal=TERM --kill-after=5s 60s \
  env REQUIRE_PYTHON_INTEGRATION=1 \
  /tmp/solidarity-audio-venv/bin/python -m unittest \
  tests.test_main_integration_pipeline -v
```

The repair already lives in #27; this PR did not alter it.

## PR/session disposition and merge order

1. `CharlyOlson/Solidarity#17`: leave open pending independent owner review.
   #26 supersedes only its import-path hunk; the cleanup/status changes are
   not accounted for by #29.
2. `CharlyOlson/Solidarity#25`: leave open and independent; the disposable
   patch-only combined subset passed 34/34, but no merge was performed.
3. `CharlyOlson/Solidarity#26` → `CharlyOlson/Solidarity#27` →
   `CharlyOlson/Solidarity#29`: review/merge in this dependency order, rerun
   combined tests after each integration, and do not merge merely to reduce
   the open-PR count. #27 depends on #26; #29 is based on #27.
4. `CharlyOlson/-Solidarity-Clean#26`: no disposition until the repository
   and PR can be accessed and the dependency confirmed. Do not substitute
   Solidarity #26.
5. `audio-test-explorer`: visible but idle; no stop/close action is available.
   Leave it idle rather than claim it was closed.

All production fixes above are recommendations only. Obtain explicit approval
for production patches, merges, PR metadata changes, PR closures, branch
deletions, or session stops before taking any such action. No such action was
taken here. PR #29's title/body remain stale by design; this report is the
durable corrected handoff and the owner can approve metadata updates
separately.

## Validation and next-session handoff

GitHub Actions on the current PR head showed signed-commit, secret-scan and
drift checks as `action_required` with zero jobs; `get_job_logs` returned zero
failed jobs for those runs. They are not audio test results. No dedicated CI
test workflow ran. The repository has no ESLint configuration, so no ESLint
run is claimed. `parallel_validation` was invoked on the completed diff:
CodeQL skipped the test/documentation/data-only changes as trivial; the code
review backend could not load its configured model
(`capi-prod-claude-sonnet-4.6` was not in the model registry), so no completed
code-review conclusion is claimed. Codacy MCP analysis was unavailable in
this session.

Next session: start from current PR #29 head, verify its base remains
`28a27af…`, and treat `c90625f…` as the final tested code-bearing SHA.
`docs/AUDIO_STACK_LIMITS_REPORT.md` and `tests/results/audio-stack-limits/`
are report-only additions; their commit SHA must not be represented as a
retested code commit. Preserve the known Python discovery failures/skips and
the unresolved sample-rate, short-input, and cap-message findings. Do not
apply production fixes, modify `SOLIDARITY_CHARTER.md` or
`contracts/TreasuryManager.sol`, close or merge PRs, or claim platform-wide
certification.
