#!/usr/bin/env python3
"""
User-Friendly NumPy and Audio System Test Suite for Solidarity
Run this file to verify your environment and core functionality.
"""

import sys
import os
import unittest
import datetime
import importlib.util

class TestNumPyQuick(unittest.TestCase):
    """Test suite for NumPy installation and basic functionality"""
    
    def setUp(self):
        """Setup test environment, check for NumPy"""
        # Check for NumPy
        try:
            import numpy as np
            self.np = np
        except ImportError:
            self.fail("NumPy is not installed. Install with: pip install numpy")

    def test_numpy_import(self):
        """Verify NumPy can be imported"""
        self.assertTrue(hasattr(self, 'np'), "NumPy import failed")
        
    def test_basic_math(self):
        """Test basic NumPy math operations"""
        a = self.np.array([1, 2, 3])
        b = self.np.array([4, 5, 6])
        # Test addition
        result = a + b
        self.assertTrue(self.np.array_equal(result, self.np.array([5, 7, 9])),
                        f"NumPy addition failed: {result}")
        
    def test_golden_ratio(self):
        """Test golden ratio calculation"""
        phi = (1 + self.np.sqrt(5)) / 2
        self.assertAlmostEqual(phi, 1.618033988749895, places=10, 
                              msg="Golden ratio calculation imprecise")
                              
    def test_sine_wave_generation(self):
        """Test creating audio sine wave"""
        sample_rate = 44100
        duration = 0.1  # 100ms
        t = self.np.linspace(0, duration, int(sample_rate * duration))
        sine_wave = self.np.sin(2 * self.np.pi * 440 * t)
        
        self.assertEqual(len(sine_wave), int(sample_rate * duration),
                         "Generated sine wave has incorrect length")
        self.assertAlmostEqual(max(sine_wave), 1.0, places=5,
                              msg="Sine wave amplitude incorrect")

    def test_audio_processing_imports(self):
        """Test importing the audio processing module if available"""
        src_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src')
        sys.path.insert(0, src_path)
        try:
            from solidarityAudioProcessor import MasterSolidarityAudioSystem
            self.assertIsNotNone(MasterSolidarityAudioSystem)
        except ImportError as exc:
            if os.environ.get("REQUIRE_PYTHON_INTEGRATION") == "1":
                self.fail(f"SolidarityAudioProcessor unavailable: {exc}")
            self.skipTest("SolidarityAudioProcessor module not found")

if __name__ == "__main__":
    print("\nSolidarity Framework: Quick NumPy and Audio System Test Suite")
    print("============================================================")
    print("This will check your Python, NumPy, and basic audio math setup.")
    print("If any test fails, follow the guidance in the error message.")
    print(f"📅 Test Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    unittest.main()
