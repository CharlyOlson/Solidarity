#!/usr/bin/env python3
"""
Solidarity Workspace File Scanner
Scans and maps similar files across multiple workspaces
"""

import os
import json
from pathlib import Path
import hashlib
import difflib

class WorkspaceFileScanner:
    """Scans and maps files across multiple Solidarity workspaces"""
    
    def __init__(self, base_path=None):
        self.base_path = Path(base_path) if base_path else Path(__file__).parent
        self.workspace_paths = self.discover_workspace_paths()
        self.file_map = {}
        self.similar_files = {}
        
    def discover_workspace_paths(self):
        """Discover all potential workspace paths"""
        paths = []
        
        # Current workspace
        paths.append(self.base_path)
        
        # Parent directory workspaces
        parent = self.base_path.parent
        potential_workspaces = [
            "Soul.Ed.Xchange",
            "SoulEdXchange", 
            "Coul.Curve.Fi",
            "CoulCurveFi",
            "Souls",
            "ready"
        ]
        
        for workspace in potential_workspaces:
            workspace_path = parent / workspace
            if workspace_path.exists() and workspace_path.is_dir():
                paths.append(workspace_path)
        
        return paths
    
    def scan_file_patterns(self):
        """Scan for common file patterns across workspaces"""
        patterns = {
            "audio_processing": ["*audio*.py", "*Audio*.py", "*harmonic*.py", "*Harmonic*.py"],
            "core_systems": ["*system*.py", "*System*.js", "*core*.py", "*Core*.js"],
            "blockchain": ["*.sol", "*contract*.js", "*Contract*.js"],
            "testing": ["test_*.py", "*_test.py", "*Test*.py"],
            "configuration": ["*.json", "*.config.js", "*.env*"],
            "launchers": ["launcher*.js", "start*.js", "run*.py"],
            "setup": ["setup*.py", "setup*.sh", "setup*.bat"]
        }
        
        file_map = {}
        
        for workspace_path in self.workspace_paths:
            workspace_name = workspace_path.name
            file_map[workspace_name] = {}
            
            for category, file_patterns in patterns.items():
                file_map[workspace_name][category] = []
                
                for pattern in file_patterns:
                    matching_files = list(workspace_path.rglob(pattern))
                    for file_path in matching_files:
                        if file_path.is_file():
                            relative_path = file_path.relative_to(workspace_path)
                            file_info = {
                                "name": file_path.name,
                                "path": str(relative_path),
                                "full_path": str(file_path),
                                "size": file_path.stat().st_size,
                                "modified": file_path.stat().st_mtime
                            }
                            file_map[workspace_name][category].append(file_info)
        
        self.file_map = file_map
        return file_map
    
    def find_similar_files(self, similarity_threshold=0.7):
        """Find similar files across workspaces based on name and content"""
        similar_files = {}
        
        # Get all files from all workspaces
        all_files = []
        for workspace, categories in self.file_map.items():
            for category, files in categories.items():
                for file_info in files:
                    file_info['workspace'] = workspace
                    file_info['category'] = category
                    all_files.append(file_info)
        
        # Compare files by name similarity
        for i, file1 in enumerate(all_files):
            similar_group = []
            
            for j, file2 in enumerate(all_files):
                if i != j and file1['workspace'] != file2['workspace']:
                    # Name similarity
                    name_similarity = difflib.SequenceMatcher(
                        None, file1['name'].lower(), file2['name'].lower()
                    ).ratio()
                    
                    if name_similarity >= similarity_threshold:
                        similar_group.append({
                            'file': file2,
                            'name_similarity': name_similarity,
                            'size_similarity': self.calculate_size_similarity(file1['size'], file2['size'])
                        })
            
            if similar_group:
                file_key = f"{file1['workspace']}:{file1['name']}"
                similar_files[file_key] = {
                    'base_file': file1,
                    'similar_files': similar_group
                }
        
        self.similar_files = similar_files
        return similar_files
    
    def calculate_size_similarity(self, size1, size2):
        """Calculate similarity based on file sizes"""
        if size1 == 0 and size2 == 0:
            return 1.0
        if size1 == 0 or size2 == 0:
            return 0.0
        
        ratio = min(size1, size2) / max(size1, size2)
        return ratio
    
    def create_unified_file_map(self):
        """Create a unified map of all files for import purposes"""
        unified_map = {
            "workspaces": {},
            "file_categories": {},
            "import_priorities": {},
            "similar_files": self.similar_files
        }
        
        # Map workspaces
        for workspace_path in self.workspace_paths:
            unified_map["workspaces"][workspace_path.name] = {
                "path": str(workspace_path),
                "exists": workspace_path.exists()
            }
        
        # Categorize files
        for workspace, categories in self.file_map.items():
            for category, files in categories.items():
                if category not in unified_map["file_categories"]:
                    unified_map["file_categories"][category] = {}
                
                unified_map["file_categories"][category][workspace] = files
        
        # Create import priorities based on file availability and similarity
        priority_map = {
            "solidarity": 1,
            "Soul.Ed.Xchange": 2,
            "SoulEdXchange": 2, 
            "Coul.Curve.Fi": 2,
            "CoulCurveFi": 2,
            "Souls": 3,
            "ready": 4
        }
        
        for workspace in unified_map["workspaces"]:
            unified_map["import_priorities"][workspace] = priority_map.get(workspace, 5)
        
        return unified_map
    
    def generate_import_mapping(self):
        """Generate import mapping for Python modules"""
        import_map = {}
        
        # Focus on Python files for imports
        python_files = {}
        for workspace, categories in self.file_map.items():
            for category, files in categories.items():
                for file_info in files:
                    if file_info['name'].endswith('.py'):
                        module_name = file_info['name'][:-3]  # Remove .py
                        if module_name not in python_files:
                            python_files[module_name] = []
                        
                        python_files[module_name].append({
                            'workspace': workspace,
                            'path': file_info['path'],
                            'full_path': file_info['full_path'],
                            'category': category
                        })
        
        # Create import mapping with priorities
        for module_name, locations in python_files.items():
            # Sort by workspace priority
            priority_map = {"Solidarity": 1, "Soul.Ed.Xchange": 2, "Coul.Curve.Fi": 2, "Souls": 3, "ready": 4}
            locations.sort(key=lambda x: priority_map.get(x['workspace'], 5))
            
            import_map[module_name] = {
                'primary': locations[0] if locations else None,
                'fallbacks': locations[1:] if len(locations) > 1 else [],
                'all_locations': locations
            }
        
        return import_map
    
    def save_workspace_scan(self, output_file="workspace_scan.json"):
        """Save complete workspace scan results"""
        scan_results = {
            "workspaces": {ws.name: str(ws) for ws in self.workspace_paths},
            "file_map": self.file_map,
            "similar_files": self.similar_files,
            "unified_map": self.create_unified_file_map(),
            "import_mapping": self.generate_import_mapping()
        }
        
        output_path = self.base_path / output_file
        with open(output_path, 'w') as f:
            json.dump(scan_results, f, indent=2, default=str)
        
        return scan_results

def main():
    """Main scanning function"""
    print("🔍 Scanning Solidarity workspaces...")
    
    scanner = WorkspaceFileScanner()
    
    # Scan file patterns
    print("📁 Scanning file patterns...")
    file_map = scanner.scan_file_patterns()
    
    # Find similar files
    print("🔗 Finding similar files...")
    similar_files = scanner.find_similar_files()
    
    # Save results
    print("💾 Saving scan results...")
    results = scanner.save_workspace_scan()
    
    # Print summary
    print("\n📊 Scan Summary:")
    print(f"   Workspaces found: {len(scanner.workspace_paths)}")
    for workspace_path in scanner.workspace_paths:
        exists = "✅" if workspace_path.exists() else "❌"
        print(f"   {exists} {workspace_path.name}: {workspace_path}")
    
    print(f"\n   File categories:")
    total_files = 0
    for workspace, categories in file_map.items():
        workspace_total = sum(len(files) for files in categories.values())
        total_files += workspace_total
        print(f"   📂 {workspace}: {workspace_total} files")
        for category, files in categories.items():
            if files:
                print(f"      - {category}: {len(files)} files")
    
    print(f"\n   Total files scanned: {total_files}")
    print(f"   Similar file groups: {len(similar_files)}")
    
    return results

if __name__ == "__main__":
    results = main()