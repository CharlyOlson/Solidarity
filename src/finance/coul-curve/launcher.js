#!/usr/bin/env node

/**
 * Secure Solidarity Platform Launcher
 * Alternative to npm scripts to avoid potential security leaks
 * Direct Node.js execution without npm intermediary
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class SecureSolidarityLauncher {
    constructor() {
        this.solidarityRoot = path.resolve(__dirname);
        this.availableCommands = new Map([
            // Core system commands
            ['start', { file: 'src/api/server.js', description: 'Start Solidarity API server' }],
            ['dev', { file: 'src/api/server.js', description: 'Start in development mode', args: ['--watch', 'src'] }],
            
            // Multi-drive management
            ['drives:detect', { file: 'multi-drive-manager.js', args: ['detect'], description: 'Detect Solidarity across drives' }],
            ['drives:status', { file: 'multi-drive-manager.js', args: ['status'], description: 'Show multi-drive status' }],
            ['drives:sync', { file: 'multi-drive-manager.js', args: ['sync'], description: 'Sync files across drives' }],
            ['drives:sync:dry', { file: 'multi-drive-manager.js', args: ['sync:dry'], description: 'Preview sync actions' }],
            
            // Python environment commands (secure, no npm)
            ['python:setup', { python: true, file: 'setup_python_env.py', args: ['setup'], description: 'Setup secure Python environment' }],
            ['python:status', { python: true, file: 'setup_python_env.py', args: ['status'], description: 'Check Python environment status' }],
            ['python:verify', { python: true, file: 'setup_python_env.py', args: ['verify'], description: 'Verify Python packages' }],
            
            // Testing commands (direct node/python execution)
            ['test:audio', { python: true, file: 'test_advanced_audio.py', description: 'Test advanced audio processing' }],
            ['test:audio:quick', { python: true, file: 'test_advanced_audio.py', args: ['--quick'], description: 'Quick audio test' }],
            ['test:api', { command: 'node', args: ['--test', 'tests/api'], description: 'Test API endpoints' }],
            
            // Golden ratio and harmonic systems
            ['golden', { file: 'src/goldenHarmonicSystem.js', description: 'Run Golden Ratio Harmonic System' }],
            ['ultimate', { file: 'src/ultimateSolidaritySystem.js', description: 'Run Ultimate Solidarity System' }],
            ['correction', { file: 'src/correctedSolidaritySystem.js', description: 'Run Focused Correction System' }],
            
            // Office suite (hidden system)
            ['office', { file: 'start-office-suite.js', description: 'Start office suite' }],
            ['hidden', { file: 'demo-office-client.js', description: 'Demo hidden system' }],
            
            // Utility commands
            ['health', { file: 'scripts/healthCheck.js', description: 'System health check' }],
            ['lint', { command: 'eslint', args: ['src/', '--ext', '.js,.jsx', '--fix'], description: 'Lint code' }],
            ['clean', { custom: 'clean', description: 'Clean build artifacts' }],
            
            // Cross-repository sync
            ['sync', { file: 'scripts/syncCoulCurve.js', description: 'Sync with Coul-Curve repository' }]
        ]);
        
        this.securityChecks = {
            validatePath: true,
            checkFileExists: true,
            sandboxExecution: true,
            logExecution: true
        };
    }

    // Validate and sanitize file paths
    validatePath(filePath) {
        const resolvedPath = path.resolve(this.solidarityRoot, filePath);
        
        // Ensure path is within solidarity root
        if (!resolvedPath.startsWith(this.solidarityRoot)) {
            throw new Error(`Security: Path traversal detected: ${filePath}`);
        }
        
        // Check if file exists
        if (!fs.existsSync(resolvedPath)) {
            throw new Error(`File not found: ${resolvedPath}`);
        }
        
        return resolvedPath;
    }

    // Execute command securely
    async executeCommand(commandName, additionalArgs = []) {
        const command = this.availableCommands.get(commandName);
        
        if (!command) {
            console.error(`❌ Unknown command: ${commandName}`);
            this.showHelp();
            return false;
        }

        console.log(`🚀 Executing: ${commandName} - ${command.description}`);
        
        try {
            if (command.custom) {
                return this.executeCustomCommand(command.custom);
            }
            
            if (command.python) {
                return this.executePythonScript(command.file, additionalArgs);
            }
            
            if (command.command) {
                return this.executeSystemCommand(command.command, command.args.concat(additionalArgs));
            }
            
            // Default: execute Node.js file
            const filePath = this.validatePath(command.file);
            return this.executeNodeScript(filePath, (command.args || []).concat(additionalArgs));
            
        } catch (error) {
            console.error(`❌ Execution failed: ${error.message}`);
            return false;
        }
    }

    // Execute Node.js script
    executeNodeScript(filePath, args = []) {
        return new Promise((resolve, reject) => {
            console.log(`   📁 File: ${filePath}`);
            
            const nodeProcess = spawn('node', [filePath, ...args], {
                cwd: this.solidarityRoot,
                stdio: 'inherit',
                env: { ...process.env, NODE_ENV: 'development' }
            });

            nodeProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`   ✅ Completed successfully`);
                    resolve(true);
                } else {
                    console.error(`   ❌ Exited with code ${code}`);
                    resolve(false);
                }
            });

            nodeProcess.on('error', (error) => {
                console.error(`   ❌ Process error: ${error.message}`);
                reject(error);
            });
        });
    }

    // Execute Python script
    executePythonScript(filePath, args = []) {
        return new Promise((resolve, reject) => {
            const fullPath = this.validatePath(filePath);
            
            // Check for virtual environment first
            const venvPython = path.join(this.solidarityRoot, 'python_env', 
                process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
            
            let pythonCommand = 'python3';
            
            // Use virtual environment Python if available
            if (fs.existsSync(venvPython)) {
                pythonCommand = venvPython;
                console.log(`   🔐 Using secure virtual environment: ${venvPython}`);
            } else {
                console.log(`   🐍 Using system Python: ${pythonCommand}`);
                console.log(`   💡 Run 'node launcher.js python:setup' to create secure environment`);
            }
            
            console.log(`   📄 Python file: ${fullPath}`);
            
            const pythonProcess = spawn(pythonCommand, [fullPath, ...args], {
                cwd: this.solidarityRoot,
                stdio: 'inherit',
                env: { 
                    ...process.env, 
                    PYTHONPATH: path.join(this.solidarityRoot, 'src'),
                    SOLIDARITY_ROOT: this.solidarityRoot
                }
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`   ✅ Python script completed successfully`);
                    resolve(true);
                } else {
                    console.error(`   ❌ Python script exited with code ${code}`);
                    resolve(false);
                }
            });

            pythonProcess.on('error', (error) => {
                console.error(`   ❌ Python error: ${error.message}`);
                if (error.message.includes('ENOENT')) {
                    console.log(`   💡 Python not found. Install Python 3.8+ or run 'node launcher.js python:setup'`);
                }
                reject(error);
            });
        });
    }

    // Execute system command
    executeSystemCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            console.log(`   💻 Command: ${command} ${args.join(' ')}`);
            
            const process = spawn(command, args, {
                cwd: this.solidarityRoot,
                stdio: 'inherit'
            });

            process.on('close', (code) => {
                if (code === 0) {
                    console.log(`   ✅ Command completed`);
                    resolve(true);
                } else {
                    console.error(`   ❌ Command exited with code ${code}`);
                    resolve(false);
                }
            });

            process.on('error', (error) => {
                console.error(`   ❌ Command error: ${error.message}`);
                reject(error);
            });
        });
    }

    // Execute custom commands
    executeCustomCommand(customType) {
        switch (customType) {
            case 'clean':
                return this.cleanBuildArtifacts();
            default:
                console.error(`❌ Unknown custom command: ${customType}`);
                return false;
        }
    }

    // Clean build artifacts safely
    cleanBuildArtifacts() {
        console.log('🧹 Cleaning build artifacts...');
        
        const cleanPaths = [
            'node_modules',
            'frontend/node_modules',
            'frontend/build',
            'coverage',
            'logs'
        ];
        
        cleanPaths.forEach(cleanPath => {
            const fullPath = path.join(this.solidarityRoot, cleanPath);
            if (fs.existsSync(fullPath)) {
                console.log(`   🗑️  Removing: ${cleanPath}`);
                fs.rmSync(fullPath, { recursive: true, force: true });
            }
        });
        
        console.log('   ✅ Cleanup complete');
        return true;
    }

    // Show available commands
    showHelp() {
        console.log('\n🌟 Solidarity Platform - Secure Launcher');
        console.log('=' * 50);
        console.log('Available commands:\n');
        
        this.availableCommands.forEach((command, name) => {
            console.log(`  ${name.padEnd(15)} - ${command.description}`);
        });
        
        console.log('\nUsage:');
        console.log('  node launcher.js <command> [args...]');
        console.log('  ./launcher.js <command> [args...]');
        console.log('\nExamples:');
        console.log('  node launcher.js golden');
        console.log('  node launcher.js ultimate');
        console.log('  node launcher.js start');
        console.log('  node launcher.js test:audio');
    }

    // Main execution method
    async run() {
        const args = process.argv.slice(2);
        
        if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
            this.showHelp();
            return;
        }
        
        const commandName = args[0];
        const additionalArgs = args.slice(1);
        
        console.log(`\n🔐 Secure Solidarity Launcher`);
        console.log(`📁 Root: ${this.solidarityRoot}`);
        console.log(`🎯 Command: ${commandName}`);
        
        const success = await this.executeCommand(commandName, additionalArgs);
        
        if (success) {
            console.log(`\n🎉 Command '${commandName}' completed successfully`);
        } else {
            console.log(`\n❌ Command '${commandName}' failed`);
            process.exit(1);
        }
    }
}

// Create and run launcher if called directly
if (require.main === module) {
    const launcher = new SecureSolidarityLauncher();
    launcher.run().catch(error => {
        console.error('❌ Launcher error:', error.message);
        process.exit(1);
    });
}

module.exports = SecureSolidarityLauncher;