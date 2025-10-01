#!/usr/bin/env python3
"""
Simple test of workspace mapping functionality
"""

import os
import sys
from pathlib import Path

print("🧪 Testing Workspace Mapping")
print("=" * 40)

# Test basic Python functionality
print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")
print(f"Current script path: {Path(__file__).parent}")

# Test workspace discovery
parent_dir = Path(__file__).parent.parent
print(f"Parent directory: {parent_dir}")

if parent_dir.exists():
    print("Contents of parent directory:")
    try:
        for item in parent_dir.iterdir():
            if item.is_dir():
                print(f"  📁 {item.name}")
            else:
                print(f"  📄 {item.name}")
    except PermissionError:
        print("  ❌ Permission denied to read parent directory")
else:
    print("  ❌ Parent directory doesn't exist")

# Test current workspace contents
current_dir = Path(__file__).parent
print(f"\nContents of current workspace ({current_dir.name}):")
key_files = [
    "src/solidarityAudioProcessor.py",
    "workspace_config.json", 
    "test_advanced_audio_fixed.py",
    "launcher.js",
    "package.json"
]

for file_path in key_files:
    full_path = current_dir / file_path
    if full_path.exists():
        print(f"  ✅ {file_path}")
    else:
        print(f"  ❌ {file_path}")

# Test import of workspace mapper
try:
    from workspace_mapper import setup_unified_workspace
    print("\n✅ workspace_mapper imported successfully")
    
    # Test setup
    print("🔧 Testing workspace setup...")
    mapper = setup_unified_workspace()
    print("✅ Workspace setup completed")
    
except Exception as e:
    print(f"\n❌ Error importing workspace_mapper: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 40)
print("Test completed!")