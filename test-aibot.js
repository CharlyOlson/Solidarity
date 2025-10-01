/**
 * test-aibot.js - Test script for SolidarityAIBot
 * Tests all main components and features in sequence
 */

const SolidarityAIBot = require('./SolidarityAIBot');

// Configure bot with maximum debug level for detailed output
const bot = new SolidarityAIBot({
  debugLevel: 3,
  defaultTemperature: 0.2
});

// Test prompts covering different use cases
const TEST_PROMPTS = [
  // Standard prompt
  "What is the current weather?",
  
  // Math/harmonic related
  "Explain how the golden ratio relates to harmonic resonance in audio systems.",
  
  // Longer, more complex prompt
  "I'm working on a system that integrates multiple audio streams and processes them through a series of filters. How can I ensure synchronization across all channels while maintaining phase coherence?",
  
  // Direct question structure
  "How does the ZIP phrase system work?",
  
  // Test with mirror patterns
  "12321 is a palindrome number. How do palindromes relate to harmonic structures?"
];

// Flag to switch between interactive and auto-test mode
const INTERACTIVE_MODE = process.argv.includes('--interactive');
const DRY_RUN = process.argv.includes('--dry-run');

async function runTests() {
  console.log('=== SolidarityAIBot Test Suite ===\n');
  
  // First, display bot status
  console.log('Initial Bot Status:');
  console.log(JSON.stringify(bot.generateStatusReport(), null, 2));
  console.log('\n----------------------------------------\n');
  
  if (DRY_RUN) {
    console.log('DRY RUN MODE - No API calls will be made\n');
  }
  
  if (INTERACTIVE_MODE) {
    await runInteractiveTest();
  } else {
    await runAutomatedTests();
  }
  
  // Final status check
  console.log('\n----------------------------------------\n');
  console.log('Final Bot Status:');
  console.log(JSON.stringify(bot.generateStatusReport(), null, 2));
  console.log('\nTest suite complete.');
}

async function runAutomatedTests() {
  console.log('Running automated tests with predefined prompts...\n');
  
  // Process each test prompt
  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const prompt = TEST_PROMPTS[i];
    console.log(`\nTest ${i+1}/${TEST_PROMPTS.length}: "${prompt}"\n`);
    
    if (DRY_RUN) {
      // In dry-run mode, just show the computation without API calls
      const features = bot.computeGoldenFeatures(prompt);
      const useHarmonic = bot.shouldUseHarmonicMode(prompt, features);
      console.log(`Features: ${JSON.stringify(features, null, 2)}`);
      console.log(`Would use ${useHarmonic ? 'HARMONIC' : 'STANDARD'} mode.`);
      continue;
    }
    
    try {
      console.log('Processing...');
      const startTime = Date.now();
      const response = await bot.processInput(prompt);
      const elapsed = Date.now() - startTime;
      
      console.log(`[${elapsed}ms] Response received:`);
      console.log('\nSolidarityAI:', typeof response === 'string' ? response : response.content);
      
      // Show response metadata
      if (typeof response !== 'string') {
        console.log('\nResponse metadata:', JSON.stringify({
          modelUsed: response.modelUsed,
          mode: response.harmonicMode ? 'harmonic' : 'standard',
          cached: !!response.cached,
        }, null, 2));
      }
    } catch (error) {
      console.error(`\nERROR: ${error.message}`);
      if (error.cause) {
        console.error('Underlying error:', error.cause);
      }
    }
    
    // Short delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function runInteractiveTest() {
  const readline = require('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('Interactive test mode.');
  console.log('Type your message, /status for bot status, or /quit to exit.');
  
  function promptUser() {
    rl.question('\nYou: ', async (input) => {
      if (input.toLowerCase() === '/quit') {
        console.log('Exiting test...');
        rl.close();
        return;
      }
      
      if (input.toLowerCase() === '/status') {
        console.log('\nBot Status:', JSON.stringify(bot.generateStatusReport(), null, 2));
        promptUser();
        return;
      }
      
      if (DRY_RUN) {
        const features = bot.computeGoldenFeatures(input);
        const useHarmonic = bot.shouldUseHarmonicMode(input, features);
        console.log(`Features: ${JSON.stringify(features, null, 2)}`);
        console.log(`Would use ${useHarmonic ? 'HARMONIC' : 'STANDARD'} mode.`);
        promptUser();
        return;
      }
      
      try {
        console.log('\nProcessing...');
        const startTime = Date.now();
        const response = await bot.processInput(input);
        const elapsed = Date.now() - startTime;
        
        console.log(`[${elapsed}ms] Response received:`);
        console.log('\nSolidarityAI:', typeof response === 'string' ? response : response.content);
        
        if (typeof response !== 'string') {
          console.log('\nResponse metadata:', JSON.stringify({
            modelUsed: response.modelUsed,
            mode: response.harmonicMode ? 'harmonic' : 'standard',
            cached: !!response.cached
          }, null, 2));
        }
      } catch (error) {
        console.error('\nError:', error.message);
        if (error.cause) {
          console.error('Underlying error:', error.cause);
        }
      }
      
      promptUser();
    });
  }
  
  promptUser();
}

// Start the tests
runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});