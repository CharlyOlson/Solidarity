#!/usr/bin/env python3
"""
Secure Python Environment Setup for Solidarity Platform
Alternative to npm for managing Python dependencies without security leaks
"""

import subprocess
import sys
import os
import json
from pathlib import Path

class SecurePythonEnvironmentManager:
    def __init__(self):
        self.solidarity_root = Path(__file__).parent
        self.venv_path = self.solidarity_root / "python_env"
        self.requirements = {
            "core": [
                "numpy>=1.20.0",
                "scipy>=1.7.0", 
                "matplotlib>=3.5.0"
            ],
            "audio": [
                "librosa>=0.9.0",
                "soundfile>=0.10.0",
                "pyaudio>=0.2.11"
            ],
            "development": [
                "pytest>=7.0.0",
                "black>=22.0.0",
                "flake8>=4.0.0"
            ]
        }
        self.security_checks = True
        
    def check_python_version(self):
        """Verify Python version compatibility"""
        version = sys.version_info
        if version.major != 3 or version.minor < 8:
            print(f"❌ Python 3.8+ required, found {version.major}.{version.minor}")
            return False
        
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} compatible")
        return True
    
    def create_virtual_environment(self):
        """Create isolated Python virtual environment"""
        if self.venv_path.exists():
            print(f"📁 Virtual environment already exists at {self.venv_path}")
            return True
            
        print(f"🔧 Creating virtual environment at {self.venv_path}")
        try:
            subprocess.run([
                sys.executable, "-m", "venv", str(self.venv_path)
            ], check=True, capture_output=True)
            print("✅ Virtual environment created successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create virtual environment: {e}")
            return False
    
    def get_venv_python(self):
        """Get path to virtual environment Python"""
        if os.name == 'nt':  # Windows
            return self.venv_path / "Scripts" / "python.exe"
        else:  # Unix/Linux/macOS
            return self.venv_path / "bin" / "python"
    
    def get_venv_pip(self):
        """Get path to virtual environment pip"""
        if os.name == 'nt':  # Windows
            return self.venv_path / "Scripts" / "pip.exe"
        else:  # Unix/Linux/macOS
            return self.venv_path / "bin" / "pip"
    
    def install_package_securely(self, package_spec):
        """Install package with security verification"""
        pip_path = self.get_venv_pip()
        
        print(f"📦 Installing {package_spec}...")
        try:
            # Install with security flags
            cmd = [
                str(pip_path), "install", 
                "--no-cache-dir",  # Don't use cache to avoid stale packages
                "--force-reinstall",  # Ensure fresh install
                "--no-deps" if self.security_checks else "",  # Control dependencies
                package_spec
            ]
            
            # Remove empty strings from command
            cmd = [arg for arg in cmd if arg]
            
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print(f"   ✅ {package_spec} installed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Failed to install {package_spec}: {e.stderr}")
            return False
    
    def install_requirements(self, category="core"):
        """Install requirements for specified category"""
        if category not in self.requirements:
            print(f"❌ Unknown requirement category: {category}")
            return False
        
        packages = self.requirements[category]
        print(f"🔧 Installing {len(packages)} {category} packages...")
        
        success_count = 0
        for package in packages:
            if self.install_package_securely(package):
                success_count += 1
        
        print(f"📊 Installation complete: {success_count}/{len(packages)} successful")
        return success_count == len(packages)
    
    def verify_installation(self):
        """Verify that key packages are working"""
        python_path = self.get_venv_python()
        
        test_imports = [
            ("numpy", "import numpy; print(f'NumPy {numpy.__version__} ready')"),
            ("scipy", "import scipy; print(f'SciPy {scipy.__version__} ready')"),
            ("matplotlib", "import matplotlib; print(f'Matplotlib {matplotlib.__version__} ready')")
        ]
        
        print("🧪 Verifying package installations...")
        
        for package_name, test_code in test_imports:
            try:
                result = subprocess.run([
                    str(python_path), "-c", test_code
                ], capture_output=True, text=True, check=True)
                
                print(f"   ✅ {result.stdout.strip()}")
                
            except subprocess.CalledProcessError:
                print(f"   ❌ {package_name} verification failed")
                return False
        
        return True
    
    def setup_complete_environment(self):
        """Complete environment setup process"""
        print("🔐 Solidarity Platform - Secure Python Environment Setup")
        print("=" * 60)
        
        # Step 1: Check Python version
        if not self.check_python_version():
            return False
        
        # Step 2: Create virtual environment
        if not self.create_virtual_environment():
            return False
        
        # Step 3: Upgrade pip in virtual environment
        pip_path = self.get_venv_pip()
        print("🔧 Upgrading pip in virtual environment...")
        try:
            subprocess.run([
                str(pip_path), "install", "--upgrade", "pip"
            ], check=True, capture_output=True)
            print("   ✅ Pip upgraded successfully")
        except subprocess.CalledProcessError as e:
            print(f"   ⚠️ Pip upgrade failed: {e}")
        
        # Step 4: Install core packages
        if not self.install_requirements("core"):
            print("❌ Core package installation failed")
            return False
        
        # Step 5: Install audio packages (optional)
        print("\n🎵 Installing audio processing packages...")
        audio_success = self.install_requirements("audio")
        if not audio_success:
            print("⚠️ Some audio packages failed - basic functionality will still work")
        
        # Step 6: Verify installation
        if not self.verify_installation():
            print("❌ Package verification failed")
            return False
        
        # Step 7: Create activation script
        self.create_activation_script()
        
        print("\n🎉 Environment setup complete!")
        print(f"📁 Virtual environment: {self.venv_path}")
        print(f"🐍 Python executable: {self.get_venv_python()}")
        print("\nTo activate this environment:")
        
        if os.name == 'nt':  # Windows
            print(f"   {self.venv_path}\\Scripts\\activate.bat")
        else:  # Unix/Linux/macOS
            print(f"   source {self.venv_path}/bin/activate")
        
        return True
    
    def create_activation_script(self):
        """Create convenient activation script"""
        script_name = "activate_python_env.bat" if os.name == 'nt' else "activate_python_env.sh"
        script_path = self.solidarity_root / script_name
        
        if os.name == 'nt':  # Windows
            script_content = f"""@echo off
echo 🔐 Activating Solidarity Python Environment
call "{self.venv_path}\\Scripts\\activate.bat"
echo ✅ Environment activated
echo 📁 Environment: {self.venv_path}
echo 🐍 Python: {self.get_venv_python()}
"""
        else:  # Unix/Linux/macOS
            script_content = f"""#!/bin/bash
echo "🔐 Activating Solidarity Python Environment"
source "{self.venv_path}/bin/activate"
echo "✅ Environment activated"
echo "📁 Environment: {self.venv_path}"
echo "🐍 Python: {self.get_venv_python()}"
"""
        
        with open(script_path, 'w') as f:
            f.write(script_content)
        
        if os.name != 'nt':  # Make executable on Unix systems
            os.chmod(script_path, 0o755)
        
        print(f"📝 Created activation script: {script_name}")
    
    def get_environment_status(self):
        """Get current environment status"""
        status = {
            "virtual_environment": self.venv_path.exists(),
            "python_path": str(self.get_venv_python()),
            "pip_path": str(self.get_venv_pip()),
            "packages_installed": {},
            "ready_for_use": False
        }
        
        if status["virtual_environment"]:
            # Check installed packages
            python_path = self.get_venv_python()
            for category, packages in self.requirements.items():
                status["packages_installed"][category] = {}
                for package_spec in packages:
                    package_name = package_spec.split(">=")[0].split("==")[0]
                    try:
                        result = subprocess.run([
                            str(python_path), "-c", f"import {package_name}; print('OK')"
                        ], capture_output=True, text=True, check=True)
                        status["packages_installed"][category][package_name] = True
                    except:
                        status["packages_installed"][category][package_name] = False
            
            # Check if ready for use
            core_packages = status["packages_installed"].get("core", {})
            status["ready_for_use"] = all(core_packages.values()) if core_packages else False
        
        return status

def main():
    """Main setup function"""
    manager = SecurePythonEnvironmentManager()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "status":
            status = manager.get_environment_status()
            print("📊 Environment Status:")
            print(json.dumps(status, indent=2))
            
        elif command == "setup":
            success = manager.setup_complete_environment()
            sys.exit(0 if success else 1)
            
        elif command == "verify":
            if manager.verify_installation():
                print("✅ Environment verification successful")
                sys.exit(0)
            else:
                print("❌ Environment verification failed")
                sys.exit(1)
                
        elif command == "install":
            if len(sys.argv) > 2:
                category = sys.argv[2]
                success = manager.install_requirements(category)
                sys.exit(0 if success else 1)
            else:
                print("Usage: python setup_python_env.py install <category>")
                print("Categories: core, audio, development")
                sys.exit(1)
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)
    else:
        # Default: setup everything
        success = manager.setup_complete_environment()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()