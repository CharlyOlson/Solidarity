#!/usr/bin/env python3
"""
Quick scan of workspace contents
"""

from pathlib import Path

def quick_scan():
    solidarity_path = Path(__file__).parent
    parent_path = solidarity_path.parent
    
    workspaces = [
        ("Soul.Ed.Xchange---Quantum-Core", parent_path / "Soul.Ed.Xchange---Quantum-Core"),
        ("Coul-Curve", parent_path / "Coul-Curve"),
        ("ready", parent_path / "ready"),
    ]
    
    for name, path in workspaces:
        print(f"\n📁 {name}")
        if path.exists():
            print("   ✅ Exists")
            # List top-level contents
            try:
                items = list(path.iterdir())[:10]  # First 10 items
                for item in items:
                    if item.is_dir():
                        print(f"   📁 {item.name}/")
                    else:
                        print(f"   📄 {item.name}")
                if len(list(path.iterdir())) > 10:
                    print(f"   ... and {len(list(path.iterdir())) - 10} more items")
            except PermissionError:
                print("   ❌ Permission denied")
        else:
            print("   ❌ Does not exist")

if __name__ == "__main__":
    quick_scan()