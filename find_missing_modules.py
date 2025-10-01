#!/usr/bin/env python3
"""
Find missing audio modules across all discovered workspaces
"""

import os
import sys
from pathlib import Path

def scan_workspace_for_modules(workspace_path, target_modules):
    """Scan a workspace for target modules"""
    results = {}
    
    if not workspace_path.exists():
        return results
    
    print(f"\n🔍 Scanning: {workspace_path.name}")
    print(f"   Path: {workspace_path}")
    
    # Search patterns for each module
    search_patterns = {
        "goldenHarmonicSystem": ["*golden*", "*Golden*", "*harmonic*", "*Harmonic*"],
        "ultimateSolidaritySystem": ["*ultimate*", "*Ultimate*", "*solidarity*", "*Solidarity*"],
        "EnhancedHarmonicPhraseParser": ["*phrase*", "*Phrase*", "*parser*", "*Parser*", "*Enhanced*"]
    }
    
    for module_name in target_modules:
        patterns = search_patterns.get(module_name, [f"*{module_name}*"])
        found_files = []
        
        for pattern in patterns:
            # Search for .py files
            py_files = list(workspace_path.rglob(f"{pattern}.py"))
            # Search for .js files
            js_files = list(workspace_path.rglob(f"{pattern}.js"))
            
            found_files.extend(py_files)
            found_files.extend(js_files)
        
        if found_files:
            results[module_name] = []
            for file_path in found_files:
                rel_path = file_path.relative_to(workspace_path)
                results[module_name].append({
                    'file': file_path.name,
                    'path': str(rel_path),
                    'full_path': str(file_path),
                    'type': file_path.suffix,
                    'size': file_path.stat().st_size if file_path.exists() else 0
                })
                print(f"   ✅ Found {module_name}: {rel_path}")
        else:
            print(f"   ❌ {module_name}: Not found")
    
    return results

def main():
    print("🔍 Comprehensive Workspace Module Scanner")
    print("=" * 50)
    
    # Base paths
    solidarity_path = Path(__file__).parent
    parent_path = solidarity_path.parent
    
    # Target modules we're looking for
    target_modules = [
        "goldenHarmonicSystem",
        "ultimateSolidaritySystem", 
        "EnhancedHarmonicPhraseParser"
    ]
    
    # Discovered workspaces
    workspaces = [
        ("Solidarity", solidarity_path),
        ("Soul.Ed.Xchange---Quantum-Core", parent_path / "Soul.Ed.Xchange---Quantum-Core"),
        ("Coul-Curve", parent_path / "Coul-Curve"),
        ("ready", parent_path / "ready"),
    ]
    
    all_results = {}
    
    # Scan each workspace
    for workspace_name, workspace_path in workspaces:
        results = scan_workspace_for_modules(workspace_path, target_modules)
        if results:
            all_results[workspace_name] = results
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SCAN SUMMARY")
    print("=" * 50)
    
    for module_name in target_modules:
        print(f"\n🎯 {module_name}:")
        found_in = []
        for workspace_name, results in all_results.items():
            if module_name in results:
                found_in.append(workspace_name)
                for file_info in results[module_name]:
                    print(f"   ✅ {workspace_name}: {file_info['path']} ({file_info['type']})")
        
        if not found_in:
            print(f"   ❌ Not found in any workspace")
    
    # Generate unified import suggestions
    print("\n" + "=" * 50)
    print("🔧 UNIFIED IMPORT SUGGESTIONS")
    print("=" * 50)
    
    for module_name in target_modules:
        print(f"\n# {module_name}")
        found_locations = []
        
        for workspace_name, results in all_results.items():
            if module_name in results:
                for file_info in results[module_name]:
                    if file_info['type'] == '.py':  # Focus on Python files
                        found_locations.append({
                            'workspace': workspace_name,
                            'file': file_info,
                            'import_path': f"sys.path.insert(0, '{file_info['full_path'].replace(file_info['file'], '')}')"
                        })
        
        if found_locations:
            print("try:")
            for i, location in enumerate(found_locations):
                if i == 0:
                    print(f"    # Primary location: {location['workspace']}")
                    print(f"    {location['import_path']}")
                    print(f"    from {module_name} import *")
                else:
                    print(f"except ImportError:")
                    print(f"    # Fallback: {location['workspace']}")  
                    print(f"    {location['import_path']}")
                    print(f"    from {module_name} import *")
        else:
            print("# Module not found - create mock implementation")
    
    return all_results

if __name__ == "__main__":
    results = main()