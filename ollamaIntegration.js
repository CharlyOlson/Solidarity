// Ollama Local AI Integration for Solidarity Platform
// Free, self-contained AI processing with harmonious safety controls
// No API keys needed - runs completely local!

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Ollama default endpoint (install Ollama locally: https://ollama.ai)
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const OLLAMA_CHAT_URL = 'http://localhost:11434/api/chat';

// 🛡️ Harmonious AI Safety Thresholds (matching quantum coherence system)
const AI_SAFETY_THRESHOLDS = {
  CRITICAL_EMERGENCY: { 
    min: 0.00, max: 0.05, 
    mode: 'essential_only', 
    models: ['llama3.2:1b'], 
    maxTokens: 100,
    temperature: 0.1,
    systemPrompt: 'Respond briefly and safely.'
  },
  WARNING_LEVEL: { 
    min: 0.05, max: 0.15, 
    mode: 'conservative', 
    models: ['llama3.2:1b'], 
    maxTokens: 500,
    temperature: 0.2,
    systemPrompt: 'Provide helpful but conservative responses.'
  },
  CAUTION_RANGE: { 
    min: 0.15, max: 0.25, 
    mode: 'standard', 
    models: ['llama3.2:1b', 'llama3.2:3b'], 
    maxTokens: 1000,
    temperature: 0.3,
    systemPrompt: 'Provide standard helpful responses.'
  },
  OPTIMAL_RANGE: { 
    min: 0.25, max: 0.75, 
    mode: 'full_capability', 
    models: ['llama3.2:3b', 'llama3.1:8b', 'codellama:7b'], 
    maxTokens: 4000,
    temperature: 0.4,
    systemPrompt: 'Provide comprehensive, helpful responses with full capabilities.'
  },
  UPPER_CAUTION: { 
    min: 0.75, max: 0.85, 
    mode: 'premium_limited', 
    models: ['llama3.1:8b', 'codellama:13b'], 
    maxTokens: 2000,
    temperature: 0.3,
    systemPrompt: 'Provide advanced responses with performance monitoring.'
  },
  UPPER_WARNING: { 
    min: 0.85, max: 0.95, 
    mode: 'rate_limited', 
    models: ['llama3.2:3b'], 
    maxTokens: 1000,
    temperature: 0.2,
    systemPrompt: 'Provide responses with processing limits active.'
  },
  CRITICAL_UPPER: { 
    min: 0.95, max: 1.00, 
    mode: 'emergency_fallback', 
    models: ['llama3.2:1b'], 
    maxTokens: 200,
    temperature: 0.1,
    systemPrompt: 'Emergency mode: brief, essential responses only.'
  }
};

// Global AI safety level (harmonized with quantum coherence)
let globalAISafetyLevel = 0.618; // Golden Ratio PHI - harmonious starting point

// 🛡️ Safety Assessment Function
function assessAISafety(safetyLevel = globalAISafetyLevel) {
  for (const [thresholdName, threshold] of Object.entries(AI_SAFETY_THRESHOLDS)) {
    if (safetyLevel >= threshold.min && safetyLevel <= threshold.max) {
      return { 
        level: thresholdName, 
        ...threshold,
        currentSafetyLevel: safetyLevel
      };
    }
  }
  // Fallback to WARNING_LEVEL if no match
  return { level: 'WARNING_LEVEL', ...AI_SAFETY_THRESHOLDS.WARNING_LEVEL, currentSafetyLevel: safetyLevel };
}

// 🤖 Main Ollama Query Function with Harmonious Safety Controls
async function queryOllama(prompt, options = {}) {
  try {
    // Apply harmonious safety controls
    const safetyLevel = options.safetyLevel || globalAISafetyLevel;
    const safetyConfig = assessAISafety(safetyLevel);
    
    console.log(`🛡️ AI Safety Level: ${safetyLevel.toFixed(3)} - ${safetyConfig.level}`);
    
    // Select model based on safety level
    const selectedModel = options.model || safetyConfig.models[0];
    
    const requestData = {
      model: selectedModel,
      prompt: `${safetyConfig.systemPrompt}\n\nUser: ${prompt}`,
      stream: false,
      options: {
        temperature: Math.min(options.temperature || safetyConfig.temperature, safetyConfig.temperature),
        num_predict: Math.min(options.maxTokens || safetyConfig.maxTokens, safetyConfig.maxTokens),
        top_p: options.topP || 0.9,
        repeat_penalty: 1.1
      }
    };

    console.log(`🤖 Using model: ${selectedModel} (Safety Mode: ${safetyConfig.mode})`);
    
    const response = await axios.post(OLLAMA_API_URL, requestData, {
      timeout: options.timeout || 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      success: true,
      content: response.data.response,
      model: selectedModel,
      safetyLevel: safetyLevel,
      safetyMode: safetyConfig.mode,
      tokensUsed: response.data.eval_count || 0,
      metadata: {
        done: response.data.done,
        context: response.data.context,
        total_duration: response.data.total_duration
      }
    };

  } catch (error) {
    console.error('❌ Ollama query error:', error.message);
    
    // Emergency fallback with minimal processing
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'Ollama not running. Please install and start Ollama: https://ollama.ai',
        fallbackSuggestion: 'Install Ollama and run: ollama pull llama3.2:1b'
      };
    }
    
    return {
      success: false,
      error: error.message,
      safetyLevel: globalAISafetyLevel
    };
  }
}

// 🔄 Harmonize AI Safety with Other System Components
function harmonizeAIWithSystem(quantumCoherence, launcherSafety, solidaritySafety) {
  // Take the most conservative safety level for harmonious operation
  const minSafetyLevel = Math.min(quantumCoherence, launcherSafety, solidaritySafety);
  setAISafetyLevel(minSafetyLevel);
  
  console.log(`🔄 AI harmonized with system safety levels:`);
  console.log(`   Quantum Coherence: ${quantumCoherence.toFixed(3)}`);
  console.log(`   Launcher Safety: ${launcherSafety.toFixed(3)}`);
  console.log(`   Solidarity Safety: ${solidaritySafety.toFixed(3)}`);
  console.log(`   AI Safety (harmonized): ${globalAISafetyLevel.toFixed(3)}`);
  
  return assessAISafety();
}

// 🛡️ Set AI Safety Level
function setAISafetyLevel(newLevel) {
  globalAISafetyLevel = Math.max(0.00, Math.min(1.00, newLevel));
  const assessment = assessAISafety();
  console.log(`🛡️ AI Safety Level Set: ${globalAISafetyLevel.toFixed(3)} - ${assessment.level}`);
  return assessment;
}

// 🚨 Emergency AI Stabilization
function emergencyAIStabilization() {
  console.log('🚨 EMERGENCY AI STABILIZATION ACTIVATED');
  setAISafetyLevel(0.618); // Return to Golden Ratio stability
  return assessAISafety();
}

// 📋 Check Ollama Status
async function checkOllamaStatus() {
  try {
    const response = await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
    console.log('✅ Ollama is running');
    console.log('📦 Available models:', response.data.models?.map(m => m.name) || ['None installed']);
    return { running: true, models: response.data.models || [] };
  } catch (error) {
    console.log('❌ Ollama not running or not installed');
    console.log('💡 Install Ollama: https://ollama.ai');
    console.log('💡 Then run: ollama pull llama3.2:1b');
    return { running: false, error: error.message };
  }
}

// 🎯 Solidarity Platform Integration
async function processWithSolidarityContext(query, solidarityContext = {}) {
  const safetyConfig = assessAISafety();
  
  const contextPrompt = `
${safetyConfig.systemPrompt}

SOLIDARITY PLATFORM CONTEXT:
- Quantum Coherence Level: ${solidarityContext.quantumCoherence || 0.618}
- System Safety Mode: ${safetyConfig.level}
- Harmonic Processing: ${solidarityContext.harmonicMode || 'standard'}
- Golden Ratio Integration: Active (PHI = 1.618)

User Query: ${query}
`;

  return await queryOllama(contextPrompt, {
    safetyLevel: solidarityContext.safetyLevel || globalAISafetyLevel,
    model: solidarityContext.preferredModel
  });
}

// Export functions
module.exports = {
  queryOllama,
  checkOllamaStatus,
  processWithSolidarityContext,
  harmonizeAIWithSystem,
  setAISafetyLevel,
  emergencyAIStabilization,
  assessAISafety,
  AI_SAFETY_THRESHOLDS
};

// Demo function if run directly
async function demo() {
  console.log('🚀 Ollama Integration Demo for Solidarity Platform');
  console.log('=' * 50);
  
  // Check Ollama status
  const status = await checkOllamaStatus();
  if (!status.running) {
    console.log('Please install and start Ollama first!');
    return;
  }
  
  // Test different safety levels
  const testPrompts = [
    'Hello! How does the Solidarity Platform work?',
    'Explain quantum coherence in simple terms',
    'Help me understand harmonic mathematics'
  ];
  
  const safetyLevels = [0.03, 0.25, 0.618, 0.85, 0.97]; // Test various safety levels
  
  for (const level of safetyLevels) {
    setAISafetyLevel(level);
    console.log(`\n🛡️ Testing Safety Level: ${level}`);
    
    const result = await queryOllama(testPrompts[0]);
    if (result.success) {
      console.log(`✅ Response: ${result.content.substring(0, 100)}...`);
      console.log(`📊 Tokens: ${result.tokensUsed}, Mode: ${result.safetyMode}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  }
}

// Auto-run demo if called directly
if (require.main === module) {
  demo().catch(console.error);
}