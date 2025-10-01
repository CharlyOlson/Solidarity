#!/usr/bin/env python3
"""
Unified Solidarity System Launcher
Integrates all components into a self-correcting file web network
Three optimization superhighways: Performance | Harmony | Integration
"""

import sys
import os
import time
import json
import asyncio
from pathlib import Path
from typing import Dict, List, Any, Optional

# Add project paths
sys.path.insert(0, str(Path(__file__).parent))

def print_banner():
    """Print the unified system banner"""
    print("🕸️" + "=" * 68 + "🕸️")
    print("🕸️" + " " * 68 + "🕸️")
    print("🕸️" + "   SOLIDARITY UNIFIED FILE WEB NETWORK SYSTEM".center(68) + "🕸️")
    print("🕸️" + " " * 68 + "🕸️")
    print("🕸️" + "   Self-Correcting • Enhancing • Metric-Correcting".center(68) + "🕸️")
    print("🕸️" + " " * 68 + "🕸️")
    print("🕸️" + "   🏎️ PERFORMANCE | 🎵 HARMONY | 🔗 INTEGRATION".center(68) + "🕸️")
    print("🕸️" + " " * 68 + "🕸️")
    print("🕸️" + "=" * 68 + "🕸️")
    print("Environment Flags:")
    print("  SOLIDARITY_QUICK_SCAN=1  -> Force quick curated scan")
    print("  FULL_SCAN=1             -> Request full scan (may still be overridden)")
    print("  FORCE_FULL_SCAN=1       -> Force full scan (disables quick path)")
    print("  EXPORT_NETWORK_REPORT=1 -> Write network_scan_report.json")
    print("  CONTINUOUS=1            -> Continuous optimization mode")
    print("  INTERACTIVE=1           -> Launch interactive shell")

def check_system_requirements():
    """Check if all system requirements are met"""
    print("🔍 Checking system requirements...")
    
    requirements = {
        'python_version': sys.version_info >= (3, 8),
        'numpy_available': False,
        'pathlib_available': True,  # Built-in
        'json_available': True,     # Built-in
    }
    
    # Check NumPy
    try:
        import numpy as np
        requirements['numpy_available'] = True
        print(f"✅ NumPy {np.__version__} available")
    except ImportError:
        print("❌ NumPy not available")
    
    # Check Python version
    if requirements['python_version']:
        print(f"✅ Python {sys.version.split()[0]} compatible")
    else:
        print(f"❌ Python {sys.version.split()[0]} - requires 3.8+")
    
    all_good = all(requirements.values())
    if all_good:
        print("✅ All system requirements met")
    else:
        print("❌ Some requirements not met")
    
    return all_good, requirements

def load_unified_config():
    """Load the unified system configuration"""
    config_path = Path(__file__).parent / "unified_system_config.json"
    
    if not config_path.exists():
        print("⚠️ Unified system configuration not found, using defaults")
        return create_default_config()
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        print("✅ Unified system configuration loaded")
        return config
    except Exception as e:
        print(f"❌ Error loading configuration: {e}")
        return create_default_config()

def create_default_config():
    """Create default configuration"""
    return {
        "unified_system_config": {
            "name": "Solidarity Unified File Web Network",
            "version": "1.0.0",
            "optimization_planes": {
                "performance": {"priority": 10},
                "harmony": {"priority": 9},
                "integration": {"priority": 8}
            }
        }
    }

def run_system_tests():
    """Run unified system tests"""
    print("🧪 Running unified system tests...")
    
    try:
        # Import and run the test suite
        from test_unified_system import run_comprehensive_test_suite
        
        result = run_comprehensive_test_suite()
        
        if result.wasSuccessful():
            print("✅ All unified system tests passed")
            return True
        else:
            print(f"❌ {len(result.failures + result.errors)} test(s) failed")
            return False
            
    except ImportError as e:
        print(f"⚠️ Test suite not available: {e}")
        return False
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def initialize_unified_network():
    """Initialize the unified file web network"""
    print("🕸️ Initializing unified file web network...")
    
    try:
        from unified_file_web_network import SolidarityFileWebNetwork
        
        # Determine scan mode with precedence: FORCE_FULL > FULL_SCAN > SOLIDARITY_QUICK_SCAN > default quick?
        force_full = os.environ.get("FORCE_FULL_SCAN", "0") in ("1", "true", "True")
        full_scan = os.environ.get("FULL_SCAN", "0") in ("1", "true", "True") or force_full
        quick_flag = os.environ.get("SOLIDARITY_QUICK_SCAN", "0") in ("1", "true", "True")
        quick_scan = False
        if quick_flag and not full_scan:
            quick_scan = True
        network = SolidarityFileWebNetwork(quick_scan=quick_scan)
        network.initialize_network()
        
        print("✅ Unified network initialized successfully")
        return network
        
    except ImportError as e:
        print(f"❌ Unified network not available: {e}")
        return None
    except Exception as e:
        print(f"❌ Error initializing network: {e}")
        return None

def run_optimization_superhighways(network):
    """Run the three optimization superhighways"""
    if not network:
        print("❌ Cannot run optimization - network not initialized")
        return None
    
    print("🛣️ Running optimization superhighways...")
    
    try:
        # Run complete optimization cycle
        results = network.run_optimization_cycle()
        
        print("✅ Optimization superhighways completed")
        return results
        
    except Exception as e:
        print(f"❌ Error running optimization: {e}")
        return None

def display_network_status(network):
    """Display comprehensive network status"""
    if not network:
        print("❌ Cannot display status - network not initialized")
        return
    
    try:
        status = network.get_network_status()
        
        print("\n📊 UNIFIED NETWORK STATUS")
        print("=" * 50)
        print(f"🕸️ Total Nodes: {status['total_nodes']}")
        print(f"💚 Network Health: {status['network_health']:.3f}")
        print(f"🔧 Corrections Applied: {status['corrections_applied']}")
        print(f"💡 Enhancement Suggestions: {status['enhancement_suggestions']}")
        
        print("\n🛣️ OPTIMIZATION SUPERHIGHWAYS")
        print("=" * 50)
        
        highways = status.get('highways', {})
        highway_icons = {
            'performance': '🏎️',
            'harmony': '🎵', 
            'integration': '🔗'
        }
        
        for highway_name, highway_status in highways.items():
            icon = highway_icons.get(highway_name, '🛣️')
            print(f"{icon} {highway_name.upper()}: {highway_status.get('active', 'Unknown')}")
        
        print("\n📈 OPTIMIZATION METRICS")
        print("=" * 50)
        
        for plane, metrics in status.get('optimization_metrics', {}).items():
            print(f"🎯 {plane.upper()}: {metrics}")
            
    except Exception as e:
        print(f"❌ Error displaying status: {e}")

def run_legacy_systems():
    """Run integration with legacy systems"""
    print("🔗 Integrating with legacy systems...")
    
    legacy_systems = [
        ("test_numpy_quick.py", "NumPy validation system"),
        ("test_advanced_audio_fixed.py", "Advanced audio processing system"), 
        ("workspace_mapper.py", "Workspace mapping system")
    ]
    
    integration_results = {}
    
    for system_file, system_name in legacy_systems:
        system_path = Path(__file__).parent / system_file
        
        if system_path.exists():
            try:
                # Test if we can import the system
                spec = __import__(system_file.replace('.py', ''))
                integration_results[system_name] = "✅ Available"
                print(f"✅ {system_name}: Integrated")
            except Exception as e:
                integration_results[system_name] = f"❌ Error: {str(e)[:50]}"
                print(f"⚠️ {system_name}: Integration issues")
        else:
            integration_results[system_name] = "❌ Not found"
            print(f"❌ {system_name}: Not found")
    
    return integration_results

async def continuous_optimization_mode(network):
    """Run continuous optimization mode"""
    if not network:
        print("❌ Cannot run continuous mode - network not initialized")
        return
    
    print("🔄 Starting continuous optimization mode...")
    print("Press Ctrl+C to stop")
    
    cycle_count = 0
    
    try:
        while True:
            cycle_count += 1
            print(f"\n🔄 Optimization Cycle #{cycle_count}")
            print("-" * 30)
            
            # Run optimization cycle
            results = network.run_optimization_cycle()
            
            if results:
                print(f"Network Health: {results.get('network_health', 'Unknown'):.3f}")
                print(f"Cycle Time: {results.get('cycle_time', 'Unknown'):.3f}s")
            
            # Wait before next cycle
            await asyncio.sleep(10)  # 10 second intervals
            
    except KeyboardInterrupt:
        print(f"\n🛑 Continuous optimization stopped after {cycle_count} cycles")
    except Exception as e:
        print(f"\n❌ Error in continuous mode: {e}")

def interactive_mode(network):
    """Run interactive mode"""
    if not network:
        print("❌ Cannot run interactive mode - network not initialized")
        return
    
    print("\n🎮 INTERACTIVE MODE")
    print("=" * 40)
    print("Available commands:")
    print("  status    - Show network status") 
    print("  optimize  - Run optimization cycle")
    print("  test      - Run system tests")
    print("  health    - Show health report")
    print("  exit      - Exit interactive mode")
    print("=" * 40)
    
    while True:
        try:
            command = input("\n🎮 unified> ").strip().lower()
            
            if command == 'exit':
                print("👋 Exiting interactive mode")
                break
            elif command == 'status':
                display_network_status(network)
            elif command == 'optimize':
                results = run_optimization_superhighways(network)
                if results:
                    print(f"✅ Optimization completed: {results.get('network_health', 'Unknown'):.3f} health")
            elif command == 'test':
                run_system_tests()
            elif command == 'health':
                status = network.get_network_status()
                print(f"💚 Network Health: {status['network_health']:.3f}")
                print(f"🔧 Corrections: {status['corrections_applied']}")
                print(f"💡 Suggestions: {status['enhancement_suggestions']}")
            elif command == 'help':
                print("Available commands: status, optimize, test, health, exit")
            elif command:
                print(f"❓ Unknown command: {command}")
                print("Type 'help' for available commands")
                
        except KeyboardInterrupt:
            print("\n👋 Exiting interactive mode")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

def main():
    """Main launcher function"""
    print_banner()
    
    # Check system requirements
    requirements_ok, requirements = check_system_requirements()
    if not requirements_ok:
        print("❌ System requirements not met. Please install missing components.")
        return 1
    
    # Load configuration
    config = load_unified_config()
    
    # Initialize network
    network = initialize_unified_network()
    
    if not network:
        print("❌ Failed to initialize unified network")
        return 1
    
    # Run initial optimization
    print("\n🚀 Running initial optimization...")
    optimization_results = run_optimization_superhighways(network)
    
    # Display status
    display_network_status(network)
    
    # Integrate legacy systems
    print("\n🔗 Legacy System Integration:")
    legacy_results = run_legacy_systems()
    
    # Check command line arguments
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
        
        if mode == 'test':
            print("\n🧪 Running test mode...")
            run_system_tests()
        elif mode == 'continuous':
            print("\n🔄 Running continuous mode...")
            asyncio.run(continuous_optimization_mode(network))
        elif mode == 'interactive':
            interactive_mode(network)
        elif mode == 'status':
            display_network_status(network)
        else:
            print(f"❓ Unknown mode: {mode}")
            print("Available modes: test, continuous, interactive, status")
    else:
        # Default: run interactive mode
        interactive_mode(network)
    
    print("\n🎉 Unified Solidarity System session completed")
    return 0

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n👋 System shutdown requested")
        sys.exit(0)
    except Exception as e:
        print(f"\n💥 Critical error: {e}")
        sys.exit(1)