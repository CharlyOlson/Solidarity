#!/usr/bin/env python3
"""
User-Friendly Discovery System Test Suite for Solidarity
Run this file to verify your environment and discovery components.
"""

import os
import sys
import unittest
from pathlib import Path
import subprocess

class TestDiscoverySystem(unittest.TestCase):
    """Test suite for the Solidarity discovery system"""
    
    def setUp(self):
        """Setup test environment with current directory"""
        self.current_dir = Path.cwd()
        self.project_root = self.current_dir

    def test_launcher_js_exists(self):
        """Verify launcher.js exists in the project root"""
        launcher_path = self.project_root / "launcher.js"
        self.assertTrue(launcher_path.exists(), 
                        f"launcher.js not found in {self.project_root}. Please ensure it exists.")

    def test_nodejs_available(self):
        """Verify Node.js is installed and available"""
        try:
            result = subprocess.run(['node', '--version'], 
                                   capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, 
                            "Node.js is not available. Install Node.js and ensure it's in your PATH.")
        except Exception as e:
            self.fail(f"Error checking Node.js: {e}")

    def test_discovery_files_exist(self):
        """Verify essential discovery files exist"""
        discovery_files = [
            "comprehensive-discovery.js",
            "setup_python_env.py"
        ]
        missing = []
        for file in discovery_files:
            file_path = self.project_root / file
            if not file_path.exists():
                missing.append(file)
        self.assertFalse(missing, f"Missing discovery files: {', '.join(missing)}")

    def test_onedrive_detection(self):
        """Test OneDrive path detection"""
        user_profile = os.path.expanduser("~")
        onedrive_paths = [
            Path(user_profile) / "OneDrive",
            Path(user_profile) / "OneDrive - Personal",
            Path(user_profile) / "OneDrive - Business",
            Path("C:/Users/souls/OneDrive")
        ]
        found = [str(path) for path in onedrive_paths if path.exists()]
        self.assertTrue(found, "No OneDrive paths detected. Please ensure OneDrive is set up.")
        
    def test_simple_discovery_js(self):
        """Verify simple-discovery-test.js exists or can be created"""
        discovery_path = self.project_root / "simple-discovery-test.js"
        if not discovery_path.exists():
            self.skipTest("simple-discovery-test.js not found. Run this test again to create it.")

if __name__ == "__main__":
    print("\nSolidarity Framework: Discovery System Test Suite")
    print("================================================")
    print("This will check your environment, Node.js, and discovery files.")
    print("If any test fails, follow the guidance in the error message.")
    unittest.main()
