#!/usr/bin/env python3
"""
Targeted search for missing Solidarity modules
"""

from pathlib import Path
import os

def search_for_file(workspace_path, filename_patterns):
    """Search for files matching patterns in a workspace"""
    found_files = []
    
    if not workspace_path.exists():
        return found_files
    
    for pattern in filename_patterns:
        try:
            # Search for exact matches
            matches = list(workspace_path.rglob(pattern))
            found_files.extend(matches)
        except (PermissionError, OSError):
            continue
    
    return found_files

def main():
    solidarity_path = Path(__file__).parent
    parent_path = solidarity_path.parent
    
    # Files we're looking for
    target_files = {
        "goldenHarmonicSystem": [
            "goldenHarmonicSystem.js",
            "goldenHarmonicSystem.py", 
            "GoldenHarmonicSystem.js",
            "golden*harmonic*.js",
            "golden*harmonic*.py"
        ],
        "ultimateSolidaritySystem": [
            "ultimateSolidaritySystem.js",
            "ultimateSolidaritySystem.py",
            "UltimateSolidaritySystem.js",
            "ultimate*solidarity*.js",
            "ultimate*solidarity*.py"
        ],
        "EnhancedHarmonicPhraseParser": [
            "EnhancedHarmonicPhraseParser.js",
            "EnhancedHarmonicPhraseParser.py",
            "enhancedHarmonicPhraseParser.js"
        ]
    }
    
    workspaces = [
        ("Solidarity", solidarity_path),
        ("Soul.Ed.Xchange", parent_path / "Soul.Ed.Xchange---Quantum-Core"),
        ("Coul-Curve", parent_path / "Coul-Curve"),  
        ("ready", parent_path / "ready")
    ]
    
    print("🎯 Targeted Search for Missing Modules")
    print("=" * 50)
    
    results = {}
    
    for workspace_name, workspace_path in workspaces:
        print(f"\n📁 Searching {workspace_name}...")
        workspace_results = {}
        
        for module_name, patterns in target_files.items():
            found_files = search_for_file(workspace_path, patterns)
            if found_files:
                workspace_results[module_name] = found_files
                for file_path in found_files:
                    rel_path = file_path.relative_to(workspace_path)
                    print(f"   ✅ {module_name}: {rel_path}")
            else:
                print(f"   ❌ {module_name}: Not found")
        
        if workspace_results:
            results[workspace_name] = workspace_results
    
    # Check if the files actually exist in Solidarity but with different names
    print(f"\n🔍 Additional search in Solidarity workspace...")
    solidarity_files = []
    
    # Look for any JS/Python files that might be our missing modules
    for ext in ["*.js", "*.py"]:
        solidarity_files.extend(list(solidarity_path.rglob(ext)))
    
    # Filter for files that might contain our target modules
    potential_matches = []
    keywords = ["golden", "harmonic", "ultimate", "solidarity", "enhanced", "phrase", "parser"]
    
    for file_path in solidarity_files:
        filename_lower = file_path.name.lower()
        if any(keyword in filename_lower for keyword in keywords):
            potential_matches.append(file_path)
    
    if potential_matches:
        print("   🔍 Potential matches in Solidarity:")
        for file_path in potential_matches:
            rel_path = file_path.relative_to(solidarity_path)
            print(f"      📄 {rel_path}")
    
    # Generate import mapping
    print(f"\n🔧 IMPORT MAPPING SUGGESTIONS")
    print("=" * 50)
    
    for module_name in target_files.keys():
        print(f"\n# {module_name}")
        found_anywhere = False
        
        for workspace_name, workspace_results in results.items():
            if module_name in workspace_results:
                found_anywhere = True
                for file_path in workspace_results[module_name]:
                    if file_path.suffix in ['.js', '.py']:
                        print(f"# Found in {workspace_name}: {file_path}")
                        if file_path.suffix == '.py':
                            dir_path = file_path.parent
                            print(f"sys.path.insert(0, r'{dir_path}')")
                            print(f"from {file_path.stem} import *")
        
        if not found_anywhere:
            print("# NOT FOUND - may need to be created or is in a different workspace")
    
    return results

if __name__ == "__main__":
    main()