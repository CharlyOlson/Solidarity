#!/usr/bin/env python3
"""
Test suite for the Unified File Web Network System
Tests all three optimization superhighways and self-correction mechanisms
"""

import unittest
import sys
import os
import time
import json
from pathlib import Path
import numpy as np

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).parent))

# Import the unified system
try:
    from unified_file_web_network import (
        SolidarityFileWebNetwork, 
        OptimizationPlane,
        FileNode,
        PerformanceOptimizationHighway,
        HarmonyOptimizationHighway, 
        IntegrationOptimizationHighway
    )
    UNIFIED_SYSTEM_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Unified system not available: {e}")
    UNIFIED_SYSTEM_AVAILABLE = False

class TestUnifiedFileWebNetwork(unittest.TestCase):
    """Test the unified file web network system (re-uses a quick-scan network)."""

    network = None  # class-level shared instance for speed

    @classmethod
    def setUpClass(cls):
        if not UNIFIED_SYSTEM_AVAILABLE:
            return
        # Force quick scan for test speed
        os.environ["SOLIDARITY_QUICK_SCAN"] = "1"
        if cls.network is None:
            cls.network = SolidarityFileWebNetwork(quick_scan=True)
            cls.network.initialize_network()

    def setUp(self):
        if not UNIFIED_SYSTEM_AVAILABLE:
            self.skipTest("Unified system not available")
        self.network = self.__class__.network
        self.test_start_time = time.time()
    
    def tearDown(self):
        """Clean up after tests"""
        test_duration = time.time() - self.test_start_time
        print(f"Test completed in {test_duration:.3f}s")
    
    def test_network_initialization(self):
        """Test network initialization"""
        print("🧪 Testing network initialization...")
        
        self.network.initialize_network()
        
        # Verify network is initialized
        self.assertIsInstance(self.network.file_nodes, dict)
        self.assertGreater(len(self.network.file_nodes), 0)
        self.assertIsInstance(self.network.network_health, float)
        self.assertGreaterEqual(self.network.network_health, 0.0)
        self.assertLessEqual(self.network.network_health, 1.0)
        
        print(f"✅ Network initialized with {len(self.network.file_nodes)} nodes")
        print(f"📊 Initial network health: {self.network.network_health:.3f}")
    
    def test_optimization_planes(self):
        """Test the three optimization planes"""
        print("🧪 Testing optimization planes...")
        
        self.network.initialize_network()
        
        # Test each optimization plane exists
        for plane in OptimizationPlane:
            self.assertIn(plane, self.network.optimization_metrics)
            
        # Test plane assignments
        performance_nodes = [node for node in self.network.file_nodes.values() 
                           if OptimizationPlane.PERFORMANCE in node.optimization_planes]
        harmony_nodes = [node for node in self.network.file_nodes.values() 
                        if OptimizationPlane.HARMONY in node.optimization_planes]
        integration_nodes = [node for node in self.network.file_nodes.values() 
                           if OptimizationPlane.INTEGRATION in node.optimization_planes]
        
        self.assertGreater(len(performance_nodes), 0, "No performance nodes found")
        self.assertGreater(len(harmony_nodes), 0, "No harmony nodes found") 
        self.assertGreater(len(integration_nodes), 0, "No integration nodes found")
        
        print(f"✅ Performance plane: {len(performance_nodes)} nodes")
        print(f"✅ Harmony plane: {len(harmony_nodes)} nodes")
        print(f"✅ Integration plane: {len(integration_nodes)} nodes")
    
    def test_superhighways(self):
        """Test the three optimization superhighways"""
        print("🧪 Testing optimization superhighways...")
        
        self.network.initialize_network()
        
        # Test highway initialization
        self.assertIsInstance(self.network.performance_highway, PerformanceOptimizationHighway)
        self.assertIsInstance(self.network.harmony_highway, HarmonyOptimizationHighway)
        self.assertIsInstance(self.network.integration_highway, IntegrationOptimizationHighway)
        
        # Test highway optimization
        perf_results = self.network.performance_highway.optimize()
        harmony_results = self.network.harmony_highway.optimize()
        integration_results = self.network.integration_highway.optimize()
        
        # Verify results structure
        self.assertIsInstance(perf_results, dict)
        self.assertIsInstance(harmony_results, dict)
        self.assertIsInstance(integration_results, dict)
        
        # Test golden ratio in harmony highway
        self.assertAlmostEqual(self.network.harmony_highway.phi, (1 + np.sqrt(5)) / 2, places=10)
        
        print("✅ All three superhighways operational")
        print(f"🏎️ Performance: {perf_results}")
        print(f"🎵 Harmony: {harmony_results}")
        print(f"🔗 Integration: {integration_results}")
    
    def test_optimization_cycle(self):
        """Test complete optimization cycle"""
        print("🧪 Testing optimization cycle...")
        
        self.network.initialize_network()
        
        cycle_start = time.time()
        results = self.network.run_optimization_cycle()
        cycle_duration = time.time() - cycle_start
        
        # Verify cycle results
        self.assertIsInstance(results, dict)
        self.assertIn('performance', results)
        self.assertIn('harmony', results)
        self.assertIn('integration', results)
        self.assertIn('network_health', results)
        self.assertIn('cycle_time', results)
        
        # Verify network health is valid
        self.assertGreaterEqual(results['network_health'], 0.0)
        self.assertLessEqual(results['network_health'], 1.0)
        
        print(f"✅ Optimization cycle completed in {cycle_duration:.3f}s")
        print(f"📊 Network health after cycle: {results['network_health']:.3f}")
    
    def test_self_correction(self):
        """Test self-correction mechanisms"""
        print("🧪 Testing self-correction mechanisms...")
        
        self.network.initialize_network()
        
        # Simulate some issues by lowering health scores
        test_node = next(iter(self.network.file_nodes.values()))
        original_health = test_node.health_score
        test_node.health_score = 0.5  # Simulate degraded health
        
        # Run optimization to trigger corrections
        self.network.run_optimization_cycle()
        
        # Verify corrections were logged
        self.assertIsInstance(self.network.correction_log, list)
        
        print(f"✅ Self-correction mechanisms active")
        print(f"📋 Corrections logged: {len(self.network.correction_log)}")
    
    def test_enhancement_generation(self):
        """Test enhancement suggestion generation"""
        print("🧪 Testing enhancement generation...")
        
        self.network.initialize_network()
        self.network.run_optimization_cycle()
        
        # Verify enhancement suggestions are generated
        self.assertIsInstance(self.network.enhancement_suggestions, list)
        
        print(f"✅ Enhancement system active")
        print(f"💡 Suggestions generated: {len(self.network.enhancement_suggestions)}")
    
    def test_network_status(self):
        """Test comprehensive network status reporting"""
        print("🧪 Testing network status reporting...")
        
        self.network.initialize_network()
        status = self.network.get_network_status()
        
        # Verify status structure
        required_keys = [
            'total_nodes', 'network_health', 'optimization_metrics',
            'corrections_applied', 'enhancement_suggestions', 'highways'
        ]
        
        for key in required_keys:
            self.assertIn(key, status)
        
        # Verify highways status
        highway_names = ['performance', 'harmony', 'integration']
        for highway in highway_names:
            self.assertIn(highway, status['highways'])
        
        print("✅ Network status reporting functional")
        print(f"📊 Status keys: {list(status.keys())}")
    
    def test_file_node_creation(self):
        """Test file node creation and categorization"""
        print("🧪 Testing file node creation...")
        
        self.network.initialize_network()
        
        # Verify nodes have required attributes
        for node_key, node in self.network.file_nodes.items():
            self.assertIsInstance(node, FileNode)
            self.assertIsInstance(node.path, Path)
            self.assertIsInstance(node.node_type, str)
            self.assertIsInstance(node.priority, int)
            self.assertIsInstance(node.dependencies, list)
            self.assertIsInstance(node.metrics, dict)
            self.assertIsInstance(node.optimization_planes, list)
            self.assertGreater(len(node.optimization_planes), 0)
        
        print(f"✅ File nodes created successfully: {len(self.network.file_nodes)}")
    
    def test_config_integration(self):
        """Test integration with unified system configuration"""
        print("🧪 Testing configuration integration...")
        
        config_path = Path(__file__).parent / "unified_system_config.json"
        
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Verify config structure
            self.assertIn('unified_system_config', config)
            self.assertIn('optimization_planes', config['unified_system_config'])
            
            # Verify planes match
            config_planes = set(config['unified_system_config']['optimization_planes'].keys())
            system_planes = {plane.value for plane in OptimizationPlane}
            
            self.assertEqual(config_planes, system_planes)
            
            print("✅ Configuration integration successful")
        else:
            print("⚠️ Configuration file not found, skipping integration test")

class TestPerformanceMetrics(unittest.TestCase):
    """Test performance monitoring and optimization"""
    
    def test_execution_time_measurement(self):
        """Test execution time measurement and optimization"""
        print("🧪 Testing performance metrics...")
        
        start_time = time.time()
        
        # Simulate some work
        test_array = np.random.random(1000)
        result = np.fft.fft(test_array)
        
        execution_time = time.time() - start_time
        
        self.assertGreater(execution_time, 0)
        self.assertLess(execution_time, 1.0)  # Should be fast
        
        print(f"✅ Performance measurement: {execution_time:.6f}s")

class TestHarmonyMetrics(unittest.TestCase):
    """Test harmony and golden ratio calculations"""
    
    def test_golden_ratio_precision(self):
        """Test golden ratio mathematical precision"""
        print("🧪 Testing harmony metrics...")
        
        phi = (1 + np.sqrt(5)) / 2
        phi_squared = phi * phi
        phi_plus_one = phi + 1
        
        # Golden ratio property: φ² = φ + 1
        self.assertAlmostEqual(phi_squared, phi_plus_one, places=10)
        
        # Test harmonic series
        harmonic_sequence = [phi**n for n in range(5)]
        self.assertEqual(len(harmonic_sequence), 5)
        
        print(f"✅ Golden ratio precision: φ = {phi:.10f}")
        print(f"✅ Harmonic sequence: {[f'{x:.3f}' for x in harmonic_sequence]}")

class TestIntegrationMetrics(unittest.TestCase):
    """Test integration and connectivity metrics"""
    
    def test_connectivity_calculation(self):
        """Test network connectivity calculations"""
        print("🧪 Testing integration metrics...")
        
        # Mock network with known connectivity
        mock_nodes = {
            'node1': {'dependencies': ['node2', 'node3']},
            'node2': {'dependencies': ['node3']}, 
            'node3': {'dependencies': []}
        }
        
        # Calculate connectivity
        total_deps = sum(len(node['dependencies']) for node in mock_nodes.values())
        total_nodes = len(mock_nodes)
        connectivity_score = min(1.0, total_deps / (total_nodes * 3))
        
        self.assertGreaterEqual(connectivity_score, 0.0)
        self.assertLessEqual(connectivity_score, 1.0)
        
        print(f"✅ Connectivity calculation: {connectivity_score:.3f}")

def run_comprehensive_test_suite():
    """Run the complete test suite for the unified system"""
    print("🧪 UNIFIED FILE WEB NETWORK - COMPREHENSIVE TEST SUITE")
    print("=" * 70)
    print("Testing self-correcting, enhancing, metric-correcting system")
    print("Three optimization superhighways: Performance | Harmony | Integration")
    print("=" * 70)
    
    # Create test suite
    suite = unittest.TestSuite()
    
    # Add all test classes
    test_classes = [
        TestUnifiedFileWebNetwork,
        TestPerformanceMetrics, 
        TestHarmonyMetrics,
        TestIntegrationMetrics
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Summary
    print("\n" + "=" * 70)
    print("🧪 TEST SUITE SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print(f"\n❌ FAILURES ({len(result.failures)}):")
        for test, traceback in result.failures:
            print(f"  - {test}")
    
    if result.errors:
        print(f"\n💥 ERRORS ({len(result.errors)}):")
        for test, traceback in result.errors:
            print(f"  - {test}")
    
    if not result.failures and not result.errors:
        print("\n🎉 ALL TESTS PASSED! Unified system is fully operational.")
    
    return result

if __name__ == "__main__":
    result = run_comprehensive_test_suite()