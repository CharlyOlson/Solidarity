# Workspace Synchronization Guide

This guide explains how to sync your Solidarity Platform workspace across Visual Studio Code, Microsoft accounts, and GitHub.

## Visual Studio Code Settings Sync

### Enabling Settings Sync

1. **Open VS Code Settings Sync**
   - Click the gear icon (⚙️) in the bottom left corner
   - Select "Turn on Settings Sync..."
   - Or use the command palette: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) and type "Settings Sync: Turn On"

2. **Sign in with Microsoft Account**
   Choose one of your Microsoft accounts:
   - soulson1997@gmail.com
   - soulson1997@outlook.com
   - cSOlson1997@outlook.com
   - solson0331197@gmail.com

3. **Select What to Sync**
   - ✅ Settings
   - ✅ Keyboard Shortcuts
   - ✅ Extensions
   - ✅ UI State
   - ✅ Snippets
   - ✅ Profiles (if using VS Code Profiles)

### What Gets Synced

- **Project Settings**: `.vscode/settings.json` (GitHub Copilot configuration, editor preferences)
- **Extensions**: All installed extensions including GitHub Copilot
- **Keybindings**: Custom keyboard shortcuts
- **Snippets**: Code snippets you've created
- **UI State**: Layout, panel positions, etc.

## GitHub Integration

### Connecting VS Code to GitHub

1. **Sign in to GitHub**
   - Use the command palette: `Ctrl+Shift+P` / `Cmd+Shift+P`
   - Type "GitHub: Sign in"
   - Follow the authentication prompts
   - Use your GitHub account: `CharlyOlson`

2. **Clone Repositories**
   - Use the command palette: `Git: Clone`
   - Enter repository URL or search for your repos
   - Main repository: `https://github.com/CharlyOlson/Solidarity`

3. **Push/Pull Changes**
   - Use the Source Control panel: `Ctrl+Shift+G` / `Cmd+Shift+G`
   - Commit and push changes regularly
   - Pull changes when working across multiple devices

## GitHub Copilot Setup

### Installation

1. **Install GitHub Copilot Extension**
   - Open Extensions view: `Ctrl+Shift+X` / `Cmd+Shift+X`
   - Search for "GitHub Copilot"
   - Install both:
     - GitHub Copilot
     - GitHub Copilot Chat

2. **Sign in to GitHub Copilot**
   - Click "Sign in to use GitHub Copilot" in the status bar
   - Follow authentication prompts
   - Ensure you have an active Copilot subscription

### Agent Mode Configuration

The project includes `.vscode/settings.json` with agent mode permanently enabled:

```json
{
  "github.copilot.enable": { "*": true },
  "github.copilot.editor.enableAutoCompletions": true,
  "github.copilot.chat.persistenceEnabled": true,
  "github.copilot.enableAgentIntegration": true,
  "github.copilot.agent.enabled": true
}
```

These settings ensure:
- ✅ Copilot is always active
- ✅ Auto-completions enabled
- ✅ Chat sessions persist
- ✅ Agent mode permanently enabled
- ✅ Agent integration across the workspace

## Perplexity AI Integration

### Environment Setup

1. **API Key Configuration**
   - The `.env` file contains your Perplexity API key
   - **Important**: Never commit `.env` to Git (it's in `.gitignore`)
   - Copy `.env.example` to `.env` on new machines

2. **Using Perplexity Integration**
   ```javascript
   import { queryPerplexity, PerplexityAIAgent } from './src/perplexityIntegration.js';
   
   // Query Perplexity
   const response = await queryPerplexity('Your question here');
   
   // Use AI Agent
   const agent = new PerplexityAIAgent();
   const insights = await agent.provideInsights('audio command context');
   ```

## Multi-Device Workflow

### Setting Up on a New Device

1. **Install VS Code**
   - Download from: https://code.visualstudio.com/

2. **Sign in with Microsoft Account**
   - Use the same Microsoft account as your primary device
   - Settings will automatically sync

3. **Clone Repository**
   ```bash
   git clone https://github.com/CharlyOlson/Solidarity.git
   cd Solidarity
   npm install
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your Perplexity API key to .env
   ```

5. **Verify Installation**
   ```bash
   npm test
   npm run demo
   ```

### Sync Workflow

1. **Before Starting Work**
   ```bash
   git pull origin main
   npm install  # In case dependencies changed
   ```

2. **During Work**
   - VS Code settings sync automatically
   - Commit changes regularly
   - Push to GitHub frequently

3. **After Work**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

## Troubleshooting

### Settings Not Syncing

1. Check sign-in status: Look for account icon in bottom left
2. Verify sync is enabled: Settings > Settings Sync
3. Force sync: Command palette > "Settings Sync: Sync Now"

### GitHub Copilot Not Working

1. Check subscription status: Visit https://github.com/settings/copilot
2. Reload VS Code: Command palette > "Developer: Reload Window"
3. Check extension status: Extensions view > GitHub Copilot

### Perplexity API Issues

1. Verify API key in `.env` file
2. Check API quota: Visit Perplexity account dashboard
3. Test connection:
   ```bash
   node -e "import('./src/perplexityIntegration.js').then(m => m.queryPerplexity('test'))"
   ```

## Best Practices

1. **Commit Regularly**: Push changes at least daily
2. **Use Branches**: Create feature branches for major changes
3. **Sync Before Changes**: Always pull before starting work
4. **Keep .env Local**: Never commit API keys or secrets
5. **Test After Sync**: Run tests after pulling changes

## Contact & Support

- **Architect**: Scott Charles Olson ("Charly")
- **Framework Designer**: Charles H. Dykes ("Hank")
- **Location**: Kansas, USA 66210
- **Repository**: https://github.com/CharlyOlson/Solidarity

---

© 2025 Scott Charles Olson. All rights reserved.  
TRADEMARKED BY SCOTT CHARLES OLSON
