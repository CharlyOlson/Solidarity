
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
def test_discovery_basics():
    """Run basic environment and file checks for the discovery system"""
    
    try:
        # Check if we're in the correct directory
        cwd = Path.cwd()
        launcher_exists = (cwd / 'launcher.js').exists()
        if not launcher_exists:
            print("❌ launcher.js not found - are you in the right directory?")
            return False
            
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                print("❌ Node.js not available. Install Node.js and ensure it's in your PATH.")
                return False
            print(f"✅ Node.js available: {result.stdout.strip()}")
        except Exception as e:
            print(f"❌ Error checking Node.js: {e}")
            return False
            
        # Check essential files
        essential_files = [
            "comprehensive-discovery.js",
            "setup_python_env.py"
        ]
        missing = []
        for file in essential_files:
            if not (cwd / file).exists():
                missing.append(file)
        
        if missing:
            print(f"❌ Missing essential files: {', '.join(missing)}")
            return False
        print(f"✅ All essential files found: {', '.join(essential_files)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in basic discovery test: {e}")
        return False

def create_simple_discovery_test():
    """Create a simple discovery test JavaScript file"""
    
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
    print("\nSolidarity Framework: Discovery System Test Suite")
    print("================================================")
    print("This will check your environment, Node.js, and discovery files.")
    
    # Option 1: Run unittest tests
    if len(sys.argv) > 1 and sys.argv[1] == "--unittest":
        unittest.main(argv=['first-arg-is-ignored'])
    # Option 2: Run the simple diagnostics
    else:
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