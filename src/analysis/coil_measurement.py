"""
Opt-in, analysis-only Coil *measurement* layer.

A Coil measurement is the dimensionless ratio  C = q / r  of a measured
quantity q to an explicit reference r of the same quantity kind and native
unit.  Values and references are kept as exact rationals (fractions.Fraction).

SCOPE AND SEPARATION
  * This is NOT the financial COIL currency (1 USD = 10,000,000 Coils) nor the
    data-unit COIL (see SOLIDARITY_SYSTEM_SPEC.md).  Ledger, payment, token and
    currency quantities are rejected here and nothing in this module reads or
    writes them.
  * Nothing here changes any audio processor, contract or API.  The layer is
    disabled unless a CoilLayer(enabled=True) is constructed explicitly.

CONVENTIONS
  * Reference rebasing: r' = 7**n * r keeps q fixed, so C' = C / 7**n.
  * Physical scaling q' = s * q keeps r fixed, so C' = s * C.  These are
    different operations and are separate methods.
  * Scaling q and r together (unit change) leaves C exactly invariant.
  * First-order uncertainty uses the Jacobian of C = q / r and a full
    covariance matrix; a shared reference creates correlated Coil values.
  * Gaussian density under c_new = c_old / s (s > 0 fixed):
        p_new(c) = s * p_old(s * c)
    A data-dependent s (or node snapping) breaks this closed form; use
    sample_coil_uncertainty() with an explicit rule instead.
  * Quarter-step interpolation p + k*p/4 (k = 0..4) is an EXPERIMENTAL rule.
    It is not a canonical Henry node set and not a universal optimal scale.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from fractions import Fraction
from typing import Callable, Dict, Iterable, List, Optional, Sequence, Tuple

import numpy as np

SCHEMA = "solidarity.coil_measurement/1"
HENRY_BASE = 7
MAX_REBASE_EXPONENT = 64
MAX_SAMPLES = 1_000_000
MAX_ITEMS = 10_000
# Node list from SOLIDARITY_SYSTEM_SPEC.md ("Sacred nodes").  The spec also
# lists a wider set H; which set a caller wants is left explicit via `nodes`.
SACRED_NODES: Tuple[int, ...] = (1, 3, 4, 7, 14, 21, 49)

FORBIDDEN_KINDS = frozenset({
    "currency", "money", "ledger", "payment", "token", "balance", "amount",
    "fee", "financial", "coil_currency", "coil_token", "price",
})
FORBIDDEN_UNITS = frozenset({
    "usd", "eur", "gbp", "coil", "coils", "wei", "gwei", "eth", "btc", "sol",
    "usdc", "usdt", "penny", "cent", "cents",
})


class CoilLayerDisabled(RuntimeError):
    """Raised when the opt-in layer is used without being enabled."""


class CoilValidationError(ValueError):
    """Raised for rejected inputs (financial kinds, bad values, bounds)."""


def to_fraction(x) -> Fraction:
    """Exact conversion.  float -> its exact binary value; str -> exact decimal/ratio."""
    if isinstance(x, bool):
        raise CoilValidationError("bool is not a numeric value")
    if isinstance(x, Fraction):
        return x
    if isinstance(x, int):
        return Fraction(x)
    if isinstance(x, str):
        try:
            return Fraction(x.strip())
        except (ValueError, ZeroDivisionError) as exc:
            raise CoilValidationError(f"bad rational string: {x!r}") from exc
    try:
        f = float(x)
    except (TypeError, ValueError) as exc:
        raise CoilValidationError(f"not numeric: {x!r}") from exc
    if not math.isfinite(f):
        raise CoilValidationError("non-finite value")
    return Fraction(f)


def _fmt(x: Fraction) -> str:
    return f"{x.numerator}/{x.denominator}"


def _check_kind_unit(kind: str, unit: str) -> None:
    if not isinstance(kind, str) or not kind.strip():
        raise CoilValidationError("quantity_kind must be a non-empty string")
    if not isinstance(unit, str) or not unit.strip():
        raise CoilValidationError("native_unit must be a non-empty string")
    if kind.strip().lower() in FORBIDDEN_KINDS or unit.strip().lower() in FORBIDDEN_UNITS:
        raise CoilValidationError(
            "financial/ledger/token quantities are out of scope for the "
            "analysis-only Coil measurement layer")


@dataclass(frozen=True)
class CoilMeasurement:
    """Immutable measurement q with explicit reference r (same kind and unit)."""
    quantity_kind: str
    native_unit: str
    value: Fraction
    reference_value: Fraction
    reference_provenance: str
    derivation: Tuple[str, ...] = field(default_factory=tuple)

    def __post_init__(self):
        _check_kind_unit(self.quantity_kind, self.native_unit)
        object.__setattr__(self, "value", to_fraction(self.value))
        object.__setattr__(self, "reference_value", to_fraction(self.reference_value))
        if self.reference_value <= 0:
            raise CoilValidationError("reference must be strictly positive")
        if not self.reference_provenance or not str(self.reference_provenance).strip():
            raise CoilValidationError("reference provenance is required")

    @property
    def coil(self) -> Fraction:
        """Exact dimensionless C = q / r."""
        return self.value / self.reference_value

    def rebase(self, n: int) -> "CoilMeasurement":
        """Reference rebasing r' = 7**n * r (q unchanged), so C' = C / 7**n."""
        if isinstance(n, bool) or not isinstance(n, int):
            raise CoilValidationError("n must be an int")
        if abs(n) > MAX_REBASE_EXPONENT:
            raise CoilValidationError(f"|n| must be <= {MAX_REBASE_EXPONENT}")
        return CoilMeasurement(
            self.quantity_kind, self.native_unit, self.value,
            self.reference_value * Fraction(HENRY_BASE) ** n,
            self.reference_provenance, self.derivation + (f"rebase_reference:7^{n}",))

    def scale_quantity(self, s) -> "CoilMeasurement":
        """Physically scale q' = s * q with r fixed, so C' = s * C (NOT a rebase)."""
        s = to_fraction(s)
        if s <= 0:
            raise CoilValidationError("s must be strictly positive")
        return CoilMeasurement(
            self.quantity_kind, self.native_unit, self.value * s,
            self.reference_value, self.reference_provenance,
            self.derivation + (f"scale_quantity:{_fmt(s)}",))

    def convert_unit(self, factor, new_unit: str) -> "CoilMeasurement":
        """Exact unit change: q and r are both multiplied by factor; C is invariant."""
        factor = to_fraction(factor)
        if factor <= 0:
            raise CoilValidationError("factor must be strictly positive")
        return CoilMeasurement(
            self.quantity_kind, new_unit, self.value * factor,
            self.reference_value * factor, self.reference_provenance,
            self.derivation + (f"convert_unit:{self.native_unit}->{new_unit}:x{_fmt(factor)}",))

    def to_dict(self) -> Dict:
        def q(x: Fraction) -> Dict:
            return {"exact": _fmt(x), "approx": float(x)}
        return {
            "schema": SCHEMA,
            "analysis_only": True,
            "financial": False,
            "quantity_kind": self.quantity_kind,
            "native_unit": self.native_unit,
            "value": q(self.value),
            "reference": {**q(self.reference_value),
                          "provenance": self.reference_provenance},
            "coil": q(self.coil),
            "derivation": list(self.derivation),
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), sort_keys=True, allow_nan=False)

    @classmethod
    def from_dict(cls, d: Dict) -> "CoilMeasurement":
        if d.get("schema") != SCHEMA:
            raise CoilValidationError("unknown schema")
        m = cls(d["quantity_kind"], d["native_unit"], d["value"]["exact"],
                d["reference"]["exact"], d["reference"]["provenance"],
                tuple(d.get("derivation", ())))
        if _fmt(m.coil) != d["coil"]["exact"]:
            raise CoilValidationError("serialized coil is inconsistent with value/reference")
        return m

    @classmethod
    def from_json(cls, s: str) -> "CoilMeasurement":
        return cls.from_dict(json.loads(s))


class CoilLayer:
    """Opt-in gate.  Disabled by default; every constructor-style call checks it."""

    ENV_VAR = "SOLIDARITY_COIL_ANALYSIS"

    def __init__(self, enabled: bool = False):
        self.enabled = bool(enabled)

    @classmethod
    def from_env(cls, environ=None) -> "CoilLayer":
        import os
        env = os.environ if environ is None else environ
        return cls(enabled=env.get(cls.ENV_VAR, "") == "1")

    def _require(self):
        if not self.enabled:
            raise CoilLayerDisabled(
                "Coil measurement layer is opt-in; construct CoilLayer(enabled=True)")

    def measure(self, quantity_kind: str, native_unit: str, value, reference,
                reference_provenance: str) -> CoilMeasurement:
        self._require()
        return CoilMeasurement(quantity_kind, native_unit, to_fraction(value),
                               to_fraction(reference), reference_provenance)

    def ratio_covariance(self, q: Sequence, r: Sequence, cov) -> Tuple[np.ndarray, np.ndarray]:
        self._require()
        return first_order_ratio_covariance(q, r, cov)

    def sample(self, *args, **kwargs) -> Dict:
        self._require()
        return sample_coil_uncertainty(*args, **kwargs)


# ---------------------------------------------------------------- uncertainty

def _validate_cov(cov, dim: int) -> np.ndarray:
    c = np.asarray(cov, dtype=float)
    if c.shape != (dim, dim) or not np.all(np.isfinite(c)):
        raise CoilValidationError(f"covariance must be finite {dim}x{dim}")
    if not np.allclose(c, c.T, rtol=1e-9, atol=1e-15):
        raise CoilValidationError("covariance must be symmetric")
    if np.min(np.linalg.eigvalsh((c + c.T) / 2)) < -1e-12 * max(1.0, np.max(np.abs(c))):
        raise CoilValidationError("covariance must be positive semi-definite")
    return c


def first_order_ratio_covariance(q: Sequence, r: Sequence, cov) -> Tuple[np.ndarray, np.ndarray]:
    """
    First-order (linearised) covariance of C_i = q_i / r_i.

    len(r) == len(q): independent references; cov is over [q_0..q_{N-1}, r_0..r_{N-1}].
    len(r) == 1     : one SHARED reference; cov is over [q_0..q_{N-1}, r].
    Jacobian: dC_i/dq_i = 1/r_i, dC_i/dr_i = -q_i/r_i**2.  Cov_C = J cov J^T.
    Valid when sigma_r / r is small; callers should check it (see first_order_valid).
    Returns (C, cov_C).
    """
    qa = np.array([float(to_fraction(x)) for x in q])
    ra = np.array([float(to_fraction(x)) for x in r])
    n = len(qa)
    if n == 0 or n > MAX_ITEMS:
        raise CoilValidationError(f"need 1..{MAX_ITEMS} values")
    if np.any(ra <= 0):
        raise CoilValidationError("references must be strictly positive")
    shared = len(ra) == 1
    if not shared and len(ra) != n:
        raise CoilValidationError("len(r) must be 1 (shared) or len(q)")
    nvar = n + len(ra)
    c = _validate_cov(cov, nvar)
    jac = np.zeros((n, nvar))
    for i in range(n):
        ri = ra[0] if shared else ra[i]
        jac[i, i] = 1.0 / ri
        jac[i, n if shared else n + i] = -qa[i] / ri ** 2
    ratios = qa / (ra[0] if shared else ra)
    return ratios, jac @ c @ jac.T


def first_order_valid(sigma_r: float, r: float, max_rel: float = 0.1) -> bool:
    """Heuristic guard for the linearisation: sigma_r / r below max_rel."""
    return r > 0 and sigma_r / r < max_rel


# ---------------------------------------------------------- Gaussian densities

def gaussian_pdf(mu: float, sigma: float) -> Callable[[float], float]:
    if not (math.isfinite(mu) and math.isfinite(sigma)) or sigma <= 0:
        raise CoilValidationError("need finite mu and sigma > 0")
    norm = 1.0 / (sigma * math.sqrt(2 * math.pi))
    return lambda x: norm * math.exp(-0.5 * ((x - mu) / sigma) ** 2)


def _positive_scale(s) -> float:
    s = float(to_fraction(s))
    if not (math.isfinite(s) and s > 0):
        raise CoilValidationError("fixed scale s must be finite and > 0")
    return s


def transform_density(pdf: Callable[[float], float], s) -> Callable[[float], float]:
    """Density of c_new = c_old / s for FIXED s > 0:  p_new(c) = s * p_old(s * c)."""
    s = _positive_scale(s)
    return lambda c: s * pdf(s * c)


def gaussian_after_scale(mu: float, sigma: float, s) -> Tuple[float, float]:
    """Closed form of transform_density for N(mu, sigma^2): N(mu/s, (sigma/s)^2)."""
    s = _positive_scale(s)
    return mu / s, sigma / s


def integrate_density(pdf: Callable[[float], float], lo: float, hi: float, n: int = 20001) -> float:
    """Composite Simpson integral (n odd).  Deterministic; used for normalisation checks."""
    if n % 2 == 0 or n < 3 or not lo < hi:
        raise CoilValidationError("need odd n >= 3 and lo < hi")
    xs = np.linspace(lo, hi, n)
    ys = np.array([pdf(float(x)) for x in xs])
    h = (hi - lo) / (n - 1)
    return float(h / 3 * (ys[0] + ys[-1] + 4 * ys[1:-1:2].sum() + 2 * ys[2:-1:2].sum()))


# -------------------------------------------------------------------- sampling

def nearest_node_offset(x: float, nodes: Iterable[float] = SACRED_NODES) -> Tuple[float, float]:
    """
    Explicit snapping rule: nearest node; ties go to the LOWER node (a choice made
    here, not taken from repository code).  Returns (node, signed offset x - node).
    """
    ns = sorted(float(n) for n in nodes)
    if not ns:
        raise CoilValidationError("nodes must be non-empty")
    best = min(ns, key=lambda n: (abs(x - n), n))
    return best, x - best


def sample_coil_uncertainty(q: float, r: float, cov, *, n_samples: int, seed: int,
                            scale_fn: Optional[Callable[[float, float], float]] = None,
                            snap_nodes: Optional[Iterable[float]] = None) -> Dict:
    """
    Seeded Monte-Carlo for C = q / r with (q, r) ~ N([q, r], cov).

    scale_fn(q_draw, r_draw) -> s > 0 makes the scale data-dependent: C = (q/r) / s.
    snap_nodes applies nearest_node_offset to C afterwards.  Draws with r <= 0 or
    invalid s are rejected and counted (never silently dropped).
    """
    if isinstance(n_samples, bool) or not isinstance(n_samples, int) or not 1 <= n_samples <= MAX_SAMPLES:
        raise CoilValidationError(f"n_samples must be an int in 1..{MAX_SAMPLES}")
    c = _validate_cov(cov, 2)
    rng = np.random.default_rng(seed)
    draws = rng.multivariate_normal([float(to_fraction(q)), float(to_fraction(r))], c, size=n_samples)
    out: List[float] = []
    snaps: Dict[float, int] = {}
    rejected = 0
    nodes = tuple(snap_nodes) if snap_nodes is not None else None
    for qd, rd in draws:
        if rd <= 0:
            rejected += 1
            continue
        val = qd / rd
        if scale_fn is not None:
            s = scale_fn(float(qd), float(rd))
            if not (math.isfinite(s) and s > 0):
                rejected += 1
                continue
            val /= s
        if nodes is not None:
            node, _ = nearest_node_offset(val, nodes)
            snaps[node] = snaps.get(node, 0) + 1
        out.append(val)
    arr = np.array(out)
    if arr.size == 0:
        raise CoilValidationError("all draws rejected")
    return {
        "seed": seed, "n_requested": n_samples, "n_used": int(arr.size), "n_rejected": rejected,
        "mean": float(arr.mean()), "std": float(arr.std(ddof=1)) if arr.size > 1 else 0.0,
        "quantiles": {k: float(np.quantile(arr, p)) for k, p in
                      (("q025", 0.025), ("q500", 0.5), ("q975", 0.975))},
        "snap_fractions": {str(k): v / arr.size for k, v in sorted(snaps.items())},
        "rule": {"scale": "data-dependent" if scale_fn else "none",
                 "snap": list(nodes) if nodes else None},
    }


# ----------------------------------------------------------------- quarter step

QUARTER_STEP_STATUS = "experimental"


def quarter_step_interpolation(p) -> Dict:
    """
    EXPERIMENTAL rule: p + k*p/4 for k = 0..4 (exact rationals).  The values are
    not automatically canonical Henry nodes (for p=7: 7, 35/4, 21/2, 49/4, 14;
    only 7 and 14 are in SACRED_NODES) and no optimality claim is made.
    """
    p = to_fraction(p)
    if p <= 0:
        raise CoilValidationError("p must be strictly positive")
    vals = [p + k * p / 4 for k in range(5)]
    return {"rule": "p + k*p/4, k=0..4", "status": QUARTER_STEP_STATUS,
            "values": [_fmt(v) for v in vals], "approx": [float(v) for v in vals]}
