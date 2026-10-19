# Audio stack production repair: evidence and handoff

## Scope and immutable baseline

This focused repair is stacked on the approved Solidarity #29 baseline
`a16471dc75fdf5c50c81081ea3dc5a582080b46f`. Its tree is
`ad15ad9ee5e2e2d1e2c552fb7c3acff94fadebf3`. The branch's initial planning
commit `fbe52584f27e0a7fc279b86792c5b6abba9e0c39` is a direct child and has
that same tree; comparison against the approved parent showed no unapproved
baseline changes.

The final code-bearing commit tested here is
`c1b46f6c92c891c75ef7533febc73cd489c936cd` (tree
`95b45e54de4f56617187d19766f9ff25c1e5027b`). The raw stress artifacts were
committed report-only at `ca4aa6b79db9ff4c0a1dc9dbbda855f063d51748`; this
document is another report-only successor. Neither is a retested code commit.
The existing
`AUDIO_STACK_LIMITS_REPORT.md` and `tests/results/audio-stack-limits/` remain
unchanged historical evidence; the new results are in
[`tests/results/audio-stack-repair/final/`](../tests/results/audio-stack-repair/final/).

No contracts, `SOLIDARITY_CHARTER.md`, Treasury allocations, financial
behavior, PR metadata, deployments, live APIs, RPC, credentials, or funds were
changed or used. The PR stack/dependency order remains **#26 → #27 → #29 →
this repair**; run integrated regressions after each dependency is integrated.
This is not full-platform certification.

## Reproduced defect and implementation

Before editing production code, the unchanged baseline reproduced both
reported rate defects:

- A JS wrapper configured with legacy `sampleRate: 16000` returned bridge
  status `sample_rate: 44100`.
- A 16,384-sample 440 Hz tone analyzed by the imported
  `ProfessionalAudioProcessor` reported 1,203.1677 Hz at 16 kHz,
  427.9724 Hz at 44.1 kHz, and 401.0559 Hz at 48 kHz. The fixed 44.1 kHz FFT
  mapping caused the alternate-rate mismatch.

The baseline probes used the pinned venv interpreter and lockfile-installed
Node modules:

```sh
timeout --signal=TERM --kill-after=5s 60s node - <<'JS'
const { EnhancedAudioProcessingWrapper } = require('./src/enhancedAudioProcessingWrapper');
(async () => {
  const wrapper = new EnhancedAudioProcessingWrapper({
    pythonExecutable: '/tmp/solidarity-audio-venv/bin/python',
    sampleRate: 16000,
    timeout: 30000
  });
  try {
    await wrapper.initialize();
    const status = await wrapper.getSystemStatus();
    console.log(JSON.stringify({
      configured_sampleRate: wrapper.config.sampleRate,
      status_sample_rate: status.result.sample_rate
    }));
  } finally {
    await wrapper.shutdown();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
JS

/tmp/solidarity-audio-venv/bin/python - <<'PY'
import numpy as np
from src.solidarityAudioProcessor import ProfessionalAudioProcessor
for rate in (16000, 44100, 48000):
    n = 16384
    tone = np.sin(2 * np.pi * 440 * np.arange(n) / rate)
    peaks = ProfessionalAudioProcessor().harmonic_analyzer(tone)
    print(rate, peaks.get('harmonic_0', {}).get('frequency'))
PY
```

The implementation defines `sample_rate_hz` as the canonical representation,
with default 44,100 Hz and the existing configured range of 8,000–192,000 Hz.
It accepts finite integer rates only, rejects booleans, strings, non-finite,
out-of-range and conflicting values, and retains compatibility aliases:
`sampleRate` in JavaScript and `sample_rate` in Python. `AUDIO_SAMPLE_RATE` is
used when no constructor rate is supplied; conflicting explicit environment,
wrapper, bridge, or request rates fail instead of winning by precedence.

The wrapper passes the validated rate into the Python bridge. The bridge
constructs its master, professional, and spatial processors with that rate,
reports both canonical and legacy status fields, and rejects a request rate
that conflicts with the worker. The main pipeline and
`AdvancedHarmonicAnalyzer` expose/use the same validated rate. The actual
bridge import is `src/solidarityAudioProcessor.py`; the byte-identical
`src/audio/solidarityAudioProcessor.py` duplicate is not imported by this
bridge and was deliberately left untouched.

The professional analyzer's FFT bin spacing and its delay, reverb, and spatial
coherence sample counts now use the configured rate. Analyzer result keys,
shape, threshold/peak-selection behavior, and valid 44.1 kHz behavior are
unchanged. No HPS equation, peak-selection rule, amplitude normalization, or
other DSP algorithm was substituted.

Response-size cap semantics are unchanged. A complete over-limit frame now
reports “complete frame exceeded the response limit”; a partial frame that
exceeds the cap before a newline reports “unterminated frame exceeded the
response limit.” With a 128-byte cap, complete frames of 127 and 128 bytes
were accepted, 129 bytes rejected, and an over-limit unterminated frame
rejected; all cases cleared pending requests.

## Regression results

Environment: Linux x86_64; Node `v22.23.3`; npm `10.9.9`; Python `3.12.3`;
Jest `29.7.0`; NumPy `1.26.4`; SciPy `1.13.1`. JavaScript dependencies were
installed from the checked-in `package-lock.json` (SHA-256
`b567cf2e2793bc66f98b79797d37b9c70eb0a9b20b430550189f5e355c1596bf`).
Python dependencies were installed from `requirements-audio.txt` (SHA-256
`40cc00a32e4f03e71246b5fa06ccb8d1ce5f23b3a9f2d374b4867c5348d8ecab`).
`REQUIRE_PYTHON_INTEGRATION=1` was set so missing integration dependencies
fail rather than silently skip.

Environment setup commands:

```sh
python3 -m venv /tmp/solidarity-audio-venv
/tmp/solidarity-audio-venv/bin/python -m pip install -r requirements-audio.txt
npm ci --ignore-scripts --no-audit --no-fund
```

Exact full regression commands at the final code-bearing commit:

```sh
timeout --signal=TERM --kill-after=5s 60s \
  env PYTHONDONTWRITEBYTECODE=1 \
  PYTHON=/tmp/solidarity-audio-venv/bin/python \
  NODE_OPTIONS=--max-old-space-size=1024 REQUIRE_PYTHON_INTEGRATION=1 \
  npm test -- --runInBand --coverage=false

timeout --signal=TERM --kill-after=5s 60s \
  prlimit --as=1610612736 -- \
  env PYTHONDONTWRITEBYTECODE=1 REQUIRE_PYTHON_INTEGRATION=1 \
  /tmp/solidarity-audio-venv/bin/python -m unittest discover -s tests -v
```

Results: Jest **5 suites, 59 passed**. Python discovery **49 run: 45 passed,
2 failed, 2 skipped**. The two failures are the existing discovery assumptions
about missing root `comprehensive-discovery.js` and `setup_python_env.py`, and
the absent OneDrive directory on this Linux runner. The two skips remain the
missing `transfer_gradient` method and `simple-discovery-test.js`. No
expectations were weakened and these are not reported as green. The inherited
limits report documents the same discovery failures/skips at the approved
baseline. Python tests use a 1.5 GiB address-space limit; the stress harness
uses separate sampled RSS supervision described below.

Focused regressions additionally cover invalid/conflicting rates, legacy
aliases, actual processor/analyzer output, the 1-bin frequency tolerance,
delay timing, frame-cap messages, and supervisor output handling. Existing JS
tests exercised concurrent initialization, process death/recovery and shutdown.
The final bounded stress run additionally exercised concurrent routing,
100 worker lifecycle cycles and fault injection.

GitHub Actions run `39274528438` (Drift Detector) for this working branch
reported `action_required` with zero jobs; `get_job_logs` found zero failed
jobs. The signed-commit and secret-scan runs were likewise `action_required`
with zero jobs. The repository has no dedicated audio CI workflow, so these
are not CI test results.

## Bounded stress methodology and results

The exact final stress command was:

```sh
timeout --signal=TERM --kill-after=5s 1810s \
  env SOLIDARITY_AUDIO_STRESS=1 REQUIRE_PYTHON_INTEGRATION=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PYTHON=/tmp/solidarity-audio-venv/bin/python \
  NODE_OPTIONS=--max-old-space-size=1536 \
  /tmp/solidarity-audio-venv/bin/python tests/audio_stack_limits.py \
  --path all --budget-seconds 1800 --case-timeout-seconds 60 \
  --output-dir tests/results/audio-stack-repair/final
```

An earlier rehearsal on predecessor `7c99218…` exposed a harness serialization
bug: the three rate-probe records contained NumPy `bool_` values. That run was
not treated as final evidence. The booleans were converted to built-in values,
a serialization/frequency regression was added, and the complete sweep was
rerun on the final code commit below. The rehearsal is outside the PR tree.

It ran from a clean worktree at code SHA `c1b46f6…` / tree `95b45e5…`. It
completed in **184.539 seconds**, under the **1,800-second aggregate budget**
and **60-second per-case maximum**. All planned cases started. The JSON
contains **253 records**, each with harness status `ok`; audio-level
observations below remain explicit and are not conflated with supervisor
status.

The supervisor drains both pipes while the child runs, retains at most 4 MiB
per output stream, kills the process group on output/time/RSS limit, detects
remaining group processes, and stops further size escalation after
timeout/resource events. The process-group RSS ceiling was reduced to **1 GiB**
and sampled from `/proc` every 50 ms; this is **not kernel-enforced**. The
runner cgroup reported `memory.max=max`, no OOM events, about 16 GiB total and
14.2 GiB available. Maximum sampled RSS was **197,562,368 bytes** for the main
pipeline and **554,004,480 bytes** for the JS/Python bridge. These are
runner-specific observations, not capacity guarantees.

Both paths covered 83 scheduled size cases through 1,000,000 samples. The main
path had 65 ordinary `ok` cases, 10 observed errors and 8 explicitly undefined
short-tone results; the bridge path had 83 `ok` cases and no observed size
failure. The largest passing size was **1,000,000** on both paths. The
smallest main-path exception was **0** samples; the bridge had no scheduled
failing size. The short-input details are listed in the next section.

Seeded non-silent tones, mixed tones and noise each ran at 1,024, 20,000,
50,000, 100,000, 250,000, 500,000 and 1,000,000 samples on both paths
(21 cases per path). The main pipeline also ran all four compression/temporal
combinations at 1,024 samples; all four completed. Compression-enabled audio
was checked for shape/finite output, not against an invented DSP oracle.

Observed wall seconds (minimum / median / maximum across repeated cases):

| Samples | Main pipeline | JS/Python bridge |
|---:|---:|---:|
| 128 | 0.001444 / 0.001473 / 0.001496 | 0.310668 / 0.334243 / 0.342276 |
| 1,024 | 0.001636 / 0.001686 / 0.001857 | 0.314013 / 0.332718 / 0.468035 |
| 4,500 | 0.002377 / 0.002378 / 0.002418 | 0.312339 / 0.316086 / 0.325641 |
| 20,000 | 0.005072 / 0.005421 / 0.006406 | 0.386023 / 0.394836 / 0.605786 |
| 50,000 | 0.013188 / 0.015291 / 0.017796 | 0.474411 / 0.486461 / 1.212857 |
| 100,000 | 0.027366 / 0.028359 / 0.028879 | 0.643052 / 0.652320 / 1.229263 |
| 250,000 | 0.068879 / 0.069718 / 0.071114 | 1.079445 / 1.369931 / 2.306989 |
| 500,000 | 0.120395 / 0.123649 / 0.124803 | 1.812510 / 2.141728 / 3.594034 |
| 1,000,000 | 0.172204 / 0.223934 / 0.229276 | 0.833871 / 3.249703 / 4.801192 |

Repeated-case distributions include runner noise and are not cross-machine
performance claims.

The shared-controller test completed 64 calls across 8 threads; both temporal
counters ended at 8,320 (128 initial + 64 × 128), with all shapes intact.
Bridge concurrency at 1/2/4/8 pending requests routed to the correct callers
and ended with zero pending requests. **100/100** initialize/request/shutdown
cycles completed with 100 distinct worker PIDs, at most one active worker, and
no live workers afterward. Lifecycle latency: mean 0.192670 s, median
0.184032 s, p95 0.248529 s, standard deviation 0.039936 s. All 10 injected
fault modes, write failure cleanup, and both complete/unterminated frame-limit
cases passed.

## Frequency, short-input, and numerical observations

The frequency probes generate one-second 440 Hz tones and allow one FFT bin
(1 Hz) of error. At **16,000, 44,100 and 48,000 Hz**, the main-path processor
and FFT analyzer each reported 440 Hz and system status reported the configured
rate. The bridge reported each configured rate and its actual harmonic-series
analysis returned 440 Hz within the same tolerance. These checks verify
computation as well as status metadata.

The main pipeline's 0–16-sample tone sweep observed:

| Length | Observation |
|---:|---|
| 0 | `ValueError: invalid number of data points (0) specified` |
| 1–9 | `ValueError: attempt to get argmax of an empty sequence` |
| 10–16 | finite, shape-preserving output, but HPS fundamental estimate is 0 Hz |

Length 17 also returned the same 0 Hz estimate in the larger sweep. No minimum
or empty-input contract was added. Inspection of the HPS reduction shows that
the final HPS length is `floor(floor(N / 2) / 5)`; it must be at least two to
leave a non-DC candidate, which requires `N >= 20`. This is only a necessary
lower bound, not sufficient for meaningful 440 Hz resolution (length 31 also
estimated 0 Hz).

**Proposed contract for owner approval, not implemented:** define empty input
as an explicit validation error and choose a minimum from the supported
frequency range and required resolution; `N >= 20` is only the HPS
non-DC-candidate lower bound, not a recommended production guarantee. Define
the input as a one-dimensional finite real numeric signal. Specify separately
whether omitted signal means “generate default tone” and whether explicit
`null` is rejected. Strings, multidimensional arrays and non-finite values
remain observations rather than newly imposed API semantics.

A separate finite-amplitude probe used a 16,384-sample 440 Hz tone at
amplitude `1e100`. HPS emitted `overflow encountered in multiply` and returned
0 Hz. This is recorded as `observed_numerical_overflow`; the DSP algorithm was
not changed. By contrast, silence with zero fundamental power can produce
`thd_db == -inf`, a mathematically defined result; that case is distinguished
from NaN/overflow. **Recommended follow-up, pending approval:** evaluate a
focused log-magnitude/product-domain HPS implementation with explicit zero
handling, preserving peak-selection semantics and checking it against an
owner-approved oracle. Do not normalize amplitudes or change Henry/RJO/Coil
equations as part of this repair.

## Open blockers and validation handoff

- Approve the short-signal minimum/empty behavior and signal schema before
  adding production validation.
- Approve any HPS numerical-semantic change separately; the overflow remains a
  measured issue.
- Integrate and rerun in dependency order **#26 → #27 → #29 → this repair**.
  No claim is made that dependent PRs have already been merged or integrated.
- Existing `transfer_gradient` and discovery-environment failures/skips remain
  unresolved and unmodified.
- `parallel_validation` found zero CodeQL alerts in Python; JavaScript was
  skipped on the final run because it had no changes since the preceding scan,
  which found zero JS alerts. The code-review backend could not load its
  configured model `capi-prod-claude-sonnet-4.6`, so no substantive automated
  review conclusion is claimed.
- No full-platform certification is claimed.

The final raw JSON and CSV are preserved separately from #29's historical
results:

- [Final JSON](../tests/results/audio-stack-repair/final/audio_stack_limits.json)
- [Final CSV](../tests/results/audio-stack-repair/final/audio_stack_limits.csv)

SHA-256: JSON `3dbd60e6a69bb9bc9aacc66ea6259fc2e54421af85c2542b7fb25461fb58a5d1`;
CSV `89abe2163aa525f9bef7b993f19d94d7e64d497ba59098a257be773f5ad5fa3a`.
