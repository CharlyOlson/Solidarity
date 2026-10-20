"""Focused validation and frequency regressions for sample-rate propagation."""

import unittest

import numpy as np

from src.harmonics.advanced_analysis import AdvancedHarmonicAnalyzer
from src.main_integration import SolidarityHarmonicSystem
from src.sample_rate import resolve_sample_rate_hz
from src.solidarityAudioProcessor import MasterSolidarityAudioSystem, ProfessionalAudioProcessor


class SampleRateValidationTests(unittest.TestCase):
    def test_default_and_legacy_alias_resolve_to_the_canonical_rate(self):
        self.assertEqual(resolve_sample_rate_hz(), 44100)
        self.assertEqual(resolve_sample_rate_hz(sample_rate=48000), 48000)
        self.assertEqual(resolve_sample_rate_hz(sampleRate=16000), 16000)

    def test_invalid_and_conflicting_rates_are_rejected(self):
        for value in (None, True, False, 0, -1, 7999, 192001, float("nan"), float("inf"), "44100"):
            with self.subTest(value=value):
                with self.assertRaisesRegex(ValueError, "sample_rate_hz"):
                    resolve_sample_rate_hz(sample_rate_hz=value)
        with self.assertRaisesRegex(ValueError, "Conflicting sample-rate"):
            resolve_sample_rate_hz(sample_rate_hz=48000, sample_rate=44100)

    def test_pipeline_constructors_reject_conflicting_rates(self):
        with self.assertRaisesRegex(ValueError, "Conflicting sample-rate"):
            MasterSolidarityAudioSystem(sample_rate_hz=48000, sample_rate=44100)

    def test_processor_and_fft_analyzer_detect_tones_at_configured_rates(self):
        for sample_rate_hz in (16000, 44100, 48000):
            with self.subTest(sample_rate_hz=sample_rate_hz):
                sample_count = sample_rate_hz
                signal = np.sin(
                    2 * np.pi * 440 * np.arange(sample_count, dtype=np.float64) / sample_rate_hz
                )
                processor = ProfessionalAudioProcessor(sample_rate_hz=sample_rate_hz)
                peaks = processor.harmonic_analyzer(signal)
                dominant = max(peaks.values(), key=lambda peak: peak["magnitude"])
                self.assertLessEqual(
                    abs(dominant["frequency"] - 440),
                    sample_rate_hz / sample_count,
                )

                analyzer = AdvancedHarmonicAnalyzer(sample_rate_hz=sample_rate_hz)
                harmonics = analyzer.analyze_harmonics_fft(signal, 440, max_harmonics=1)
                self.assertLessEqual(
                    abs(harmonics[1]["actual_frequency"] - 440),
                    sample_rate_hz / sample_count,
                )

                system = SolidarityHarmonicSystem(sample_rate_hz=sample_rate_hz)
                result = system.process_audio_with_complete_pipeline(
                    signal,
                    enable_compression=False,
                    enable_temporal_control=False,
                )
                self.assertEqual(system.get_complete_system_status()["system"]["sample_rate_hz"], sample_rate_hz)
                self.assertEqual(len(result["output"]["processed_audio"]), sample_count)
                self.assertLessEqual(
                    abs(system.advanced_analyzer.analyze_harmonics_fft(signal, 440, 1)[1]["actual_frequency"] - 440),
                    sample_rate_hz / sample_count,
                )

    def test_master_rate_reaches_processor_and_delay_construction(self):
        system = MasterSolidarityAudioSystem(sample_rate=16000)
        self.assertEqual(system.sample_rate_hz, 16000)
        self.assertEqual(system.professional_processor.sample_rate_hz, 16000)
        signal = np.zeros(3200)
        signal[0] = 1
        delayed = system.professional_processor.delay_processor(signal, delay_time=0.1, feedback=0.5)
        self.assertEqual(delayed[1600], 0.5)

    def test_silent_signal_negative_infinite_thd_is_a_defined_result(self):
        analyzer = AdvancedHarmonicAnalyzer()
        analysis = analyzer.calculate_total_harmonic_distortion(np.zeros(1024), 0)
        self.assertEqual(analysis["fundamental_power"], 0)
        self.assertEqual(analysis["thd_db"], float("-inf"))


if __name__ == "__main__":
    unittest.main()
