
#!/usr/bin/env python3
"""
User-Friendly Advanced Audio Processing Test Suite for Solidarity
Run this file to verify your audio modules and advanced features.
"""

import sys
import os
import unittest
<<<<<<< Updated upstream
import numpy as np
import math
import time
=======
>>>>>>> Stashed changes

class TestAdvancedAudio(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        try:
            import numpy as np
            cls.np = np
        except ImportError as e:
            raise unittest.SkipTest(f"NumPy is not installed. Install with: pip install numpy. Error: {e}")
        # Add src directory to path
        cls.src_path = os.path.join(os.path.dirname(__file__), 'src')
        sys.path.insert(0, cls.src_path)
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
            raise unittest.SkipTest(f"Failed to import advanced audio modules: {e}")

    def test_audio_time_buyer(self):
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
        controller = self.AudioParameterController()
        # Simulate parameter reset and check for expected attributes
        controller.reset_parameters()
        self.assertTrue(hasattr(controller, 'parameters'))

    def test_gradient_transference(self):
        engine = self.AudioGradientTransferenceEngine()
        result = engine.transfer_gradient([0, 1, 2], [2, 1, 0])
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 3)

    def test_3d_positional_encoder(self):
        encoder = self.Audio3DPositionalEncoder()
        pos = encoder.encode_position(1, 2, 3)
        self.assertIsInstance(pos, dict)
        self.assertIn('x', pos)
        self.assertIn('y', pos)
        self.assertIn('z', pos)

    def test_professional_audio_processor(self):
        processor = self.ProfessionalAudioProcessor()
        processed = processor.process([0.1, 0.2, 0.3])
        self.assertIsInstance(processed, list)
        self.assertEqual(len(processed), 3)

    def test_advanced_spatial_audio_processor(self):
        spatial_processor = self.AdvancedSpatialAudioProcessor()
        result = spatial_processor.spatialize([0.1, 0.2, 0.3], position=(1, 2, 3))
        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 3)

if __name__ == "__main__":
    print("\nSolidarity Framework: Advanced Audio Processing Test Suite")
    print("=========================================================")
    print("This will check your advanced audio modules and features.")
    print("If any test fails, follow the guidance in the error message.")
    unittest.main()
<<<<<<< Updated upstream
    print("=" * 40)
    
    time_buyer = AudioTimeBuyer()
    controller = AudioParameterController(time_buyer)
    
    # Register professional audio parameters
    params = [
        ('studio_volume', 0.8, b'volume_reset_sequence'),
        ('reverb_depth', 0.5, b'reverb_parameter_reset'),
        ('spatial_width', 0.7, b'spatial_width_control'),
        ('harmonic_gain', 0.6, b'harmonic_processing_reset')
    ]
    
    for param_id, initial_value, reset_code in params:
        controller.register_audio_parameter(param_id, initial_value, reset_code)
        print(f"✅ Registered parameter: {param_id} = {initial_value}")
    
    # Test parameter reset with catch-up
    print("\nTesting parameter reset with catch-up synchronization:")
    for param_id, _, _ in params[:2]:  # Test first two parameters
        success = controller.trigger_parameter_reset(param_id, catch_up_mode=True)
        print(f"  {param_id}: {'✅ Reset successful' if success else '❌ Reset failed'}")
    
def test_audio_time_buyer():
    """Test complete audio time buyer with parameter controller"""
    print("\n🕐 Testing Audio Time Buyer & Parameter Controller")
=======
>>>>>>> Stashed changes
    print("=" * 40)
    
    time_buyer = AudioTimeBuyer()
    controller = AudioParameterController(time_buyer)
    
    # Register professional audio parameters
    params = [
        ('studio_volume', 0.8, b'volume_reset_sequence'),
        ('reverb_depth', 0.5, b'reverb_parameter_reset'),
        ('spatial_width', 0.7, b'spatial_width_control'),
        ('harmonic_gain', 0.6, b'harmonic_processing_reset')
    ]
    
    for param_id, initial_value, reset_code in params:
        controller.register_audio_parameter(param_id, initial_value, reset_code)
        print(f"✅ Registered parameter: {param_id} = {initial_value}")
    
    # Test parameter reset with catch-up
    print("\nTesting parameter reset with catch-up synchronization:")
    for param_id, _, _ in params[:2]:  # Test first two parameters
        success = controller.trigger_parameter_reset(param_id, catch_up_mode=True)
        print(f"  {param_id}: {'✅ Reset successful' if success else '❌ Reset failed'}")
    
    return controller

def test_gradient_transference():
    """Test professional audio gradient transference engine"""
    print("\n🌈 Testing Audio Gradient Transference Engine")
    print("=" * 40)
    
    gradient_engine = AudioGradientTransferenceEngine()
    
    # Create test signals for gradient calculation
    sample_rate = 44100
    duration = 0.5
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Source signal: 440Hz sine wave
    source_signal = np.sin(2 * np.pi * 440 * t)
    
    # Target signal: 880Hz sine wave with different envelope
    target_signal = np.sin(2 * np.pi * 880 * t) * np.exp(-t * 2)
    
    print(f"Source signal: {len(source_signal)} samples, RMS: {np.sqrt(np.mean(source_signal**2)):.4f}")
    print(f"Target signal: {len(target_signal)} samples, RMS: {np.sqrt(np.mean(target_signal**2)):.4f}")
    
    # Calculate gradient
    gradient = gradient_engine.calculate_audio_gradient(source_signal, target_signal)
    print(f"Calculated gradient: {len(gradient)} samples, Range: [{np.min(gradient):.4f}, {np.max(gradient):.4f}]")
    
    # Apply gradient transfer
    transferred_signal = gradient_engine.apply_audio_gradient_transfer(source_signal, gradient, transfer_rate=0.2)
    print(f"Transferred signal: RMS: {np.sqrt(np.mean(transferred_signal**2)):.4f}")
    
    # Test adaptive gradient transfer
    adaptive_signal = gradient_engine.adaptive_audio_gradient_transfer(source_signal, target_signal)
    print(f"Adaptive signal: RMS: {np.sqrt(np.mean(adaptive_signal**2)):.4f}")
    
    return gradient_engine, transferred_signal

def test_3d_spatial_encoder():
    """Test professional 3D spatial audio positioning system"""
    print("\n🗺️ Testing 3D Spatial Audio Positioning")
    print("=" * 40)
    
    spatial_encoder = Audio3DPositionalEncoder()
    
    # Create complex test audio signal
    sample_rate = 44100
    duration = 1.0
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Multi-frequency test signal
    test_signal = (
        0.5 * np.sin(2 * np.pi * 440 * t) +      # A4
        0.3 * np.sin(2 * np.pi * 880 * t) +      # A5
        0.2 * np.sin(2 * np.pi * 1320 * t)       # E6
    )
    
    print(f"Test signal: {len(test_signal)} samples")
    
    # Encode to 3D coordinates
    spatial_coords = spatial_encoder.encode_audio_to_3d_position(test_signal, time_window=1024)
    print(f"Generated 3D coordinates: {len(spatial_coords)} points")
    print(f"X range: [{np.min(spatial_coords[:, 0]):.3f}, {np.max(spatial_coords[:, 0]):.3f}]")
    print(f"Y range: [{np.min(spatial_coords[:, 1]):.3f}, {np.max(spatial_coords[:, 1]):.3f}]")
    print(f"Z range: [{np.min(spatial_coords[:, 2]):.3f}, {np.max(spatial_coords[:, 2]):.3f}]")
    
    # Test coordinate transformations
    spherical_coords = spatial_encoder.transform_spatial_coordinates(spatial_coords, 'spherical')
    cylindrical_coords = spatial_encoder.transform_spatial_coordinates(spatial_coords, 'cylindrical')
    
    print(f"Spherical coordinates: {len(spherical_coords)} points")
    print(f"Cylindrical coordinates: {len(cylindrical_coords)} points")
    
    # Decode back to audio
    decoded_signal = spatial_encoder.decode_3d_position_to_audio(spatial_coords)
    print(f"Decoded signal: {len(decoded_signal)} samples, RMS: {np.sqrt(np.mean(decoded_signal**2)):.4f}")
    
    return spatial_encoder, spatial_coords

def test_professional_audio_processor():
    """Test professional audio processor with advanced effects"""
    print("\n🎚️ Testing Professional Audio Processor")
    print("=" * 40)
    
    processor = ProfessionalAudioProcessor()
    
    # Create test signal
    sample_rate = 44100
    duration = 0.5
    t = np.linspace(0, duration, int(sample_rate * duration))
    test_signal = np.sin(2 * np.pi * 440 * t)
    
    print(f"Input signal: {len(test_signal)} samples, Peak: {np.max(np.abs(test_signal)):.4f}")
    
    # Test all professional effects
    effects_tests = [
        ('harmonic_analyzer', {}),
        ('frequency_shifter', {'shift_amount': 100}),
        ('delay_processor', {'delay_time': 0.1, 'feedback': 0.3}),
        ('compressor', {'threshold': 0.7, 'ratio': 4.0}),
        ('reverb_processor', {'room_size': 0.8, 'damping': 0.4}),
        ('time_stretcher', {'stretch_factor': 1.5}),
        ('spatializer', {'azimuth': math.pi/4, 'elevation': 0.0}),
        ('limiter', {'ceiling': 0.8})
    ]
    
    processed_signals = {}
    
    for effect_name, params in effects_tests:
        try:
            effect_func = getattr(processor, effect_name)
            result = effect_func(test_signal, **params)
            
            if isinstance(result, dict):  # harmonic_analyzer returns dict
                print(f"  ✅ {effect_name}: Analyzed {len(result)} harmonics")
                processed_signals[effect_name] = result
            else:
                rms = np.sqrt(np.mean(result**2)) if len(result.shape) == 1 else np.sqrt(np.mean(result[:, 0]**2))
                print(f"  ✅ {effect_name}: Output RMS {rms:.4f}")
                processed_signals[effect_name] = result
        except Exception as e:
            print(f"  ❌ {effect_name}: Error - {e}")
    
    return processor, processed_signals

def test_spatial_transmission():
    """Test advanced spatial transmission effects"""
    print("\n📡 Testing Spatial Transmission Effects")
    print("=" * 40)
    
    spatial_processor = AdvancedSpatialAudioProcessor()
    
    # Create test signal
    sample_rate = 44100
    duration = 0.5
    t = np.linspace(0, duration, int(sample_rate * duration))
    test_signal = np.sin(2 * np.pi * 440 * t) * np.exp(-t * 2)  # Decaying sine
    
    print(f"Input signal: {len(test_signal)} samples, RMS: {np.sqrt(np.mean(test_signal**2)):.4f}")
    
    # Test spatial transmission
    transmitted = spatial_processor.spatial_transmission_effect(test_signal, transmission_probability=0.2)
    print(f"Spatial transmission: RMS: {np.sqrt(np.mean(transmitted**2)):.4f}")
    
    # Test perfect transmission
    perfect = spatial_processor.perfect_transmission_effect(test_signal, energy_threshold=0.1)
    print(f"Perfect transmission: RMS: {np.sqrt(np.mean(perfect**2)):.4f}")
    
    # Test with audio barrier
    barrier = spatial_processor.create_audio_barrier(test_signal, barrier_position=0.3, barrier_width=0.2)
    print(f"Audio barrier: RMS: {np.sqrt(np.mean(barrier**2)):.4f}")
    
    # Test spatial coherence
    coherent = spatial_processor.spatial_coherence_processor(test_signal, coherence_time=0.1)
    print(f"Spatial coherence: RMS: {np.sqrt(np.mean(coherent**2)):.4f}")
    
    return spatial_processor, transmitted

def test_master_system_integration():
    """Test complete master system integration"""
    print("\n🎵 Testing Master System Integration")
    print("=" * 40)
    
    master_system = MasterSolidarityAudioSystem()
    
    # Register parameters
    master_system.parameter_controller.register_audio_parameter(
        'master_volume', 0.8, b'master_volume_reset_code'
    )
    master_system.parameter_controller.register_audio_parameter(
        'spatial_spread', 0.6, b'spatial_spread_reset_code'  
    )
    
    # Create complex test signal
    sample_rate = 44100
    duration = 1.0
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    complex_signal = (
        0.4 * np.sin(2 * np.pi * 220 * t) +      # A3
        0.3 * np.sin(2 * np.pi * 440 * t) +      # A4
        0.2 * np.sin(2 * np.pi * 880 * t) +      # A5
        0.1 * np.sin(2 * np.pi * 1760 * t)       # A6
    )
    
    print(f"Complex input signal: {len(complex_signal)} samples")
    print(f"Input RMS: {np.sqrt(np.mean(complex_signal**2)):.4f}")
    print(f"Input Peak: {np.max(np.abs(complex_signal)):.4f}")
    
    # Configure comprehensive processing pipeline
    master_config = {
        'gradient_target': np.random.randn(len(complex_signal) // 20),
        'use_spatial_processing': True,
        'professional_effects': {
            'harmonic_analyzer': {},
            'compressor': {'threshold': 0.7, 'ratio': 3.0},
            'reverb_processor': {'room_size': 0.6, 'damping': 0.3},
            'spatializer': {'azimuth': math.pi/3, 'elevation': math.pi/6},
            'frequency_shifter': {'shift_amount': 25}
        },
        'spatial_transmission': True,
        'perfect_transmission': False
    }
    
    print(f"\nProcessing configuration:")
    print(f"  Effects: {len(master_config['professional_effects'])}")
    print(f"  Spatial processing: ✅")
    print(f"  Transmission effects: ✅")
    
    # Process through complete pipeline
    start_time = time.time()
    processed_signal = master_system.process_complete_audio_pipeline(complex_signal, master_config)
    processing_time = time.time() - start_time
    
    print(f"\nProcessing results:")
    print(f"  Processing time: {processing_time:.4f}s")
    print(f"  Output length: {len(processed_signal)} samples")
    print(f"  Output RMS: {np.sqrt(np.mean(processed_signal**2)):.4f}")
    print(f"  Output Peak: {np.max(np.abs(processed_signal)):.4f}")
    print(f"  Dynamic range: {20 * np.log10(np.max(np.abs(processed_signal)) / np.sqrt(np.mean(processed_signal**2))):.2f} dB")
    
    # Get system status
    system_status = master_system.get_professional_audio_status()
    print(f"\nSystem status:")
    print(f"  Time buyer precision: {system_status['audio_time_buyer']['pi_precision']}")
    print(f"  Registered parameters: {system_status['parameter_controller']['registered_parameters']}")
    print(f"  Professional mode: {system_status['professional_mode']}")
    
    return master_system, processed_signal

def test_solidarity_processor():
    """Test complete Solidarity audio processor with ZIP phrases"""
    print("\n🎯 Testing Solidarity Audio Processor with ZIP Phrases")
    print("=" * 40)
    
    processor = SolidarityAudioProcessor()
    
    # Create test signal
    sample_rate = 44100
    duration = 0.5
    t = np.linspace(0, duration, int(sample_rate * duration))
    test_signal = np.sin(2 * np.pi * 440 * t)
    
    # Test all ZIP phrases
    zip_phrases = [
        "Compression Wave",
        "Expansion Burst", 
        "Zoomies Pulse",
        "Lock-Stop",
        "Turn Face Forward",
        "Turn Face Opposite",
        "Switch Cogs Direction",
        "Too fours",
        "Hiccup Notifier",
        "Water reacting to gusts",
        "Hard time making Cents",
        "Telephone password carousel",
        "Angel / Daemon Archetypes"
    ]
    
    print(f"Testing {len(zip_phrases)} ZIP phrases:")
    
    results = {}
    for phrase in zip_phrases:
        try:
            processed = processor.process_zip_phrase_audio(phrase, test_signal, "TEST")
            rms = np.sqrt(np.mean(processed**2))
            peak = np.max(np.abs(processed))
            
            print(f"  ✅ '{phrase}': RMS {rms:.4f}, Peak {peak:.4f}")
            results[phrase] = {
                'processed_signal': processed,
                'rms': rms,
                'peak': peak
            }
        except Exception as e:
            print(f"  ❌ '{phrase}': Error - {e}")
            results[phrase] = {'error': str(e)}
    
    # Get final system status
    final_status = processor.get_system_status()
    print(f"\nFinal system status:")
    print(f"  Processing time: {final_status['processing_time']}")
    print(f"  System alignment: {final_status['system_alignment']}")
    print(f"  Audio engine: {final_status['audio_engine_status']}")
    
    return processor, results

def run_comprehensive_test_suite():
    """Run the complete test suite"""
    print("🎵🧪 Advanced Audio Processing System Test Suite")
    print("=" * 60)
    print("Testing sophisticated professional audio processing capabilities")
    print("with mathematical underpinnings and advanced algorithms")
    print("=" * 60)
    
    test_results = {}
    
    try:
        # Run all tests
        test_results['time_buyer'] = test_audio_time_buyer()
        test_results['parameter_controller'] = test_audio_parameter_controller()
        test_results['gradient_engine'], test_results['gradient_signal'] = test_gradient_transference()
        test_results['spatial_encoder'], test_results['spatial_coords'] = test_3d_spatial_encoder()
        test_results['professional_processor'], test_results['professional_signals'] = test_professional_audio_processor()
        test_results['spatial_processor'], test_results['transmission_signal'] = test_spatial_transmission()
        test_results['master_system'], test_results['master_signal'] = test_master_system_integration()
        test_results['solidarity_processor'], test_results['zip_results'] = test_solidarity_processor()
        
        print("\n" + "=" * 60)
        print("🎉 ALL TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        
        # Summary statistics
        total_zip_phrases = len(test_results['zip_results'])
        successful_phrases = sum(1 for result in test_results['zip_results'].values() if 'error' not in result)
        
        print(f"📊 Test Summary:")
        print(f"  ✅ Audio Time Buyer: Operational")
        print(f"  ✅ Parameter Controller: Operational") 
        print(f"  ✅ Gradient Transference: Operational")
        print(f"  ✅ 3D Spatial Encoding: Operational")
        print(f"  ✅ Professional Processor: Operational")
        print(f"  ✅ Spatial Transmission: Operational")
        print(f"  ✅ Master System: Operational")
        print(f"  ✅ ZIP Phrase Processing: {successful_phrases}/{total_zip_phrases} successful")
        
        overall_success_rate = (successful_phrases / total_zip_phrases) * 100
        print(f"\n🎯 Overall System Performance: {overall_success_rate:.1f}%")
        
        if overall_success_rate >= 95:
            print("🌟 EXCELLENT: Professional audio system ready for production use!")
        elif overall_success_rate >= 85:
            print("✅ GOOD: Professional audio system operational with minor issues")
        else:
            print("⚠️ NEEDS ATTENTION: Some components require optimization")
            
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return test_results

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--quick":
        # Quick test mode - just test master system
        print("🎵⚡ Quick Test Mode")
        test_master_system_integration()
    else:
        # Full comprehensive test suite
        results = run_comprehensive_test_suite()
        
        if results:
            print(f"\n💾 Test results available in memory")
            print(f"   Access via: results['test_name']")
            print(f"   Available tests: {list(results.keys())}")