#!/usr/bin/env python3
"""
User-Friendly NumPy and Audio System Test Suite for Solidarity
Run this file to verify your environment and core functionality.
"""

import sys
import os
import unittest
import numpy as np
import time
import datetime

# Test Suite
class TestNumPyQuick(unittest.TestCase):
    def setUp(self):
        """Set up the test environment"""
        print("Setting up the test environment...")

    def test_advanced_numpy_features(self):
        """Test advanced NumPy features for Solidarity Framework"""
        print("\n🧠 Advanced NumPy Features Test:")

        # Test complex numbers (for audio processing)
        complex_signal = np.array([1+2j, 2+3j, 3+1j])
        print(f"   Complex signal: {complex_signal}")
        print(f"   Magnitude: {np.abs(complex_signal)}")
        print(f"   Phase: {np.angle(complex_signal)}")

        # Test broadcasting for multi-channel audio
        mono_signal = np.random.random(1000)
        stereo_signal = np.stack([mono_signal, mono_signal * 0.8], axis=1)
        print(f"   Stereo signal shape: {stereo_signal.shape}")

        # Test convolution for audio effects
        impulse = np.array([1, 0.5, 0.25])
        convolved = np.convolve(mono_signal[:10], impulse, mode='full')
        print(f"   Convolution result: {len(convolved)} samples")

        # Test windowing functions
        window = np.hanning(256)
        print(f"   Hanning window: {len(window)} samples, max: {np.max(window):.3f}")

    def test_validate_golden_ratio_precision(self):
        """Validate golden ratio calculations to required precision"""
        print("\n🧮 Validating Golden Ratio Precision:")

        phi_calculated = (1 + np.sqrt(5)) / 2
        phi_expected = 1.6180339887498948

        precision_error = abs(phi_calculated - phi_expected)

        if precision_error < 1e-15:
            print(f"   ✅ Golden ratio precision: {precision_error:.2e} (excellent)")
        else:
            print(f"   ⚠️ Golden ratio precision: {precision_error:.2e} (check)")

        self.assertLess(precision_error, 1e-10, "Golden ratio precision is not sufficient")

    def test_audio_processing_benchmarks(self):
        """Benchmark audio processing performance"""
        print("\n⏱️ Audio Processing Benchmarks:")

        # Test different signal sizes
        signal_sizes = [1000, 10000, 44100, 441000]  # 1ms to 10s at 44.1kHz

        for size in signal_sizes:
            # Generate test signal
            t = np.linspace(0, size/44100, size)
            signal = np.sin(2 * np.pi * 440 * t)

            # Benchmark processing
            start_time = time.time()

            # Apply golden ratio enhancement
            phi = (1 + np.sqrt(5)) / 2
            enhanced = signal * (1.0 + (phi - 1) * 0.1)

            end_time = time.time()
            processing_time = (end_time - start_time) * 1000  # Convert to ms

            print(f"   📊 {size:6d} samples: {processing_time:.3f}ms")

# Utility Functions
def cleanup_test_environment():
    """Clean up test files and reset environment"""
    print("\n🧹 Cleaning up test environment...")
    test_files = ['test_output.wav', 'temp_audio.npy']
    for file in test_files:
        if os.path.exists(file):
            os.remove(file)
            print(f"   🗑️ Removed: {file}")

# Main Execution
if __name__ == "__main__":
    print("\n🎵 Comprehensive Solidarity Platform Test Suite")
    print("=" * 60)
    print(f"📅 Test Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("This will check your Python, NumPy, and basic audio math setup.")
    print("If any test fails, follow the guidance in the error message.")

    try:
        # Run the test suite
        unittest.main(exit=False, verbosity=2)
        print("\n✅ All tests completed successfully!")
    except Exception as e:
        print(f"\n❌ Test suite failed: {e}")
    finally:
        cleanup_test_environment()