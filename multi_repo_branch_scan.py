"""Multi-Repository & Branch Scanner for Solidarity Unified Network

This utility extends the unified file web network to:
 1. Enumerate sibling repositories (directories at the same parent level containing a .git folder)
 2. For each repo, list branches (local & remote) via 'git for-each-ref'
 3. Optionally checkout each branch (safe mode off by default) and run a lightweight scan
 4. Aggregate high-level metrics across repos/branches

Environment Flags:
  SAFE_MODE=1            -> Do NOT checkout branches (just list them)
  INCLUDE_REMOTE=1       -> Include remote branches
  BRANCH_LIMIT=N         -> Limit number of branches per repo
  FORCE_FULL_SCAN=1      -> Pass through to network (disable quick scan)
  EXPORT_NETWORK_REPORT=1 -> Export per-repo reports

Outputs:
  - Prints aggregated metrics table
  - Writes multi_repo_branch_report.json (summary)

Notes:
  - Branch checkout can be slow; use limits.
  - This script avoids destructive operations; it never deletes or merges.
"""

from __future__ import annotations
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Any

from unified_file_web_network import SolidarityFileWebNetwork

ROOT = Path(__file__).parent
PARENT = ROOT.parent


def run(cmd: List[str], cwd: Path) -> str:
    try:
        res = subprocess.run(cmd, cwd=str(cwd), capture_output=True, text=True, timeout=30)
        if res.returncode != 0:
            return res.stderr.strip()
        return res.stdout.strip()
    except Exception as e:
        return f"ERROR: {e}"


def list_repos() -> List[Path]:
    repos = []
    for child in PARENT.iterdir():
        if child.is_dir() and (child / '.git').exists():
            repos.append(child)
    return repos


def list_branches(repo: Path, include_remote: bool) -> List[str]:
    ref_prefix = 'refs/heads/'
    cmd = ['git', 'for-each-ref', '--format=%(refname:short)', 'refs/heads/']
    branches = run(cmd, repo).splitlines()
    if include_remote:
        remotes = run(['git', 'for-each-ref', '--format=%(refname:short)', 'refs/remotes/'], repo).splitlines()
        # Deduplicate remote HEAD pointers
        branches.extend([b for b in remotes if not b.endswith('/HEAD')])
    # Clean
    return sorted(set([b.strip() for b in branches if b.strip()]))


def checkout_branch(repo: Path, branch: str) -> bool:
    # For remote branches like origin/featureX create a local tracking branch name
    if '/' in branch and not (repo / '.git' / 'refs' / 'heads' / branch.split('/', 1)[-1]).exists():
        # Create tracking branch
        local_name = branch.split('/', 1)[-1]
        cmd = ['git', 'checkout', '-q', '-B', local_name, branch]
    else:
        cmd = ['git', 'checkout', '-q', branch.split('/', 1)[-1]]
    out = run(cmd, repo)
    return not out.startswith('ERROR')


def scan_repo_branch(repo: Path) -> Dict[str, Any]:
    network = SolidarityFileWebNetwork(base_path=repo, quick_scan=False)
    network.initialize_network()
    # Single optimization cycle to enrich metrics
    network.run_optimization_cycle()
    metrics = {
        'repo': repo.name,
        'path': str(repo),
        'nodes': len(network.file_nodes),
        'health': network.network_health,
    }
    for plane, plane_metrics in network.optimization_metrics.items():
        metrics[f'{plane.value}_count'] = plane_metrics.get('nodes')
    return metrics


def main():
    include_remote = os.environ.get('INCLUDE_REMOTE', '0') in ('1', 'true', 'True')
    safe_mode = os.environ.get('SAFE_MODE', '1') in ('1', 'true', 'True')
    branch_limit_raw = os.environ.get('BRANCH_LIMIT')
    branch_limit = int(branch_limit_raw) if branch_limit_raw and branch_limit_raw.isdigit() else 5

    repos = list_repos()
    if not repos:
        print('No sibling git repositories found.')
        return 1
    print(f'🔍 Found {len(repos)} repos to analyze (limit branches={branch_limit} safe_mode={safe_mode})')
    aggregate: List[Dict[str, Any]] = []
    start = time.time()
    for repo in repos:
        print(f'\n📁 Repository: {repo.name}')
        branches = list_branches(repo, include_remote)
        if not branches:
            print('  (no branches found)')
            continue
        print(f'  Branches discovered: {len(branches)}')
        target_branches = branches[:branch_limit]
        print(f'  Scanning branches: {target_branches}')
        current_branch = run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], repo)
        for br in target_branches:
            print(f'   → Branch {br}')
            if not safe_mode:
                if not checkout_branch(repo, br):
                    print(f'     ⚠️ Failed to checkout {br}, skipping')
                    continue
            else:
                print('     (safe mode: not checking out)')
            try:
                metrics = scan_repo_branch(repo)
                metrics['branch'] = br
                aggregate.append(metrics)
                print(f"     ✅ nodes={metrics['nodes']} health={metrics['health']:.3f}")
            except Exception as e:
                print(f'     ❌ Scan error: {e}')
        # Return to original branch if changed
        if not safe_mode and current_branch:
            checkout_branch(repo, current_branch)

    duration = time.time() - start
    print('\n=== Aggregate Summary ===')
    if aggregate:
        by_repo = {}
        for row in aggregate:
            by_repo.setdefault(row['repo'], 0)
            by_repo[row['repo']] += row['nodes']
        for repo_name, node_sum in by_repo.items():
            print(f'  {repo_name}: total_nodes_scanned={node_sum}')
        print(f'⏱️ Total duration: {duration:.2f}s')
    else:
        print('No scans executed.')

    # Write JSON report
    report_path = ROOT / 'multi_repo_branch_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({'generated_at': time.time(), 'aggregate': aggregate, 'duration_sec': duration}, f, indent=2)
    print(f'📝 Wrote aggregate report to {report_path}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
