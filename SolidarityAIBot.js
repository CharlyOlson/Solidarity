/**
 * SolidarityAIBot.js - Fully integrated AI assistant for the Solidarity platform
 * Combines harmonic mathematics, golden ratio analysis, and external LLM integration
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Load core Solidarity components with graceful fallbacks
let GoldenRatioMath = null;
let MirrorNumberSystem = null;
let parseHarmonicPhrase = null;
let perplexity = null;

try {
  const goldenHarmonicSystem = require('./core/goldenHarmonicSystem');
  GoldenRatioMath = goldenHarmonicSystem.GoldenRatioMath;
  MirrorNumberSystem = goldenHarmonicSystem.MirrorNumberSystem;
} catch (e) {
  console.log("Golden Harmonic System not available - using fallback implementation");
  // Simple fallback implementation
  GoldenRatioMath = class {
    constructor() {
      this.PHI = 1.618033988749895;
      this.PHI_RECIPROCAL = 0.6180339887498948;
      this.GOLDEN_ANGLE = 2.399963229728653;
    }
  };
  MirrorNumberSystem = class {};
}

try {
  const phraseParser = require('./EnhancedHarmonicPhraseParser');
  parseHarmonicPhrase = phraseParser.parseHarmonicPhrase;
} catch (e) {
  console.log("ZIP phrase system not available - phrase matching disabled");
  parseHarmonicPhrase = () => ({ matched: false });
}

try {
  perplexity = require('./perplexityIntegration');
} catch (e) {
  console.log("Perplexity integration not available - using mock API");
  // Mock implementation
  perplexity = {
    queryPerplexity: async (input, options) => ({ 
      content: `[Mock response] Processing: "${input}"`, 
      modelUsed: "mock-model" 
    }),
    queryPerplexityHarmonic: async (input, options) => ({ 
      content: `[Mock harmonic response] Processing: "${input}"`, 
      modelUsed: "mock-model-harmonic" 
    })
  };
}

// Optional components with graceful fallbacks
let HarmonicFormatter = null;
let HarmonicCache = null;
try {
  HarmonicFormatter = require('./ai/HarmonicAIInputFormatter');
  HarmonicCache = require('./ai/HarmonicCache');
} catch (_) {
  console.log("Harmonic AI components not available - operating in basic mode");
}

class SolidarityAIBot {
  constructor(options = {}) {
    this.options = {
      cacheEnabled: true,
      adaptiveMode: true,
      debugLevel: 1,
      defaultTemperature: 0.25,
      ...options
    };
    
    this.goldenMath = new GoldenRatioMath();
    this.mirrorSystem = new MirrorNumberSystem();
    
    // Track conversation history for context
    this.conversationHistory = [];
    
    // Initialize cache
    this.initCache();
    
    // Log initialization with φ timestamp
    const now = Date.now();
    const phiTimestamp = now * this.goldenMath.PHI;
    this.log(`SolidarityAIBot initialized at ${now} (φ: ${phiTimestamp})`, 1);
  }
  
  initCache() {
    this.cache = {
      enabled: this.options.cacheEnabled && !!HarmonicCache,
      metrics: {
        hits: 0,
        misses: 0,
        lastAccess: null
      }
    };
  }
  
  log(message, level = 2) {
    if (level <= this.options.debugLevel) {
      console.log(`[SolidarityAIBot] ${message}`);
    }
  }
  
  /**
   * Process user input through harmonic systems
   * @param {string} userInput - Raw user input
   * @returns {Promise<object>} - Processed response with harmonics
   */
  async processInput(userInput) {
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user', 
      content: userInput,
      timestamp: Date.now()
    });
    
    // Check for ZIP phrases first
    try {
      const zipResult = parseHarmonicPhrase(userInput);
      if (zipResult && zipResult.matched) {
        return this.handleHarmonicPhraseResult(zipResult);
      }
    } catch (e) {
      this.log(`ZIP phrase parsing error: ${e.message}`, 2);
    }
    
    // Apply golden ratio mathematics
    const goldFeatures = this.computeGoldenFeatures(userInput);
    
    // Choose proper mode based on input characteristics
    const useHarmonic = this.shouldUseHarmonicMode(userInput, goldFeatures);
    
    // Process through appropriate mode
    const result = useHarmonic
      ? await this.processHarmonicMode(userInput, goldFeatures)
      : await this.processStandardMode(userInput);
    
    // Add to conversation history
    this.conversationHistory.push({
      role: 'assistant',
      content: typeof result === 'string' ? result : result.content,
      timestamp: Date.now(),
      features: goldFeatures
    });
    
    return result;
  }
  
  /**
   * Computes golden ratio mathematical features from input
   */
  computeGoldenFeatures(text) {
    const features = {
      length: text.length,
      goldenLength: Math.round(text.length / this.goldenMath.PHI),
      words: text.split(/\s+/).filter(Boolean)
    };
    
    features.wordCount = features.words.length;
    features.goldenWordIndex = Math.round(features.wordCount * this.goldenMath.PHI_RECIPROCAL);
    
    // Check for mirror patterns (palindromes)
    features.mirrorPattern = this.checkForMirrorPatterns(text);
    
    // More advanced features when HarmonicFormatter is available
    if (HarmonicFormatter) {
      try {
        const harmonicFeatures = HarmonicFormatter.computeInputFeatures(text);
        return { ...features, ...harmonicFeatures };
      } catch (e) {
        this.log(`Error computing harmonic features: ${e.message}`, 2);
      }
    }
    
    return features;
  }
  
  /**
   * Check for mirror patterns (palindromes) in the text
   * Implements the functionality that should be in mirrorSystem.findMirrorPatterns
   */
  checkForMirrorPatterns(text) {
    // Look for palindromic numbers in the text
    const numberRegex = /\b\d+\b/g;
    const numbers = text.match(numberRegex) || [];
    
    const palindromeNumbers = numbers.filter(num => {
      return num === num.split('').reverse().join('');
    });
    
    // Look for palindromic words (3+ letters)
    const wordRegex = /\b[a-z]{3,}\b/gi;
    const words = text.match(wordRegex) || [];
    
    const palindromeWords = words.filter(word => {
      const normalized = word.toLowerCase();
      return normalized === normalized.split('').reverse().join('');
    });
    
    // Check for near-palindromes (one character off)
    const nearPalindromes = words.filter(word => {
      const normalized = word.toLowerCase();
      if (normalized.length < 4) return false;
      
      let differences = 0;
      for (let i = 0; i < Math.floor(normalized.length / 2); i++) {
        if (normalized[i] !== normalized[normalized.length - 1 - i]) {
          differences++;
        }
      }
      return differences === 1;
    });
    
    return {
      palindromeNumbers,
      palindromeWords,
      nearPalindromes,
      strength: (palindromeNumbers.length * 0.3 + palindromeWords.length * 0.5 + nearPalindromes.length * 0.2) / 
                Math.max(1, Math.log(text.length))
    };
  }
  
  /**
   * Determines whether to use harmonic mode based on input characteristics
   */
  shouldUseHarmonicMode(input, features) {
    // Use harmonic mode if:
    // 1. Input has certain characteristics aligned with golden ratio
    // 2. HarmonicFormatter is available
    // 3. Adaptive mode is enabled
    
    if (!HarmonicFormatter || !this.options.adaptiveMode) {
      return !!HarmonicFormatter;
    }
    
    // Check for math or structural indicators
    const hasMathTerms = /(\bphi\b|golden ratio|fibonacci|harmonic|resonan(t|ce)|synchron|mirror number)/i.test(input);
    const hasComplexStructure = features.wordCount > 15 || input.includes('\n');
    const hasQuestionStructure = /^(what|how|why|when|where|who|explain|analyze|describe)/i.test(input);
    
    // Check for mirror patterns
    const hasMirrorPattern = features.mirrorPattern && 
                            (features.mirrorPattern.palindromeNumbers.length > 0 || 
                             features.mirrorPattern.palindromeWords.length > 0 ||
                             features.mirrorPattern.strength > 0.4);
    
    return hasMathTerms || hasComplexStructure || hasQuestionStructure || hasMirrorPattern;
  }
  
  /**
   * Process input using standard (non-harmonic) mode
   */
  async processStandardMode(input) {
    try {
      this.log('Using standard processing mode', 1);
      const result = await perplexity.queryPerplexity(input, {
        temperature: this.options.defaultTemperature
      });
      return result;
    } catch (error) {
      this.log(`Standard mode error: ${error.message}`, 1);
      return {
        error: true,
        message: `I encountered an error processing your request: ${error.message}`,
        content: "I'm sorry, I couldn't process your request due to an error. Please try again or rephrase your question."
      };
    }
  }
  
  /**
   * Process input using harmonic mode with enhanced features
   */
  async processHarmonicMode(input, goldFeatures) {
    try {
      this.log('Using harmonic processing mode', 1);
      
      // Add context from conversation history
      const contextualPrompt = this.enrichPromptWithContext(input);
      
      const result = await perplexity.queryPerplexityHarmonic(contextualPrompt, {
        harmonic: true,
        // Pass any relevant options from instance config
        temperature: this.options.defaultTemperature
      });
      
      // Add harmonic features to result metadata
      return {
        ...result,
        goldFeatures,
        harmonicMode: true
      };
    } catch (error) {
      this.log(`Harmonic mode error: ${error.message}`, 1);
      // Fallback to standard mode if harmonic fails
      this.log('Falling back to standard mode', 1);
      return this.processStandardMode(input);
    }
  }
  
  /**
   * Enrich user prompt with conversation context
   */
  enrichPromptWithContext(prompt) {
    // If conversation is too short, just return original prompt
    if (this.conversationHistory.length < 3) {
      return prompt;
    }
    
    // Get last 3 exchanges (6 messages or fewer)
    const recentHistory = this.conversationHistory.slice(-6);
    
    // Format context
    const contextMessages = recentHistory.map(msg => 
      `${msg.role === 'user' ? 'Human' : 'AI'}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`
    ).join('\n');
    
    // Combine with prompt
    return `Context from previous conversation:\n${contextMessages}\n\nCurrent query: ${prompt}`;
  }
  
  /**
   * Handle special ZIP phrase results
   */
  handleHarmonicPhraseResult(zipResult) {
    this.log(`Handled ZIP phrase: ${zipResult.phrase}`, 1);
    return {
      content: zipResult.response,
      zipPhraseMatched: zipResult.phrase,
      zipNode: zipResult.node,
      harmonicMode: true
    };
  }
  
  /**
   * Generate status report on bot's internal state
   */
  generateStatusReport() {
    const cacheStats = this.cache.enabled ? {
      cacheHits: this.cache.metrics.hits,
      cacheMisses: this.cache.metrics.misses,
      hitRatio: this.cache.metrics.hits + this.cache.metrics.misses > 0 
        ? (this.cache.metrics.hits / (this.cache.metrics.hits + this.cache.metrics.misses)).toFixed(2)
        : 'N/A',
      lastCacheAccess: this.cache.metrics.lastAccess
    } : { cacheEnabled: false };
    
    return {
      status: 'active',
      version: '1.0.0',
      conversationLength: this.conversationHistory.length,
      harmonic: {
        formatterAvailable: !!HarmonicFormatter,
        cacheAvailable: !!HarmonicCache
      },
      cache: cacheStats,
      goldenRatio: this.goldenMath.PHI,
      timestamp: Date.now()
    };
  }
  
  /**
   * Reset conversation history
   */
  resetConversation() {
    this.conversationHistory = [];
    return { status: 'conversation_reset', timestamp: Date.now() };
  }
}

// Example CLI usage when run directly
if (require.main === module) {
  const readline = require('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('=== SolidarityAIBot Interactive Mode ===');
  console.log('Type your message or /quit to exit');
  
  const bot = new SolidarityAIBot({ debugLevel: 2 });
  
  // Display status on start
  console.log('\nBot Status:', JSON.stringify(bot.generateStatusReport(), null, 2));
  
  function promptUser() {
    rl.question('\nYou: ', async (input) => {
      if (input.toLowerCase() === '/quit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }
      
      if (input.toLowerCase() === '/status') {
        console.log('\nBot Status:', JSON.stringify(bot.generateStatusReport(), null, 2));
        promptUser();
        return;
      }
      
      if (input.toLowerCase() === '/reset') {
        bot.resetConversation();
        console.log('Conversation history reset.');
        promptUser();
        return;
      }
      
      try {
        console.log('\nProcessing...');
        const response = await bot.processInput(input);
        console.log('\nSolidarityAI:', typeof response === 'string' ? response : response.content);
        
        // Show additional info in debug mode
        if (bot.options.debugLevel > 1 && typeof response !== 'string') {
          console.log('\nDebug metadata:', JSON.stringify({
            model: response.modelUsed,
            mode: response.harmonicMode ? 'harmonic' : 'standard',
            cached: !!response.cached
          }, null, 2));
        }
      } catch (error) {
        console.error('\nError:', error.message);
      }
      
      promptUser();
    });
  }
  
  promptUser();
}

module.exports = SolidarityAIBot;