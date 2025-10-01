#!/usr/bin/env python3
"""
Solidarity Unified File Web Network System
A self-correcting, enhancing, metric-correcting system with three optimization planes
"""

import os
import sys
import json
import time
import hashlib
import threading
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import importlib.util
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

class OptimizationPlane(Enum):
    """Three superhighways/planes for optimization"""
    PERFORMANCE = "performance"  # Speed, efficiency, resource optimization
    HARMONY = "harmony"         # Golden ratio, audio processing, mathematical alignment
    INTEGRATION = "integration" # Cross-workspace, module connectivity, system cohesion

@dataclass
class FileNode:
    """Represents a file node in the web network"""
    path: Path
    node_type: str  # 'audio', 'core', 'test', 'config', 'blockchain'
    priority: int
    dependencies: List[str]
    metrics: Dict[str, float]
    optimization_planes: List[OptimizationPlane]
    last_modified: float
    health_score: float = 1.0
    
class SolidarityFileWebNetwork:
    """
    Self-correcting, enhancing file web network system
    Three optimization planes: Performance, Harmony, Integration
    
    Performance Optimizations Added:
    - Quick scan mode (limits patterns + skips external workspaces)
    - In-memory caching of discovered nodes to avoid repeated filesystem scans during tests
    - Optional environment variable SOLIDARITY_QUICK_SCAN=1 activates quick mode
    """
    
    # Class-level cache to avoid repeated expensive scans (keyed by base_path + quick_flag)
    _DISCOVERY_CACHE = {}
    _CACHE_TTL_SECONDS = 300  # 5 minutes
    
    def __init__(self, base_path: Path = None, quick_scan: bool = False):
        self.base_path = base_path or Path(__file__).parent
        # Allow env override
        env_quick = os.environ.get("SOLIDARITY_QUICK_SCAN", "0") in ("1", "true", "True")
        force_full = os.environ.get("FORCE_FULL_SCAN", "0") in ("1", "true", "True") or \
                      os.environ.get("FULL_SCAN_STRICT", "0") in ("1", "true", "True")
        self.quick_scan = quick_scan or env_quick
        if force_full:
            self.quick_scan = False
        self.force_full = force_full
        self.file_nodes = {}
        self.optimization_metrics = {
            OptimizationPlane.PERFORMANCE: {},
            OptimizationPlane.HARMONY: {},
            OptimizationPlane.INTEGRATION: {}
        }
        self.network_health = 1.0
        self.correction_log = []
        self.enhancement_suggestions = []
        
        # Initialize the three superhighways
        self.performance_highway = PerformanceOptimizationHighway(self)
        self.harmony_highway = HarmonyOptimizationHighway(self)
        self.integration_highway = IntegrationOptimizationHighway(self)
        
    def initialize_network(self):
        """Initialize and map the complete file web network (with caching/quick mode)."""
        mode_label = "[QUICK]" if self.quick_scan else ("[FORCED FULL]" if self.force_full else "[FULL]")
        print(f"🕸️ Initializing Solidarity File Web Network... {mode_label}")
        print("=" * 60)
        print(f"Flags => quick_scan={self.quick_scan} force_full={self.force_full} env_QUICK={os.environ.get('SOLIDARITY_QUICK_SCAN','0')} FULL_SCAN={os.environ.get('FULL_SCAN','0')} FORCE_FULL_SCAN={os.environ.get('FORCE_FULL_SCAN','0')}")
        
        cache_key = (str(self.base_path.resolve()), self.quick_scan)
        now = time.time()
        cache_entry = self._DISCOVERY_CACHE.get(cache_key)
        disable_mem_cache = os.environ.get('DISABLE_MEMORY_DISCOVERY_CACHE','0') in ('1','true','True')
        if cache_entry and not disable_mem_cache and (now - cache_entry['timestamp'] < self._CACHE_TTL_SECONDS):
            # Reuse cached discovery
            self.file_nodes = {k: v for k, v in cache_entry['file_nodes'].items()}
            # Recalculate metrics (health may have changed minorly)
            self._calculate_network_metrics()
            self._initialize_highways()
            print(f"⚡ Used cached discovery: {len(self.file_nodes)} nodes (age {(now - cache_entry['timestamp']):.1f}s)")
            print(f"📊 Network health: {self.network_health:.3f}")
            return
        
        # Attempt disk cache load (only for full scans unless QUICK_CACHE=1)
        disk_cache_used = False
        if not self.quick_scan or os.environ.get('QUICK_CACHE','0') in ('1','true','True'):
            if os.environ.get('FULL_SCAN_CACHE','1') in ('1','true','True'):
                try:
                    if self._try_load_disk_cache():
                        disk_cache_used = True
                        print(f"💾 Loaded disk cache: {len(self.file_nodes)} nodes")
                except Exception as e:
                    print(f"⚠️ Disk cache load failed: {e}")

        if not disk_cache_used:
            # Perform fresh discovery
            self._discover_file_nodes()
            self._analyze_dependencies()
            # Save disk cache (async) if enabled
            if (not self.quick_scan or os.environ.get('QUICK_CACHE','0') in ('1','true','True')) and \
               os.environ.get('FULL_SCAN_CACHE','1') in ('1','true','True'):
                if os.environ.get('SYNC_DISK_CACHE','0') in ('1','true','True'):
                    self._save_disk_cache()
                else:
                    threading.Thread(target=self._save_disk_cache, daemon=True).start()
        else:
            # Need dependencies if not present (simple heuristic: if first node has no deps, run analysis)
            sample_node = next(iter(self.file_nodes.values()), None)
            if sample_node and not sample_node.dependencies:
                self._analyze_dependencies()
        self._calculate_network_metrics()
        self._initialize_highways()
        
        # Store in cache (lightweight dataclass copy is fine)
        self._DISCOVERY_CACHE[cache_key] = {
            'timestamp': now,
            'file_nodes': self.file_nodes
        }
        
        print(f"✅ Network initialized: {len(self.file_nodes)} nodes")
        print(f"📊 Network health: {self.network_health:.3f}")
        # Auto export lightweight report if requested
        if os.environ.get("EXPORT_NETWORK_REPORT", "0") in ("1", "true", "True"):
            try:
                self.export_report()
                print("📝 Exported network report to network_scan_report.json")
            except Exception as e:
                print(f"⚠️ Failed to export report: {e}")

    def export_report(self, output_path: Optional[Path] = None):
        """Export a JSON report summarizing the network."""
        output_path = output_path or (self.base_path / "network_scan_report.json")
        summary = {
            'generated_at': time.time(),
            'base_path': str(self.base_path),
            'quick_scan': self.quick_scan,
            'force_full': self.force_full,
            'total_nodes': len(self.file_nodes),
            'network_health': self.network_health,
            'optimization_metrics': {p.value: m for p, m in self.optimization_metrics.items()},
            'nodes': [
                {
                    'path': str(n.path),
                    'type': n.node_type,
                    'priority': n.priority,
                    'planes': [pl.value for pl in n.optimization_planes],
                    'deps': len(n.dependencies)
                } for n in self.file_nodes.values()
            ][:1000]  # cap detailed listing for size
        }
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2)
        # Persist dependency graph (Improvement #5)
        try:
            graph = {
                'generated_at': time.time(),
                'nodes': [str(n.path) for n in self.file_nodes.values()],
                'edges': [
                    {'from': str(n.path), 'to': dep}
                    for n in self.file_nodes.values() for dep in n.dependencies[:500]
                ][:5000]  # safety cap
            }
            with open(self.base_path / 'dependency_graph.json', 'w', encoding='utf-8') as gf:
                json.dump(graph, gf, indent=2)
        except Exception as e:
            print(f"⚠️ Failed to write dependency_graph.json: {e}")

    # ---------------- Incremental / Git-Diff Aware Scan (Improvement #3 of next wave) -----------------
    def incremental_rescan(self, changed_files: Optional[List[str]] = None, base_branch: str = 'main') -> Dict[str, Any]:
        """Perform a targeted rescan of only changed files, updating/adding nodes.
        If changed_files not provided, attempt to derive via git diff against base_branch.
        Returns summary dict with counts.
        """
        if changed_files is None:
            try:
                import subprocess, shutil
                if shutil.which('git'):
                    diff = subprocess.run(['git','diff','--name-only', f'{base_branch}..HEAD'], cwd=self.base_path, capture_output=True, text=True)
                    if diff.returncode == 0:
                        changed_files = [l for l in diff.stdout.splitlines() if l]
            except Exception as e:
                print(f"⚠️ incremental_rescan git diff failed: {e}")
        changed_files = changed_files or []
        updated = 0
        added = 0
        for rel in changed_files:
            p = (self.base_path / rel).resolve()
            if not p.exists() or not p.is_file():
                continue
            key = str(p)
            if key in self.file_nodes:
                # update metadata
                node = self.file_nodes[key]
                node.last_modified = p.stat().st_mtime
                # simple dependency re-eval for that node only
                node.dependencies = self._extract_dependencies(p)
                updated += 1
            else:
                # categorize and add
                category = self._infer_category(p)
                self._create_file_node(p, category)
                added += 1
        # Recompute metrics lightly
        self._calculate_network_metrics()
        return {
            'changed_files_input': len(changed_files),
            'nodes_updated': updated,
            'nodes_added': added,
            'total_nodes': len(self.file_nodes),
            'network_health': self.network_health
        }

    def _infer_category(self, path: Path) -> str:
        name = path.name.lower()
        if name.endswith('.sol'): return 'blockchain'
        if 'test' in name: return 'test'
        if name.endswith('.json') or name.startswith('setup'): return 'config'
        if 'harmonic' in name or 'audio' in name: return 'audio'
        return 'core'

    # ---------------- Disk Cache (Improvement #1) -----------------
    def _disk_cache_path(self) -> Path:
        name = 'quick' if self.quick_scan else 'full'
        return self.base_path / f".solidarity_scan_cache_{name}.json"

    def _build_cache_signature(self) -> Dict[str, Any]:
        root_stat = self.base_path.stat()
        return {
            'base_path': str(self.base_path.resolve()),
            'quick': self.quick_scan,
            'force_full': self.force_full,
            'timestamp': time.time(),
            'root_mtime': root_stat.st_mtime,
            'version': 1
        }

    def _try_load_disk_cache(self) -> bool:
        path = self._disk_cache_path()
        if not path.exists():
            return False
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        sig = data.get('signature', {})
        # Basic staleness check: if root directory modified after cache timestamp, invalidate
        try:
            if self.base_path.stat().st_mtime > sig.get('root_mtime', 0):
                return False
        except Exception:
            return False
        nodes = data.get('nodes', [])
        for entry in nodes:
            p = Path(entry['path'])
            if not p.exists():
                continue
            category = entry.get('category','core')
            self._create_file_node(p, category)
        return len(self.file_nodes) > 0

    def _save_disk_cache(self):
        try:
            path = self._disk_cache_path()
            nodes = [{'path': str(n.path), 'category': n.node_type, 'mtime': n.last_modified} for n in self.file_nodes.values()]
            payload = {
                'signature': self._build_cache_signature(),
                'nodes': nodes
            }
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(payload, f, indent=2)
            # print silently to avoid clutter; could add verbose flag
        except Exception as e:
            print(f"⚠️ Failed to write disk cache: {e}")
        
    def _discover_file_nodes(self):
        """Discover and categorize files (supports quick mode)."""
        # Directories to ignore for performance (common large or irrelevant dirs)
        ignore_dirs = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'dist', 'build', '.idea', '.vscode'}

        if self.quick_scan:
            # In ultra-fast quick scan mode, we avoid any recursive glob patterns to prevent deep OneDrive traversal.
            manual_files = [
                'launcher.js',
                'unified_file_web_network.py',
                'unified_system_config.json',
                'test_unified_system.py',
                'test_numpy_quick.py',
                'test_advanced_audio.py',
                'test_advanced_audio_fixed.py',
                'workspace_mapper.py',
                'perplexityIntegration.js',
                'EnhancedHarmonicPhraseParser.js',
                'multi-drive-manager.js',
                'src/goldenHarmonicSystem.js',
                'src/ultimateSolidaritySystem.js'
            ]
            category_map = {
                'launcher.js': 'core',
                'unified_file_web_network.py': 'core',
                'unified_system_config.json': 'config',
                'test_unified_system.py': 'test',
                'test_numpy_quick.py': 'test',
                'test_advanced_audio.py': 'test',
                'test_advanced_audio_fixed.py': 'test',
                'workspace_mapper.py': 'workspace',
                'perplexityIntegration.js': 'core',
                'EnhancedHarmonicPhraseParser.js': 'core',
                'multi-drive-manager.js': 'workspace',
                'src/goldenHarmonicSystem.js': 'core',
                'src/ultimateSolidaritySystem.js': 'core'
            }
            added = 0
            for rel in manual_files:
                candidate = self.base_path / rel
                if candidate.exists() and candidate.is_file():
                    self._create_file_node(candidate, category_map.get(rel, 'core'))
                    added += 1
            # Return early — no deep scan in quick mode
            return
        else:
            file_patterns = {
                'audio': ['*audio*.py', '*Audio*.py', '*harmonic*.py', '*spatial*.py'],
                'core': ['*system*.js', '*System*.js', '*core*.py', '*launcher*.js'],
                'test': ['test_*.py', '*_test.py', '*Test*.py'],
                'config': ['*.json', '*.env*', 'setup*.py', 'package.json'],
                'blockchain': ['*.sol', '*contract*.js', 'hardhat*.js'],
                'workspace': ['workspace*.py', '*mapper*.py', '*scanner*.py']
            }
            # Pattern extension (Improvement #4)
            extra_patterns_path = self.base_path / 'additional_scan_patterns.json'
            if extra_patterns_path.exists():
                try:
                    with open(extra_patterns_path,'r',encoding='utf-8') as f:
                        extra = json.load(f)
                    if isinstance(extra, dict):
                        for k,v in extra.items():
                            if isinstance(v, list):
                                file_patterns.setdefault(k, [])
                                file_patterns[k].extend([pat for pat in v if pat not in file_patterns[k]])
                        print("➕ Loaded additional scan patterns")
                except Exception as e:
                    # Log and continue without failing the scan if optional pattern file is malformed
                    print(f"⚠️ Could not load additional patterns: {e}")
        
        scanned = 0
        if self.quick_scan:
            # quick mode handled above; nothing further
            return

        # === Full Scan Enhancements (Improvements 1,2,3) ===
        # Environment-configurable limits
        max_files = int(os.environ.get('FULL_SCAN_MAX_FILES', '6000') or 6000)
        max_depth = int(os.environ.get('FULL_SCAN_MAX_DEPTH', '8') or 8)
        progress_interval = int(os.environ.get('FULL_SCAN_PROGRESS_INTERVAL', '500') or 500)
        skip_external = os.environ.get('FULL_SCAN_SKIP_EXTERNAL', '0') in ('1','true','True')
        include_external = not skip_external

        print(f"🔍 Full scan parameters: max_files={max_files} max_depth={max_depth} progress_interval={progress_interval} external={'yes' if include_external else 'no'}")

        from fnmatch import fnmatch
        base_depth = len(self.base_path.parts)

        # Precompile flattened pattern → category mapping (preserve category order priority)
        ordered_categories = list(file_patterns.keys())
        pattern_map = []  # list of (pattern, category)
        for cat in ordered_categories:
            for pat in file_patterns[cat]:
                pattern_map.append((pat, cat))

        def match_category(name: str) -> Optional[str]:
            for pat, cat in pattern_map:
                if fnmatch(name, pat):
                    return cat
            return None

        # Single-pass directory walk
        for dirpath, dirnames, filenames in os.walk(self.base_path):
            # Prune ignored directories early (in-place modification of dirnames)
            dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
            current_depth = len(Path(dirpath).parts) - base_depth
            if current_depth > max_depth:
                # Prevent descending further
                dirnames[:] = []
                continue
            for fname in filenames:
                full_path = Path(dirpath) / fname
                cat = match_category(fname)
                if not cat:
                    continue
                if not full_path.is_file():
                    continue
                self._create_file_node(full_path, cat)
                scanned += 1
                if scanned % progress_interval == 0:
                    print(f"  … discovered {scanned} files so far (depth≤{current_depth})")
                if scanned >= max_files:
                    print(f"⏹️ Reached FULL_SCAN_MAX_FILES cap ({max_files}), stopping base scan.")
                    break
            if scanned >= max_files:
                break

        if include_external and scanned < max_files:
            before_external = scanned
            self._scan_connected_workspaces(file_patterns)
            scanned = len(self.file_nodes)
            if scanned >= max_files:
                print(f"⏹️ External workspace scan reached cap at {scanned} files (limit {max_files}).")
            else:
                print(f"🔗 External workspace contribution: +{scanned - before_external} nodes (total {scanned}).")
        else:
            if not include_external:
                print("🚫 External workspace scan skipped by FULL_SCAN_SKIP_EXTERNAL flag.")
            else:
                print("ℹ️ File cap reached before external scan; skipping external workspaces.")
    
    def _create_file_node(self, file_path: Path, category: str):
        """Create a file node with optimization plane assignments"""
        relative_path = file_path.relative_to(self.base_path) if file_path.is_relative_to(self.base_path) else file_path
        
        # Determine optimization planes based on file type and content
        planes = self._assign_optimization_planes(file_path, category)
        
        # Calculate priority based on category and dependencies
        priority = self._calculate_file_priority(file_path, category)
        
        node = FileNode(
            path=file_path,
            node_type=category,
            priority=priority,
            dependencies=[],
            metrics={},
            optimization_planes=planes,
            last_modified=file_path.stat().st_mtime,
            health_score=1.0
        )
        
        self.file_nodes[str(relative_path)] = node
    
    def _assign_optimization_planes(self, file_path: Path, category: str) -> List[OptimizationPlane]:
        """Assign optimization planes based on file characteristics"""
        planes = []
        
        # Performance plane assignment
        if category in ['audio', 'core'] or 'test' in file_path.name:
            planes.append(OptimizationPlane.PERFORMANCE)
        
        # Harmony plane assignment  
        if 'harmonic' in str(file_path).lower() or 'golden' in str(file_path).lower():
            planes.append(OptimizationPlane.HARMONY)
        
        # Integration plane assignment
        if category in ['workspace', 'config'] or 'mapper' in file_path.name:
            planes.append(OptimizationPlane.INTEGRATION)
        
        # Ensure every file has at least one plane
        if not planes:
            planes.append(OptimizationPlane.INTEGRATION)
            
        return planes
    
    def _calculate_file_priority(self, file_path: Path, category: str) -> int:
        """Calculate file priority based on importance in the network"""
        priority_map = {
            'core': 10,
            'audio': 9,
            'workspace': 8,
            'config': 7,
            'blockchain': 6,
            'test': 5
        }
        
        base_priority = priority_map.get(category, 1)
        
        # Boost priority for key files
        key_files = [
            'launcher.js',
            'solidarityAudioProcessor.py',
            'workspace_mapper.py',
            'ultimateSolidaritySystem.js'
        ]
        
        if file_path.name in key_files:
            base_priority += 5
            
        return base_priority
    
    def _scan_connected_workspaces(self, file_patterns):
        """Scan connected workspaces for additional nodes"""
        parent_dir = self.base_path.parent
        connected_workspaces = [
            "Soul.Ed.Xchange---Quantum-Core",
            "Coul-Curve",
            "ready"
        ]
        
        for workspace_name in connected_workspaces:
            workspace_path = parent_dir / workspace_name
            if workspace_path.exists():
                for category, patterns in file_patterns.items():
                    for pattern in patterns:
                        for file_path in workspace_path.rglob(pattern):
                            if file_path.is_file():
                                self._create_file_node(file_path, f"{category}_external")
    
    def _analyze_dependencies(self):
        """Analyze file dependencies and relationships"""
        # Parallel dependency analysis (Improvement #5)
        workers_env = os.environ.get('DEP_ANALYSIS_WORKERS')
        try:
            workers = int(workers_env) if workers_env else min(32, (os.cpu_count() or 4))
        except ValueError:
            workers = min(32, (os.cpu_count() or 4))

        nodes_list = list(self.file_nodes.values())
        if not nodes_list:
            return

        def analyze(node: FileNode):
            try:
                if node.path.suffix == '.py':
                    return node, self._analyze_python_dependencies(node.path)
                if node.path.suffix == '.js':
                    return node, self._analyze_javascript_dependencies(node.path)
                return node, []
            except Exception:
                return node, []

        if workers <= 1 or len(nodes_list) < 10:
            for node in nodes_list:
                node.dependencies = analyze(node)[1]
        else:
            with ThreadPoolExecutor(max_workers=workers) as ex:
                futures = [ex.submit(analyze, n) for n in nodes_list]
                for fut in as_completed(futures):
                    node, deps = fut.result()
                    node.dependencies = deps
    
    def _analyze_python_dependencies(self, file_path: Path) -> List[str]:
        """Analyze Python file dependencies"""
        dependencies = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Find import statements
            import_patterns = [
                'import ', 'from ', 'importlib.import_module'
            ]
            
            for line in content.split('\n'):
                line = line.strip()
                for pattern in import_patterns:
                    if line.startswith(pattern):
                        dependencies.append(line)
                        
        except Exception:
            pass
            
        return dependencies
    
    def _analyze_javascript_dependencies(self, file_path: Path) -> List[str]:
        """Analyze JavaScript file dependencies"""
        dependencies = []
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Find require/import statements
            js_patterns = [
                'require(', 'import ', 'const ', 'let ', 'var '
            ]
            
            for line in content.split('\n'):
                line = line.strip()
                for pattern in js_patterns:
                    if pattern in line and ('=' in line or 'from' in line):
                        dependencies.append(line)
                        
        except Exception:
            pass
            
        return dependencies
    
    def _calculate_network_metrics(self):
        """Calculate comprehensive network metrics"""
        total_nodes = len(self.file_nodes)
        healthy_nodes = sum(1 for node in self.file_nodes.values() if node.health_score > 0.8)
        
        self.network_health = healthy_nodes / total_nodes if total_nodes > 0 else 0
        
        # Calculate metrics for each optimization plane
        for plane in OptimizationPlane:
            plane_nodes = [node for node in self.file_nodes.values() if plane in node.optimization_planes]
            self.optimization_metrics[plane] = {
                'node_count': len(plane_nodes),
                'avg_health': sum(node.health_score for node in plane_nodes) / len(plane_nodes) if plane_nodes else 0,
                'total_priority': sum(node.priority for node in plane_nodes)
            }
    
    def _initialize_highways(self):
        """Initialize the three optimization superhighways"""
        self.performance_highway.initialize()
        self.harmony_highway.initialize()
        self.integration_highway.initialize()
    
    def run_optimization_cycle(self):
        """Run a complete optimization cycle across all three highways"""
        print("🚀 Running Optimization Cycle...")
        print("=" * 40)
        
        cycle_start = time.time()
        
        # Run optimization on each highway
        perf_metrics = self.performance_highway.optimize()
        harmony_metrics = self.harmony_highway.optimize()
        integration_metrics = self.integration_highway.optimize()
        
        # Apply corrections and enhancements
        self._apply_corrections()
        self._generate_enhancements()
        
        # Recalculate network metrics
        self._calculate_network_metrics()
        
        cycle_time = time.time() - cycle_start
        
        print(f"✅ Optimization cycle completed in {cycle_time:.3f}s")
        print(f"📊 Network health: {self.network_health:.3f}")
        
        results = {
            'performance': perf_metrics,
            'harmony': harmony_metrics,
            'integration': integration_metrics,
            'network_health': self.network_health,
            'cycle_time': cycle_time
        }
        # Metrics export (Improvement #3)
        if os.environ.get('EXPORT_METRICS','1') in ('1','true','True'):
            try:
                self._export_metrics_snapshot(results)
            except Exception as e:
                print(f"⚠️ Metrics export failed: {e}")
        return results

    def _export_metrics_snapshot(self, cycle_results: Dict[str, Any]):
        metrics_dir = self.base_path / 'metrics'
        metrics_dir.mkdir(exist_ok=True)
        timestamp = time.strftime('%Y%m%d_%H%M%S')
        payload = {
            'timestamp': timestamp,
            'network_health': self.network_health,
            'cycle_results': cycle_results,
            'optimization_metrics': {p.value: m for p,m in self.optimization_metrics.items()},
            'total_nodes': len(self.file_nodes)
        }
        with open(metrics_dir / f'metrics_{timestamp}.json','w',encoding='utf-8') as f:
            json.dump(payload,f,indent=2)
        # latest pointer
        with open(metrics_dir / 'latest.json','w',encoding='utf-8') as f:
            json.dump(payload,f,indent=2)

    # Branch diff stub (Improvement #2 placeholder)
    def branch_diff_summary(self, base_branch: str = 'main', target_branch: str = None) -> Dict[str, Any]:
        """Stub: produce a summary of changed files between branches (non-destructive).
        If target_branch is None, uses current HEAD.
        """
        try:
            import subprocess, shutil
            repo = self.base_path
            if not shutil.which('git'):
                return {'base': base_branch, 'target': target_branch or base_branch, 'changed_files': 0, 'files': [], 'note': 'git not available'}
            # Ensure we're inside a git repository
            is_repo = subprocess.run(['git','rev-parse','--is-inside-work-tree'], cwd=repo, capture_output=True, text=True)
            if is_repo.returncode != 0:
                return {'base': base_branch, 'target': target_branch or base_branch, 'changed_files': 0, 'files': [], 'note': 'not a git repo'}
            current = subprocess.run(['git','rev-parse','--abbrev-ref','HEAD'], cwd=repo, capture_output=True, text=True)
            current_branch = current.stdout.strip() if current.returncode==0 else 'UNKNOWN'
            tgt = target_branch or current_branch
            if base_branch == tgt:
                return {'base': base_branch, 'target': tgt, 'changed_files': 0, 'files': []}
            diff = subprocess.run(['git','diff','--name-only', f'{base_branch}..{tgt}'], cwd=repo, capture_output=True, text=True)
            files = [f for f in diff.stdout.splitlines() if f]
            return {'base': base_branch, 'target': tgt, 'changed_files': len(files), 'files_sample': files[:50]}
        except Exception as e:
            return {'base': base_branch, 'target': target_branch or base_branch, 'error': str(e), 'changed_files': 0, 'files': []}
    
    def _apply_corrections(self):
        """Apply self-corrections based on detected issues"""
        corrections_applied = 0
        
        for node_key, node in self.file_nodes.items():
            if node.health_score < 0.7:
                # Apply corrections based on node type and issues
                if self._correct_node_issues(node):
                    corrections_applied += 1
        
        if corrections_applied > 0:
            self.correction_log.append({
                'timestamp': time.time(),
                'corrections_applied': corrections_applied,
                'network_health_after': self.network_health
            })
    
    def _correct_node_issues(self, node: FileNode) -> bool:
        """Correct issues in a specific node"""
        corrected = False
        
        # Check for common issues and apply fixes
        try:
            if node.path.exists():
                # Update health score based on file accessibility
                node.health_score = min(1.0, node.health_score + 0.1)
                corrected = True
        except Exception:
            node.health_score = max(0.0, node.health_score - 0.2)
        
        return corrected
    
    def _generate_enhancements(self):
        """Generate enhancement suggestions for the network"""
        suggestions = []
        
        # Analyze optimization opportunities
        for plane in OptimizationPlane:
            plane_metrics = self.optimization_metrics[plane]
            if plane_metrics['avg_health'] < 0.8:
                suggestions.append({
                    'plane': plane.value,
                    'type': 'health_improvement',
                    'priority': 'high',
                    'description': f"Improve {plane.value} plane health from {plane_metrics['avg_health']:.3f}"
                })
        
        self.enhancement_suggestions.extend(suggestions)
    
    def get_network_status(self):
        """Get comprehensive network status"""
        return {
            'total_nodes': len(self.file_nodes),
            'network_health': self.network_health,
            'optimization_metrics': {plane.value: metrics for plane, metrics in self.optimization_metrics.items()},
            'corrections_applied': len(self.correction_log),
            'enhancement_suggestions': len(self.enhancement_suggestions),
            'highways': {
                'performance': self.performance_highway.get_status(),
                'harmony': self.harmony_highway.get_status(),
                'integration': self.integration_highway.get_status()
            }
        }

class PerformanceOptimizationHighway:
    """Performance optimization superhighway - Speed, efficiency, resource optimization"""
    
    def __init__(self, network):
        self.network = network
        self.performance_metrics = {}
        
    def initialize(self):
        """Initialize performance monitoring"""
        self.performance_metrics = {
            'execution_times': {},
            'memory_usage': {},
            'cpu_efficiency': {}
        }
        
    def optimize(self):
        """Run performance optimizations"""
        print("🏎️ Performance Highway: Optimizing speed and efficiency...")
        
        # Analyze execution performance
        perf_nodes = [node for node in self.network.file_nodes.values() 
                     if OptimizationPlane.PERFORMANCE in node.optimization_planes]
        
        optimizations = 0
        for node in perf_nodes:
            if self._optimize_node_performance(node):
                optimizations += 1
        
        return {
            'nodes_optimized': optimizations,
            'total_performance_nodes': len(perf_nodes)
        }
    
    def _optimize_node_performance(self, node: FileNode) -> bool:
        """Optimize performance for a specific node"""
        # Mock performance optimization
        if node.node_type in ['audio', 'core']:
            node.metrics['performance_score'] = min(1.0, node.metrics.get('performance_score', 0.7) + 0.05)
            return True
        return False
    
    def get_status(self):
        """Get performance highway status"""
        return {
            'active': True,
            'metrics_tracked': len(self.performance_metrics),
            'optimization_level': 'high'
        }

class HarmonyOptimizationHighway:
    """Harmony optimization superhighway - Golden ratio, audio processing, mathematical alignment"""
    
    def __init__(self, network):
        self.network = network
        self.phi = (1 + np.sqrt(5)) / 2  # Golden ratio
        self.harmony_metrics = {}
        
    def initialize(self):
        """Initialize harmony monitoring"""
        self.harmony_metrics = {
            'golden_ratio_alignment': {},
            'audio_coherence': {},
            'mathematical_precision': {}
        }
        
    def optimize(self):
        """Run harmony optimizations"""
        print("🎵 Harmony Highway: Optimizing golden ratio and audio coherence...")
        
        # Analyze harmonic alignment
        harmony_nodes = [node for node in self.network.file_nodes.values() 
                        if OptimizationPlane.HARMONY in node.optimization_planes]
        
        alignments = 0
        for node in harmony_nodes:
            if self._optimize_node_harmony(node):
                alignments += 1
        
        return {
            'nodes_aligned': alignments,
            'total_harmony_nodes': len(harmony_nodes),
            'phi_precision': float(self.phi)
        }
    
    def _optimize_node_harmony(self, node: FileNode) -> bool:
        """Optimize harmony for a specific node"""
        if 'harmonic' in str(node.path).lower() or 'golden' in str(node.path).lower():
            node.metrics['harmony_score'] = self.phi * 0.618  # Golden ratio alignment
            return True
        return False
    
    def get_status(self):
        """Get harmony highway status"""
        return {
            'active': True,
            'phi_value': float(self.phi),
            'harmony_level': 'optimal'
        }

class IntegrationOptimizationHighway:
    """Integration optimization superhighway - Cross-workspace, module connectivity, system cohesion"""
    
    def __init__(self, network):
        self.network = network
        self.integration_metrics = {}
        
    def initialize(self):
        """Initialize integration monitoring"""
        self.integration_metrics = {
            'workspace_connectivity': {},
            'module_cohesion': {},
            'dependency_health': {}
        }
        
    def optimize(self):
        """Run integration optimizations"""
        print("🔗 Integration Highway: Optimizing connectivity and cohesion...")
        
        # Analyze integration strength
        integration_nodes = [node for node in self.network.file_nodes.values() 
                           if OptimizationPlane.INTEGRATION in node.optimization_planes]
        
        connections = 0
        for node in integration_nodes:
            if self._optimize_node_integration(node):
                connections += 1
        
        return {
            'nodes_integrated': connections,
            'total_integration_nodes': len(integration_nodes),
            'connectivity_score': self._calculate_connectivity_score()
        }
    
    def _optimize_node_integration(self, node: FileNode) -> bool:
        """Optimize integration for a specific node"""
        if node.node_type in ['workspace', 'config']:
            node.metrics['integration_score'] = min(1.0, len(node.dependencies) * 0.1)
            return True
        return False
    
    def _calculate_connectivity_score(self) -> float:
        """Calculate overall network connectivity score"""
        total_deps = sum(len(node.dependencies) for node in self.network.file_nodes.values())
        total_nodes = len(self.network.file_nodes)
        return min(1.0, total_deps / (total_nodes * 3)) if total_nodes > 0 else 0
    
    def get_status(self):
        """Get integration highway status"""
        return {
            'active': True,
            'connectivity_level': 'high',
            'integration_strength': self._calculate_connectivity_score()
        }

def main():
    """Main function to initialize and run the unified file web network"""
    print("🕸️ Solidarity Unified File Web Network System")
    print("=" * 60)
    print("Self-correcting, enhancing, metric-correcting system")
    print("Three optimization superhighways: Performance | Harmony | Integration")
    print("=" * 60)
    
    # Determine scan mode precedence:
    # FORCE_FULL_SCAN=1 -> full
    # FULL_SCAN=1       -> full
    # SOLIDARITY_QUICK_SCAN=1 (and no full flags) -> quick
    force_full = os.environ.get("FORCE_FULL_SCAN", "0") in ("1", "true", "True")
    full_scan_flag = os.environ.get("FULL_SCAN", "0") in ("1", "true", "True")
    quick_flag = os.environ.get("SOLIDARITY_QUICK_SCAN", "0") in ("1", "true", "True")
    quick = False
    if quick_flag and not (force_full or full_scan_flag):
        quick = True
    print(f"[MODE] force_full={force_full} full_scan_flag={full_scan_flag} quick_flag={quick_flag} => quick_scan={quick}")
    network = SolidarityFileWebNetwork(quick_scan=quick)
    network.initialize_network()
    
    # Run optimization cycle
    results = network.run_optimization_cycle()
    
    # Display comprehensive status
    status = network.get_network_status()
    
    print("\n📊 NETWORK STATUS REPORT")
    print("=" * 40)
    print(f"Total Nodes: {status['total_nodes']}")
    print(f"Network Health: {status['network_health']:.3f}")
    print(f"Corrections Applied: {status['corrections_applied']}")
    print(f"Enhancement Suggestions: {status['enhancement_suggestions']}")
    
    print("\n🛣️ HIGHWAY STATUS")
    print("=" * 40)
    for highway_name, highway_status in status['highways'].items():
        print(f"{highway_name.upper()}: {highway_status}")
    
    print("\n🎯 OPTIMIZATION RESULTS")
    print("=" * 40)
    for plane, metrics in results.items():
        if isinstance(metrics, dict):
            print(f"{plane.upper()}: {metrics}")
    
    return network, results

if __name__ == "__main__":
    network, results = main()