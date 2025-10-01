#!/usr/bin/env python3
"""
Tests for recently added enhancement features:
 - Disk cache creation and reuse (Improvement #1)
 - Metrics snapshot export (Improvement #3)
 - Pattern extension via additional_scan_patterns.json (Improvement #4)
 - Branch diff summary stub (Improvement #2 placeholder)

These tests are intentionally focused and avoid asserting on console output; they
verify file artifacts and functional outcomes.
"""
import os
import time
import json
import unittest
from pathlib import Path

# Ensure project root is importable
PROJECT_ROOT = Path(__file__).parent
import sys
sys.path.insert(0, str(PROJECT_ROOT))

try:
    from unified_file_web_network import SolidarityFileWebNetwork
    UNIFIED_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Could not import unified system for enhancement tests: {e}")
    UNIFIED_AVAILABLE = False

class TestEnhancementFeatures(unittest.TestCase):
    base_path = PROJECT_ROOT

    def setUp(self):
        if not UNIFIED_AVAILABLE:
            self.skipTest("Unified system unavailable")
        # Use full scan for these tests
        os.environ['SOLIDARITY_QUICK_SCAN'] = '0'
        os.environ['FORCE_FULL_SCAN'] = '1'
        # Disable memory discovery cache to exercise disk cache & pattern logic freshly
        os.environ['DISABLE_MEMORY_DISCOVERY_CACHE'] = '1'
        # Synchronous disk cache write for determinism
        os.environ['SYNC_DISK_CACHE'] = '1'
        # Ensure metrics export is enabled
        os.environ['EXPORT_METRICS'] = '1'
    # Speed controls for tests
    os.environ['FULL_SCAN_SKIP_EXTERNAL'] = '1'
    os.environ['FULL_SCAN_MAX_FILES'] = '1200'

    def test_disk_cache_creation(self):
        """Full scan should create disk cache file; repeated init should not error."""
        # Allow disk cache
        os.environ['FULL_SCAN_CACHE'] = '1'
        cache_file = self.base_path / '.solidarity_scan_cache_full.json'
        if cache_file.exists():
            try:
                cache_file.unlink()
            except Exception:
                pass
        net = SolidarityFileWebNetwork(quick_scan=False)
        net.initialize_network()
        self.assertTrue(cache_file.exists(), 'Disk cache file not created')
        first_mtime = cache_file.stat().st_mtime
        # Second initialization should be fast and preserve (or update) cache
        time.sleep(0.2)  # slight delay
        net2 = SolidarityFileWebNetwork(quick_scan=False)
        net2.initialize_network()
        self.assertTrue(len(net2.file_nodes) > 0)
        second_mtime = cache_file.stat().st_mtime
        # Either reused or refreshed; ensure file still valid
        self.assertGreaterEqual(second_mtime, first_mtime)

    def test_metrics_snapshot_export(self):
        """Optimization cycle should generate metrics/latest.json with expected fields."""
        metrics_dir = self.base_path / 'metrics'
        latest = metrics_dir / 'latest.json'
        if latest.exists():
            try:
                latest.unlink()
            except Exception:
                pass
        net = SolidarityFileWebNetwork(quick_scan=False)
        net.initialize_network()
        net.run_optimization_cycle()
        self.assertTrue(latest.exists(), 'latest.json metrics snapshot missing')
        with open(latest, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.assertIn('cycle_results', data)
        self.assertIn('network_health', data)

    def test_pattern_extension(self):
        """Additional pattern file should allow discovery of a temp file when disk cache disabled."""
        # Disable disk cache to force a fresh scan
        os.environ['FULL_SCAN_CACHE'] = '0'
        extra_file = self.base_path / 'temp_feature_demo_alpha.py'
        pattern_file = self.base_path / 'additional_scan_patterns.json'
        try:
            # Create a temporary python file
            extra_file.write_text('# temp feature file for pattern extension test\n', encoding='utf-8')
            # Provide pattern extension mapping
            pattern_file.write_text(json.dumps({'core': ['temp_feature_demo_*.py']}), encoding='utf-8')
            net = SolidarityFileWebNetwork(quick_scan=False)
            net.initialize_network()
            # Look for the temp file among nodes
            paths = {str(n.path) for n in net.file_nodes.values()}
            self.assertIn(str(extra_file), paths, 'Temp file not discovered via extended patterns')
        finally:
            # Cleanup
            for p in (extra_file, pattern_file):
                try:
                    if p.exists():
                        p.unlink()
                except Exception:
                    pass

    def test_branch_diff_stub(self):
        """branch_diff_summary should return a dict even if branches are unchanged."""
        os.environ['FULL_SCAN_CACHE'] = '1'
        net = SolidarityFileWebNetwork(quick_scan=False)
        net.initialize_network()
        summary = net.branch_diff_summary('main')
        self.assertIsInstance(summary, dict)
        self.assertIn('base', summary)
        self.assertIn('changed_files', summary)

if __name__ == '__main__':
    unittest.main(verbosity=2)
