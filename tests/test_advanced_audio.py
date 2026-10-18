#!/usr/bin/env python3
"""
User-Friendly Advanced Audio Processing Test Suite for Solidarity
Run this file to verify your audio modules and advanced features.
"""

import sys
import os
import unittest
import importlib.util

class TestAdvancedAudio(unittest.TestCase):
    """Test suite for advanced audio processing capabilities"""
    
    @classmethod
    def setUpClass(cls):
        """Set up the test environment with required modules"""
        # Check for NumPy
        try:
            import numpy as np
            cls.np = np
        except ImportError as e:
            if os.environ.get("REQUIRE_PYTHON_INTEGRATION") == "1":
                raise
            raise unittest.SkipTest(f"NumPy is not installed. Install with: pip install numpy. Error: {e}")
        
        # Add src directory to path
        cls.src_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src')
        sys.path.insert(0, cls.src_path)
        
        # Import audio processing classes
        try:
            from solidarityAudioProcessor import (
                MasterSolidarityAudioSystem,
                SolidarityAudioProcessor,
                AudioTimeBuyer,
                AudioParameterController,
                AudioGradientTransferenceEngine,
                Audio3DPositionalEncoder,
                ProfessionalAudioProcessor,
                AdvancedSpatialAudioProcessor
            )
            cls.MasterSolidarityAudioSystem = MasterSolidarityAudioSystem
            cls.SolidarityAudioProcessor = SolidarityAudioProcessor
            cls.AudioTimeBuyer = AudioTimeBuyer
            cls.AudioParameterController = AudioParameterController
            cls.AudioGradientTransferenceEngine = AudioGradientTransferenceEngine
            cls.Audio3DPositionalEncoder = Audio3DPositionalEncoder
            cls.ProfessionalAudioProcessor = ProfessionalAudioProcessor
            cls.AdvancedSpatialAudioProcessor = AdvancedSpatialAudioProcessor
        except ImportError as e:
            if os.environ.get("REQUIRE_PYTHON_INTEGRATION") == "1":
                raise
            raise unittest.SkipTest(f"Failed to import advanced audio modules: {e}")

    def test_audio_time_buyer(self):
        """Test AudioTimeBuyer functionality"""
        time_buyer = self.AudioTimeBuyer(sample_rate=44100, pi_precision=16)
        test_codes = [
            b"compression_wave_reset",
            b"spatial_audio_positioning",
            b"harmonic_analysis_deep",
            b"professional_studio_effects"
        ]
        for code in test_codes:
            allocated_time = time_buyer.code_bytes_to_time(code)
            self.assertIsInstance(allocated_time, float)
            self.assertGreater(allocated_time, 0)
        self.assertEqual(time_buyer.pi_precision, 16)
        self.assertTrue(len(time_buyer.pi_expanded) >= 5)

    def test_audio_parameter_controller(self):
        """Test AudioParameterController functionality"""
        controller = self.AudioParameterController()
        # Test parameter reset and check for expected attributes
        if hasattr(controller, 'reset_parameters'):
            controller.reset_parameters()
        self.assertTrue(hasattr(controller, 'parameters'))
        
        # Register test parameter
        if hasattr(controller, 'register_audio_parameter'):
            controller.register_audio_parameter('test_param', 0.5, b'test_reset_code')
            self.assertIn('test_param', controller.parameters)

    def test_gradient_transference(self):
        """Test gradient transference functionality"""
        engine = self.AudioGradientTransferenceEngine()
        if hasattr(engine, 'transfer_gradient'):
            result = engine.transfer_gradient([0, 1, 2], [2, 1, 0])
            self.assertIsInstance(result, list)
            self.assertEqual(len(result), 3)
        else:
            self.skipTest("transfer_gradient method not found")

    def test_solidarity_processor_exists(self):
        """Test SolidarityAudioProcessor instantiation"""
        processor = self.SolidarityAudioProcessor()
        self.assertIsInstance(processor, self.SolidarityAudioProcessor)
        self.assertTrue(hasattr(processor, 'process_zip_phrase_audio'))

if __name__ == "__main__":
    print("\nSolidarity Framework: Advanced Audio Processing Test Suite")
    print("=========================================================")
    print("This will check your advanced audio modules and features.")
    print("If any test fails, follow the guidance in the error message.")
    unittest.main()
