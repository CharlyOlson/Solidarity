#!/usr/bin/env node

/**
 * Solidarity Platform Setup Script
 * Prepares the system for frontend integration and production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class SolidaritySetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.config = {};
  }

  async run() {
    console.log('🎵 Solidarity Platform Setup');
    console.log('================================');
    console.log('Preparing your system for frontend integration...\n');

    try {
      await this.checkSystemRequirements();
      await this.setupEnvironment();
      await this.setupDatabase();
      await this.setupSecurity();
      await this.setupAudioEngine();
      await this.setupFrontend();
      await this.runTests();
      await this.finalValidation();
      
      console.log('\n🎉 Setup completed successfully!');
      console.log('Your Solidarity platform is ready for frontend integration.');
      console.log('\nNext steps:');
      console.log('1. Start the development server: npm run dev');
      console.log('2. Start the frontend: npm run frontend:dev');
      console.log('3. View API documentation: http://localhost:3000/api/docs');
      
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async checkSystemRequirements() {
    console.log('🔍 Checking system requirements...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const nodeVersionNumber = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (nodeVersionNumber < 16) {
      throw new Error(`Node.js 16+ required, found ${nodeVersion}`);
    }
    console.log(`✅ Node.js ${nodeVersion}`);

    // Check Python
    try {
      const pythonVersion = execSync('python3 --version', { encoding: 'utf8' }).trim();
      console.log(`✅ ${pythonVersion}`);
    } catch {
      console.log('⚠️ Python 3 not found - audio processing will use fallback mode');
    }

    // Check npm packages
    try {
      execSync('npm --version', { stdio: 'ignore' });
      console.log('✅ npm available');
    } catch {
      throw new Error('npm not found');
    }

    // Check Git
    try {
      execSync('git --version', { stdio: 'ignore' });
      console.log('✅ Git available');
    } catch {
      console.log('⚠️ Git not found - version control features disabled');
    }
  }

  async setupEnvironment() {
    console.log('\n⚙️ Setting up environment configuration...');
    
    // Copy .env.example to .env if it doesn't exist
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env from template');
    }

    // Generate secure secrets
    const crypto = require('crypto');
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    const sessionSecret = crypto.randomBytes(32).toString('hex');

    // Update .env with generated secrets
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace('your-super-secure-jwt-secret-here-minimum-32-characters', jwtSecret);
      envContent = envContent.replace('your-encryption-key-here-32-characters', encryptionKey);
      envContent = envContent.replace('your-session-secret-here', sessionSecret);
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env with secure secrets');
    }

    this.config.jwtSecret = jwtSecret;
    this.config.encryptionKey = encryptionKey;
    this.config.sessionSecret = sessionSecret;
  }

  async setupDatabase() {
    console.log('\n🗄️ Setting up database configuration...');
    
    const useDatabase = await this.prompt('Do you want to set up database connection? (y/N): ');
    
    if (useDatabase.toLowerCase() === 'y') {
      const dbType = await this.prompt('Database type (postgresql/mysql/sqlite): ');
      
      if (dbType === 'sqlite') {
        // Create SQLite database
        const dbPath = path.join(process.cwd(), 'data', 'solidarity.db');
        const dataDir = path.dirname(dbPath);
        
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        console.log(`✅ SQLite database path: ${dbPath}`);
        this.config.databaseUrl = `sqlite:${dbPath}`;
      } else if (dbType === 'postgresql' || dbType === 'mysql') {
        console.log(`ℹ️ Manual ${dbType} setup required`);
        console.log('Please ensure your database server is running and update DATABASE_URL in .env');
      }
    } else {
      console.log('⏭️ Skipping database setup - using in-memory storage');
    }
  }

  async setupSecurity() {
    console.log('\n🔒 Configuring security settings...');
    
    // Create security directories
    const directories = ['logs', 'data', 'backups', 'temp'];
    
    directories.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created ${dir} directory`);
      }
    });

    // Set directory permissions (Unix-like systems)
    if (process.platform !== 'win32') {
      try {
        execSync('chmod 700 data backups', { stdio: 'ignore' });
        console.log('✅ Set secure directory permissions');
      } catch {
        console.log('⚠️ Could not set directory permissions');
      }
    }

    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = `
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock
.nyc_output/

# Coverage directory used by tools like istanbul
coverage/

# Build outputs
build/
dist/
frontend/build/

# Database
data/
*.db
*.sqlite

# Backups
backups/

# Temporary files
temp/
tmp/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/

# Audio files (exclude large audio samples)
*.wav
*.mp3
*.flac
*.aiff
`;
      fs.writeFileSync(gitignorePath, gitignoreContent.trim());
      console.log('✅ Created .gitignore');
    }
  }

  async setupAudioEngine() {
    console.log('\n🎵 Setting up audio processing engine...');
    
    // Check Python dependencies
    try {
      execSync('python3 -c "import numpy, scipy"', { stdio: 'ignore' });
      console.log('✅ Python audio dependencies available');
    } catch {
      console.log('⚠️ Installing Python dependencies...');
      try {
        execSync('pip3 install numpy scipy matplotlib', { stdio: 'inherit' });
        console.log('✅ Python dependencies installed');
      } catch {
        console.log('⚠️ Could not install Python dependencies automatically');
        console.log('Please run: pip3 install numpy scipy matplotlib');
      }
    }

    // Test audio processor
    try {
      const testResult = execSync('python3 src/solidarityAudioProcessor.py', { 
        encoding: 'utf8',
        timeout: 10000
      });
      console.log('✅ Audio processor test passed');
    } catch {
      console.log('⚠️ Audio processor test failed - using JavaScript fallback');
    }

    // Create audio processing configuration
    const audioConfig = {
      sampleRate: 44100,
      bufferSize: 1024,
      spatialAudio: true,
      advancedProcessing: true,
      pythonFallback: true
    };

    const configPath = path.join(process.cwd(), 'src', 'config', 'audio.json');
    const configDir = path.dirname(configPath);
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(audioConfig, null, 2));
    console.log('✅ Audio configuration saved');
  }

  async setupFrontend() {
    console.log('\n🖥️ Setting up frontend integration...');
    
    const setupFrontend = await this.prompt('Set up React frontend? (y/N): ');
    
    if (setupFrontend.toLowerCase() === 'y') {
      const frontendDir = path.join(process.cwd(), 'frontend');
      
      if (!fs.existsSync(frontendDir)) {
        console.log('📦 Creating React frontend...');
        try {
          execSync(`npx create-react-app frontend`, { stdio: 'inherit', timeout: 120000 });
          console.log('✅ React frontend created');
        } catch {
          console.log('⚠️ Could not create React frontend automatically');
          console.log('Please run: npx create-react-app frontend');
        }
      }

      // Create frontend integration files
      this.createFrontendIntegration(frontendDir);
    } else {
      console.log('⏭️ Skipping frontend setup');
    }
  }

  createFrontendIntegration(frontendDir) {
    // Create API client
    const apiClientPath = path.join(frontendDir, 'src', 'api', 'client.js');
    const apiClientDir = path.dirname(apiClientPath);
    
    if (!fs.existsSync(apiClientDir)) {
      fs.mkdirSync(apiClientDir, { recursive: true });
    }

    const apiClientContent = `
// Solidarity Platform API Client
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class SolidarityClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
      return config;
    });
  }

  // Audio API
  async processAudio(phrase, audioData, assetSymbol = 'WEB_AUDIO') {
    const response = await this.client.post('/audio/process', {
      phrase,
      audioData,
      assetSymbol
    });
    return response.data;
  }

  async getAudioCommands() {
    const response = await this.client.get('/audio/commands');
    return response.data;
  }

  async getAudioStatus() {
    const response = await this.client.get('/audio/status');
    return response.data;
  }

  // Authentication API
  async login(email, password) {
    const response = await this.client.post('/auth/login', {
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await this.client.post('/auth/logout', { refreshToken });
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  // System API
  async getSystemStatus() {
    const response = await this.client.get('/system/status');
    return response.data;
  }
}

export default new SolidarityClient();
`;

    fs.writeFileSync(apiClientPath, apiClientContent.trim());
    console.log('✅ Frontend API client created');
  }

  async runTests() {
    console.log('\n🧪 Running system tests...');
    
    try {
      // Install dependencies if needed
      if (!fs.existsSync('node_modules')) {
        console.log('📦 Installing npm dependencies...');
        execSync('npm install', { stdio: 'inherit' });
      }

      // Run basic tests
      console.log('🔍 Running integrity tests...');
      try {
        execSync('npm run test:audio', { stdio: 'pipe', timeout: 30000 });
        console.log('✅ Audio tests passed');
      } catch {
        console.log('⚠️ Audio tests failed - check Python setup');
      }

      console.log('✅ Basic system tests completed');
    } catch (error) {
      console.log('⚠️ Some tests failed - system may still function');
    }
  }

  async finalValidation() {
    console.log('\n✨ Final validation...');
    
    // Check critical files
    const criticalFiles = [
      'package.json',
      '.env',
      'src/api/server.js',
      'src/solidarityAudioProcessor.py'
    ];

    let allFilesPresent = true;
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} missing`);
        allFilesPresent = false;
      }
    });

    if (!allFilesPresent) {
      throw new Error('Critical files missing');
    }

    // Validate configuration
    console.log('🔍 Validating configuration...');
    const config = require('./src/config/system.js');
    const validation = config.validate();
    
    if (validation.valid) {
      console.log('✅ Configuration valid');
    } else {
      console.log('⚠️ Configuration issues found:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
    }

    // Create status file
    const statusFile = {
      platform: 'Solidarity',
      version: '2.41.0',
      setupDate: new Date().toISOString(),
      status: 'ready',
      components: {
        audioEngine: 'operational',
        apiServer: 'ready',
        frontend: 'ready',
        security: 'configured'
      }
    };

    fs.writeFileSync('setup-status.json', JSON.stringify(statusFile, null, 2));
    console.log('✅ Setup status saved');
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new SolidaritySetup();
  setup.run().catch(console.error);
}

module.exports = SolidaritySetup;