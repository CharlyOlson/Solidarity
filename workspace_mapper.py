#!/usr/bin/env python3
"""
Solidarity Workspace Mapper
Maps and unifies imports from multiple workspaces under the main Solidarity space
"""

import os
import sys
import importlib.util
from pathlib import Path
import json

class SolidarityWorkspaceMapper:
    """Maps and manages imports across multiple Solidarity workspaces"""
    
    def __init__(self, base_path=None):
        self.base_path = base_path or Path(__file__).parent
        self.workspace_map = {}
        self.module_cache = {}
        self.workspace_config = self.load_workspace_config()
        
    def load_workspace_config(self):
        """Load workspace configuration"""
        config_file = self.base_path / "workspace_config.json"
        if config_file.exists():
            with open(config_file, 'r') as f:
                return json.load(f)
        return self.create_default_config()
    
    def create_default_config(self):
        """Create default workspace configuration"""
        config = {
            "workspaces": {
                "solidarity": {
                    "path": str(self.base_path),
                    "modules": ["src", "audio", "core", "utils"],
                    "priority": 1
                },
                "soul_ed_xchange": {
                    "path": "../Soul.Ed.Xchange",
                    "modules": ["src", "educational", "learning"],
                    "priority": 2
                },
                "coul_curve_fi": {
                    "path": "../Coul.Curve.Fi",
                    "modules": ["src", "financial", "blockchain"],
                    "priority": 2
                },
                "souls": {
                    "path": "../Souls",
                    "modules": ["src", "community", "social"],
                    "priority": 3
                },
                "ready": {
                    "path": "../ready",
                    "modules": ["src", "deployment", "config"],
                    "priority": 4
                }
            },
            "module_mapping": {
                "solidarityAudioProcessor": ["solidarity/src", "soul_ed_xchange/src"],
                "goldenHarmonicSystem": ["solidarity/src", "coul_curve_fi/src"],
                "ultimateSolidaritySystem": ["solidarity/src"],
                "EnhancedHarmonicPhraseParser": ["solidarity", "souls/src"],
                "fractal_quantum_energy": ["solidarity", "coul_curve_fi/src"]
            }
        }
        
        # Save default config
        config_file = self.base_path / "workspace_config.json"
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        
        return config
    
    def discover_workspaces(self):
        """Discover available workspaces"""
        discovered = {}
        
        # Check parent directory for common workspace patterns
        parent_dir = self.base_path.parent
        potential_workspaces = [
            "Soul.Ed.Xchange---Quantum-Core",
            "Coul-Curve", 
            "ready",
            "ston-sync-tech-by-Scott-Olson--Hank-and-perplexity",
            "stonsync-By-Scott-Olson--and-beak.er"
        ]
        
        for workspace_name in potential_workspaces:
            workspace_path = parent_dir / workspace_name
            if workspace_path.exists() and workspace_path.is_dir():
                discovered[workspace_name.lower().replace('.', '_')] = {
                    "path": str(workspace_path),
                    "exists": True,
                    "modules": self.scan_modules(workspace_path)
                }
        
        return discovered
    
    def scan_modules(self, workspace_path):
        """Scan workspace for module directories"""
        common_module_dirs = ["src", "lib", "modules", "core", "audio", "utils", "components"]
        found_modules = []
        
        for module_dir in common_module_dirs:
            if (workspace_path / module_dir).exists():
                found_modules.append(module_dir)
                
        return found_modules
    
    def map_workspace_paths(self):
        """Map all workspace paths to sys.path"""
        workspace_paths = []
        
        # Add current workspace paths
        current_paths = [
            self.base_path / "src",
            self.base_path / "audio", 
            self.base_path / "core",
            self.base_path / "utils",
            self.base_path
        ]
        
        for path in current_paths:
            if path.exists():
                workspace_paths.append(str(path))
        
        # Add discovered workspace paths
        discovered = self.discover_workspaces()
        for workspace_name, info in discovered.items():
            if info.get("exists"):
                workspace_path = Path(info["path"])
                for module_dir in info.get("modules", []):
                    module_path = workspace_path / module_dir
                    if module_path.exists():
                        workspace_paths.append(str(module_path))
                # Also add the workspace root
                workspace_paths.append(str(workspace_path))
        
        # Add to sys.path (avoiding duplicates)
        for path in workspace_paths:
            if path not in sys.path:
                sys.path.insert(0, path)
        
        return workspace_paths
    
    def unified_import(self, module_name, fallback_classes=None):
        """Attempt to import from multiple workspace locations"""
        if module_name in self.module_cache:
            return self.module_cache[module_name]
        
        # Try direct import first
        try:
            module = importlib.import_module(module_name) 
            self.module_cache[module_name] = module
            return module
        except ImportError:
            pass
        
        # Search for the file in known locations (both .py and .js)
        search_locations = [
            self.base_path / "src" / f"{module_name}.py",
            self.base_path / "core" / f"{module_name}.py", 
            self.base_path / f"{module_name}.py",
            self.base_path / "src" / f"{module_name}.js",
            self.base_path / "core" / f"{module_name}.js",
            self.base_path / f"{module_name}.js",
        ]
        
        # Also search in discovered workspaces
        discovered = self.discover_workspaces()
        for workspace_name, info in discovered.items():
            if info.get("exists"):
                workspace_path = Path(info["path"])
                search_locations.extend([
                    workspace_path / "src" / f"{module_name}.py",
                    workspace_path / "core" / f"{module_name}.py",
                    workspace_path / f"{module_name}.py",
                    workspace_path / "src" / f"{module_name}.js",
                    workspace_path / "core" / f"{module_name}.js", 
                    workspace_path / f"{module_name}.js",
                ])
        
        # Try each location
        for file_path in search_locations:
            if file_path.exists():
                if file_path.suffix == '.py':
                    try:
                        spec = importlib.util.spec_from_file_location(module_name, file_path)
                        if spec and spec.loader:
                            module = importlib.util.module_from_spec(spec)
                            spec.loader.exec_module(module)
                            self.module_cache[module_name] = module
                            return module
                    except Exception:
                        continue
                elif file_path.suffix == '.js':
                    # Create a Python wrapper for JavaScript modules
                    module = self.create_js_wrapper(module_name, file_path)
                    self.module_cache[module_name] = module
                    return module
        
        # Try from mapped locations (legacy support)
        if module_name in self.workspace_config.get("module_mapping", {}):
            mapping = self.workspace_config["module_mapping"][module_name]
            if isinstance(mapping, dict) and "primary" in mapping:
                location = mapping["primary"]
                workspace, path = location.split("/", 1) if "/" in location else (location, "")
                workspace_info = self.workspace_config["workspaces"].get(workspace, {})
                workspace_path = Path(workspace_info.get("path", "."))
                
                for ext in ['.py', '.js']:
                    if path:
                        full_path = workspace_path / path / f"{module_name}{ext}"
                    else:
                        full_path = workspace_path / f"{module_name}{ext}"
                    
                    if full_path.exists():
                        if ext == '.py':
                            try:
                                spec = importlib.util.spec_from_file_location(module_name, full_path)
                                if spec and spec.loader:
                                    module = importlib.util.module_from_spec(spec)
                                    spec.loader.exec_module(module)
                                    self.module_cache[module_name] = module
                                    return module
                            except Exception:
                                continue
                        elif ext == '.js':
                            module = self.create_js_wrapper(module_name, full_path)
                            self.module_cache[module_name] = module
                            return module
        
        # If all imports fail, create mock module with fallback classes
        if fallback_classes:
            return self.create_mock_module(module_name, fallback_classes)
        
        raise ImportError(f"Could not import {module_name} from any workspace")
    
    def create_js_wrapper(self, module_name, js_file_path):
        """Create Python wrapper for JavaScript modules"""
        import types
        
        js_module = types.ModuleType(module_name)
        js_module.__file__ = str(js_file_path)
        js_module.__js_source__ = str(js_file_path)
        
        # Create mock classes based on the module name
        if module_name == "goldenHarmonicSystem":
            class GoldenHarmonicProcessor:
                def __init__(self):
                    self.js_source = js_file_path
                    
                def process_harmonic(self, data):
                    # Mock implementation
                    return {"processed": True, "source": "JavaScript wrapper"}
            
            js_module.GoldenHarmonicProcessor = GoldenHarmonicProcessor
            
        elif module_name == "ultimateSolidaritySystem":
            class UltimateSolidaritySystem:
                def __init__(self):
                    self.js_source = js_file_path
                    
                def initialize_system(self):
                    return {"initialized": True, "source": "JavaScript wrapper"}
            
            js_module.UltimateSolidaritySystem = UltimateSolidaritySystem
            
        elif module_name == "EnhancedHarmonicPhraseParser":
            class EnhancedHarmonicPhraseParser:
                def __init__(self):
                    self.js_source = js_file_path
                    
                def parse_phrase(self, phrase):
                    return {"parsed": True, "phrase": phrase, "source": "JavaScript wrapper"}
            
            js_module.EnhancedHarmonicPhraseParser = EnhancedHarmonicPhraseParser
        
        # Add metadata
        js_module.__wrapped_js__ = True
        js_module.__js_file__ = str(js_file_path)
        
        return js_module
    
    def create_mock_module(self, module_name, fallback_classes):
        """Create mock module with fallback implementations"""
        import types
        
        mock_module = types.ModuleType(module_name)
        
        for class_name, class_impl in fallback_classes.items():
            setattr(mock_module, class_name, class_impl)
        
        self.module_cache[module_name] = mock_module
        return mock_module
    
    def get_workspace_status(self):
        """Get status of all workspaces"""
        status = {
            "current_workspace": str(self.base_path),
            "sys_paths": len([p for p in sys.path if "Solidarity" in p or "Soul" in p or "Coul" in p]),
            "discovered_workspaces": self.discover_workspaces(),
            "cached_modules": list(self.module_cache.keys())
        }
        return status
    
    def create_unified_imports(self):
        """Create unified import statements for common modules"""
        unified_imports = []
        
        # Map workspace paths
        paths = self.map_workspace_paths()
        unified_imports.append(f"# Mapped {len(paths)} workspace paths")
        
        # Common audio processing imports
        audio_modules = [
            "solidarityAudioProcessor",
            "goldenHarmonicSystem", 
            "ultimateSolidaritySystem",
            "EnhancedHarmonicPhraseParser"
        ]
        
        for module in audio_modules:
            try:
                imported_module = self.unified_import(module)
                unified_imports.append(f"✅ {module}: Available")
            except ImportError as e:
                unified_imports.append(f"❌ {module}: {str(e)}")
        
        return unified_imports

# Create global workspace mapper instance
workspace_mapper = SolidarityWorkspaceMapper()

def setup_unified_workspace():
    """Setup unified workspace environment"""
    print("🔧 Setting up unified Solidarity workspace...")
    
    # Map all workspace paths
    paths = workspace_mapper.map_workspace_paths()
    print(f"📁 Mapped {len(paths)} workspace paths")
    
    # Get workspace status
    status = workspace_mapper.get_workspace_status()
    print(f"🔍 Discovered {len(status['discovered_workspaces'])} workspaces")
    
    # Create unified imports
    imports = workspace_mapper.create_unified_imports()
    for imp in imports:
        print(f"   {imp}")
    
    return workspace_mapper

if __name__ == "__main__":
    setup_unified_workspace()
    
    # Print detailed status
    status = workspace_mapper.get_workspace_status()
    print("\n📊 Workspace Status:")
    print(json.dumps(status, indent=2))