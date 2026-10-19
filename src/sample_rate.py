"""Validation helpers for the audio sample-rate configuration."""

import math
from numbers import Real


UNSET = object()
DEFAULT_SAMPLE_RATE_HZ = 44100
MIN_SAMPLE_RATE_HZ = 8000
MAX_SAMPLE_RATE_HZ = 192000


def validate_sample_rate_hz(value, name="sample_rate_hz"):
    if isinstance(value, bool) or not isinstance(value, Real):
        raise ValueError(
            f"{name} must be an integer between {MIN_SAMPLE_RATE_HZ} "
            f"and {MAX_SAMPLE_RATE_HZ} Hz"
        )
    try:
        finite = math.isfinite(value)
        integral = value == int(value)
    except (OverflowError, TypeError, ValueError):
        finite = False
        integral = False
    if not finite or not integral or not MIN_SAMPLE_RATE_HZ <= value <= MAX_SAMPLE_RATE_HZ:
        raise ValueError(
            f"{name} must be an integer between {MIN_SAMPLE_RATE_HZ} "
            f"and {MAX_SAMPLE_RATE_HZ} Hz"
        )
    return int(value)


def resolve_sample_rate_hz(
    *,
    sample_rate_hz=UNSET,
    sample_rate=UNSET,
    sampleRate=UNSET,
    default=DEFAULT_SAMPLE_RATE_HZ,
):
    supplied = [
        (name, value)
        for name, value in (
            ("sample_rate_hz", sample_rate_hz),
            ("sample_rate", sample_rate),
            ("sampleRate", sampleRate),
        )
        if value is not UNSET
    ]
    if not supplied:
        return validate_sample_rate_hz(default)

    validated = [(name, validate_sample_rate_hz(value, name)) for name, value in supplied]
    rates = {value for _, value in validated}
    if len(rates) != 1:
        names = ", ".join(name for name, _ in validated)
        raise ValueError(f"Conflicting sample-rate values were provided for {names}")
    return validated[0][1]


def sample_rate_from_config(config, default=UNSET):
    if not isinstance(config, dict):
        return default
    values = {
        key: config[key]
        for key in ("sample_rate_hz", "sample_rate", "sampleRate")
        if key in config
    }
    if not values:
        return default
    rate = resolve_sample_rate_hz(**values)
    if default is not UNSET and rate != default:
        raise ValueError(
            f"Request sample_rate_hz {rate} conflicts with configured sample_rate_hz {default}"
        )
    return rate
