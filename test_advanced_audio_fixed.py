#!/usr/bin/env python3
"""
User-Friendly Advanced Audio Processing Test Suite for Solidarity
Run this file to verify your audio modules and advanced features.
"""

import sys
import os
import unittest
import time
import math

# Import unified workspace mapper
from workspace_mapper import workspace_mapper, setup_unified_workspace

class TestAdvancedAudio(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("🔧 Setting up unified workspace for testing...")
        
        # Setup unified workspace mapping
        setup_unified_workspace()
        
        try:
            import numpy as np
            cls.np = np
        except ImportError as e:
            raise unittest.SkipTest(f"NumPy is not installed. Install with: pip install numpy. Error: {e}")
        
        # Try to import audio modules using unified workspace mapper
        cls.modules_available = False
        cls.import_errors = []
        
        try:
            # Use unified import system
            audio_module = workspace_mapper.unified_import('solidarityAudioProcessor')
            
            # Extract classes from the module
            cls.MasterSolidarityAudioSystem = getattr(audio_module, 'MasterSolidarityAudioSystem', None)
            cls.SolidarityAudioProcessor = getattr(audio_module, 'SolidarityAudioProcessor', None)
            cls.AudioTimeBuyer = getattr(audio_module, 'AudioTimeBuyer', None)
            cls.AudioParameterController = getattr(audio_module, 'AudioParameterController', None)
            cls.AudioGradientTransferenceEngine = getattr(audio_module, 'AudioGradientTransferenceEngine', None)
            cls.Audio3DPositionalEncoder = getattr(audio_module, 'Audio3DPositionalEncoder', None)
            cls.ProfessionalAudioProcessor = getattr(audio_module, 'ProfessionalAudioProcessor', None)
            cls.AdvancedSpatialAudioProcessor = getattr(audio_module, 'AdvancedSpatialAudioProcessor', None)
            
            # Check if essential classes are available
            essential_classes = [cls.AudioTimeBuyer, cls.AudioParameterController]
            if all(cls is not None for cls in essential_classes):
                cls.modules_available = True
                print("✅ Audio modules successfully imported from unified workspace")
            else:
                missing = [name for name, cls_obj in [
                    ('AudioTimeBuyer', cls.AudioTimeBuyer),
                    ('AudioParameterController', cls.AudioParameterController)
                ] if cls_obj is None]
                cls.import_errors.append(f"Missing essential classes: {missing}")
                
        except ImportError as e:
            cls.import_errors.append(f"Failed to import solidarityAudioProcessor: {e}")
        
        # Try importing other modules
        try:
            cls.golden_harmonic = workspace_mapper.unified_import('goldenHarmonicSystem')
        except ImportError as e:
            cls.import_errors.append(f"goldenHarmonicSystem not available: {e}")
            cls.golden_harmonic = None
            
        try:
            cls.ultimate_system = workspace_mapper.unified_import('ultimateSolidaritySystem')
        except ImportError as e:
            cls.import_errors.append(f"ultimateSolidaritySystem not available: {e}")
            cls.ultimate_system = None
            
        # Print import status
        if cls.modules_available:
            print("✅ All essential audio modules loaded successfully")
        else:
            print("⚠️ Some modules missing, will skip related tests")
            for error in cls.import_errors:
                print(f"   - {error}")
        
        # Print workspace status
        status = workspace_mapper.get_workspace_status()
        print(f"📊 Workspace Status: {len(status['discovered_workspaces'])} workspaces, {len(status['cached_modules'])} modules cached")

    def setUp(self):
        if not self.modules_available:
            self.skipTest("Audio modules not available")

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
        # Test parameter registration
        controller.register_audio_parameter('test_param', 0.5, b'test_code')
        self.assertTrue(hasattr(controller, 'parameters'))
        self.assertIn('test_param', controller.parameters)

    def test_gradient_transference(self):
        """Test AudioGradientTransferenceEngine functionality"""
        engine = self.AudioGradientTransferenceEngine()
        source = self.np.array([0, 1, 2])
        target = self.np.array([2, 1, 0])
        gradient = engine.calculate_audio_gradient(source, target)
        self.assertIsInstance(gradient, self.np.ndarray)
        self.assertEqual(len(gradient), 3)

    def test_3d_positional_encoder(self):
        """Test Audio3DPositionalEncoder functionality"""
        encoder = self.Audio3DPositionalEncoder()
        # Test with a simple audio signal
        signal = self.np.array([0.1, 0.2, 0.3, 0.4, 0.5])
        coords = encoder.encode_audio_to_3d_position(signal, time_window=5)
        self.assertIsInstance(coords, self.np.ndarray)
        self.assertEqual(coords.shape[1], 3)  # Should have 3D coordinates

    def test_professional_audio_processor(self):
        """Test ProfessionalAudioProcessor functionality"""
        processor = self.ProfessionalAudioProcessor()
        signal = self.np.array([0.1, 0.2, 0.3, 0.4, 0.5])
        # Test harmonic analyzer
        result = processor.harmonic_analyzer(signal)
        self.assertIsInstance(result, dict)
        # Test compressor
        compressed = processor.compressor(signal)
        self.assertIsInstance(compressed, self.np.ndarray)
        self.assertEqual(len(compressed), len(signal))

    def test_advanced_spatial_audio_processor(self):
        """Test AdvancedSpatialAudioProcessor functionality"""
        spatial_processor = self.AdvancedSpatialAudioProcessor()
        signal = self.np.array([0.1, 0.2, 0.3, 0.4, 0.5])
        # Test spatial transmission effect
        result = spatial_processor.spatial_transmission_effect(signal)
        self.assertIsInstance(result, self.np.ndarray)
        self.assertEqual(len(result), len(signal))
        # Test perfect transmission effect
        perfect = spatial_processor.perfect_transmission_effect(signal)
        self.assertIsInstance(perfect, self.np.ndarray)
        self.assertEqual(len(perfect), len(signal))

class TestBasicAudioMath(unittest.TestCase):
    """Basic audio math tests that don't require audio modules"""
    
    @classmethod
    def setUpClass(cls):
        try:
            import numpy as np
            cls.np = np
        except ImportError as e:
            raise unittest.SkipTest(f"NumPy is not installed. Install with: pip install numpy. Error: {e}")

    def test_golden_ratio_precision(self):
        """Test golden ratio calculations"""
        phi = (1 + self.np.sqrt(5)) / 2
        expected = 1.6180339887498948
        precision_error = abs(phi - expected)
        self.assertLess(precision_error, 1e-10, "Golden ratio precision insufficient")

    def test_basic_audio_signal_generation(self):
        """Test basic audio signal generation"""
        sample_rate = 44100
        duration = 0.1  # 100ms
        frequency = 440  # A4
        
        t = self.np.linspace(0, duration, int(sample_rate * duration))
        signal = self.np.sin(2 * self.np.pi * frequency * t)
        
        self.assertEqual(len(signal), int(sample_rate * duration))
        self.assertAlmostEqual(self.np.max(signal), 1.0, places=5)
        self.assertAlmostEqual(self.np.min(signal), -1.0, places=5)

    def test_audio_processing_performance(self):
        """Test audio processing performance"""
        signal_sizes = [1000, 10000, 44100]
        
        for size in signal_sizes:
            t = self.np.linspace(0, size/44100, size)
            signal = self.np.sin(2 * self.np.pi * 440 * t)
            
            start_time = time.time()
            # Apply golden ratio enhancement
            phi = (1 + self.np.sqrt(5)) / 2
            enhanced = signal * (1.0 + (phi - 1) * 0.1)
            processing_time = time.time() - start_time
            
            self.assertLess(processing_time, 1.0, f"Processing too slow for {size} samples")
            self.assertEqual(len(enhanced), size)

def run_comprehensive_tests():
    """Run all available tests"""
    print("\n🎵 Solidarity Framework: Advanced Audio Processing Test Suite")
    print("=" * 60)
    print("Testing audio processing capabilities and basic functionality")
    print("=" * 60)
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test cases
    suite.addTests(loader.loadTestsFromTestCase(TestAdvancedAudio))
    suite.addTests(loader.loadTestsFromTestCase(TestBasicAudioMath))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 60)
    if result.wasSuccessful():
        print("🎉 ALL TESTS PASSED!")
    else:
        print(f"❌ {len(result.failures)} failures, {len(result.errors)} errors")
    print("=" * 60)
    
    return result.wasSuccessful()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--quick":
        # Quick test mode - just run basic math tests
        print("🎵⚡ Quick Test Mode - Basic Math Only")
        suite = unittest.TestLoader().loadTestsFromTestCase(TestBasicAudioMath)
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        print(f"\nQuick test {'PASSED' if result.wasSuccessful() else 'FAILED'}")
    else:
        # Full test suite
        run_comprehensive_tests()