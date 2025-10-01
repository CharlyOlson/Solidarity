# Backup of original test_discovery.py

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
    def setUp(self):
        self.current_dir = Path.cwd()

    def test_launcher_js_exists(self):
        launcher_path = self.current_dir / "launcher.js"
        self.assertTrue(launcher_path.exists(), f"launcher.js not found in {self.current_dir}. Please ensure it exists.")

    def test_nodejs_available(self):
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, "Node.js is not available. Install Node.js and ensure it's in your PATH.")
        except Exception as e:
            self.fail(f"Error checking Node.js: {e}")

    def test_discovery_files_exist(self):
        discovery_files = [
            "comprehensive-discovery.js",
            "mobile-sync-server.js",
            "setup_python_env.py"
        ]
        missing = []
        for file in discovery_files:
            file_path = self.current_dir / file
            if not file_path.exists():
                missing.append(file)
        self.assertFalse(missing, f"Missing discovery files: {', '.join(missing)}")

    def test_onedrive_detection(self):
        user_profile = os.path.expanduser("~")
        onedrive_paths = [
            Path(user_profile) / "OneDrive",
            Path(user_profile) / "OneDrive - Personal",
            Path(user_profile) / "OneDrive - Business",
            Path("C:/Users/souls/OneDrive"),
            Path("C:/Users/souls/OneDrive/Documents/GitHub/Solidarity")
        ]
        found = [str(path) for path in onedrive_paths if path.exists()]
        self.assertTrue(found, "No OneDrive paths detected. Please ensure OneDrive is set up.")

if __name__ == "__main__":
    print("\nSolidarity Framework: Discovery System Test Suite")
    print("================================================")
    print("This will check your environment, Node.js, and discovery files.")
    print("If any test fails, follow the guidance in the error message.")
    unittest.main()
    
    simple_discovery = '''// Simple Discovery Test
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 Simple Discovery Test');
console.log('='.repeat(40));

// Test 1: Basic system info
console.log(`Platform: ${os.platform()}`);
console.log(`User: ${os.userInfo().username}`);
console.log(`Home: ${os.homedir()}`);

// Test 2: Check OneDrive paths
const onedrivePaths = [
    path.join(os.homedir(), 'OneDrive'),
    path.join(os.homedir(), 'OneDrive - Personal'),
    path.join(os.homedir(), 'OneDrive - Business'),
    'C:\\\\Users\\\\souls\\\\OneDrive',
    'C:\\\\Users\\\\souls\\\\OneDrive\\\\Documents\\\\GitHub\\\\Solidarity'
];

console.log('\\nOneDrive Detection:');
onedrivePaths.forEach(onedrivePath => {
    try {
        if (fs.existsSync(onedrivePath)) {
            console.log(`  ✅ Found: ${onedrivePath}`);
        } else {
            console.log(`  ❌ Not found: ${onedrivePath}`);
        }
    } catch (error) {
        console.log(`  ⚠️ Error checking ${onedrivePath}: ${error.message}`);
    }
});

// Test 3: Check current directory contents
console.log('\\nCurrent directory contents:');
try {
    const files = fs.readdirSync('.');
    const important_files = ['launcher.js', 'test_advanced_audio.py', 'solidarity-ai-framework.py'];
    important_files.forEach(file => {
        if (files.includes(file)) {
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ❌ Missing: ${file}`);
        }
    });
} catch (error) {
    console.log(`  ⚠️ Error reading directory: ${error.message}`);
}

console.log('\\n🎉 Simple discovery test complete!');
'''
    
    # Write the simple discovery file
    with open('simple-discovery-test.js', 'w') as f:
        f.write(simple_discovery)
    
    print("✅ Created simple-discovery-test.js")
    return True

if __name__ == "__main__":
    print("🚀 Discovery System Diagnostics")
    print("=" * 50)
    
    # Run basic tests
    if test_discovery_basics():
        print("\n✅ Basic discovery test passed!")
        
        # Create simple discovery test
        if create_simple_discovery_test():
            print("\n🎯 Next steps:")
            print("1. Run: node simple-discovery-test.js")
            print("2. If that works, try: node launcher.js discovery:scan")
            print("3. Check what specific error you're getting")
    else:
        print("\n❌ Basic discovery test failed!")
        print("Check if you're in the right directory and Node.js is installed")
