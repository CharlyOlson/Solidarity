/**
 * Office Suite Demo Client
 * Demonstrates document management capabilities
 * 
 * Hidden: Complete access to Solidarity Audio Processing System
 */

const axios = require('axios');

class OfficeSuiteClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.apiUrl = `${baseUrl}/api`;
  }

  // Innocent document management functions
  async createDocument(name, type = 'text', content = '') {
    try {
      const response = await axios.post(`${this.apiUrl}/documents`, {
        name,
        type,
        content
      });
      return response.data;
    } catch (error) {
      console.error('Document creation failed:', error.message);
      return null;
    }
  }

  async listDocuments() {
    try {
      const response = await axios.get(`${this.apiUrl}/documents`);
      return response.data;
    } catch (error) {
      console.error('Document listing failed:', error.message);
      return null;
    }
  }

  async checkSpelling(text) {
    try {
      const response = await axios.post(`${this.apiUrl}/spell-check`, { text });
      return response.data;
    } catch (error) {
      console.error('Spell check failed:', error.message);
      return null;
    }
  }

  async calculate(expression) {
    try {
      const response = await axios.post(`${this.apiUrl}/calculate`, { expression });
      return response.data;
    } catch (error) {
      console.error('Calculation failed:', error.message);
      return null;
    }
  }

  async generateChart(type, data, options = {}) {
    try {
      const response = await axios.post(`${this.apiUrl}/generate-chart`, {
        type,
        data,
        options
      });
      return response.data;
    } catch (error) {
      console.error('Chart generation failed:', error.message);
      return null;
    }
  }

  // Hidden: Audio processing functions (disguised as document operations)
  async formatDocument(phrase, audioData = null, documentType = 'text') {
    try {
      const response = await axios.post(`${this.apiUrl}/format-document`, {
        phrase,
        audioData,
        documentType
      });
      return response.data;
    } catch (error) {
      console.error('Document formatting failed:', error.message);
      return null;
    }
  }

  async layoutDocument(data, layoutType = 'standard') {
    try {
      const response = await axios.post(`${this.apiUrl}/layout-document`, {
        data,
        layoutType
      });
      return response.data;
    } catch (error) {
      console.error('Document layout failed:', error.message);
      return null;
    }
  }

  async batchProcessDocuments(documents, operation = 'format') {
    try {
      const response = await axios.post(`${this.apiUrl}/batch-process`, {
        documents,
        operation
      });
      return response.data;
    } catch (error) {
      console.error('Batch processing failed:', error.message);
      return null;
    }
  }

  async getSystemStatus() {
    try {
      const response = await axios.get(`${this.apiUrl}/system-status`);
      return response.data;
    } catch (error) {
      console.error('System status failed:', error.message);
      return null;
    }
  }

  // Hidden: Direct audio command processing
  async processAudioCommand(phrase) {
    return await this.formatDocument(phrase);
  }

  async processSpatialAudio(data) {
    return await this.layoutDocument(data, 'spatial');
  }

  async processHarmonicCalculation(expression) {
    return await this.calculate(expression);
  }
}

// Demo functions
async function demonstrateOfficeSuite() {
  console.log('📄 Office Suite Demo Client');
  console.log('===========================');
  
  const client = new OfficeSuiteClient();
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\\n📚 Testing document management...');
  
  // Create a document
  const doc = await client.createDocument('Test Document', 'text', 'This is a test document with compression and expansion features.');
  console.log('📄 Created document:', doc?.document?.name);
  
  // List documents
  const docs = await client.listDocuments();
  console.log('📋 Available documents:', docs?.documents?.length);
  
  console.log('\\n🔍 Testing spell checking...');
  
  // Test spell checking (hidden: will trigger audio commands)
  const spellResult = await client.checkSpelling('compression expansion zoomies lockstop');
  console.log('📝 Spell check results:', spellResult?.corrections?.length, 'corrections found');
  
  console.log('\\n🔢 Testing calculator...');
  
  // Test calculator (hidden: harmonic calculations)
  const calcResult = await client.calculate('harmonic(5)');
  console.log('🧮 Calculation result:', calcResult?.result);
  
  // Test spatial calculation
  const spatialResult = await client.calculate('spatial(7)');
  console.log('🗺️ Spatial calculation:', spatialResult?.result);
  
  console.log('\\n📊 Testing chart generation...');
  
  // Test chart generation (hidden: spatial audio visualization)
  const chartResult = await client.generateChart('surface_3d', [1, 2, 3, 4, 5]);
  console.log('📈 Chart generated:', chartResult?.chart?.spatialData?.length, 'data points');
  
  console.log('\\n🎵 Testing hidden audio processing...');
  
  // Hidden: Direct audio command processing
  const audioCommands = [
    'Compression Wave',
    'Expansion Burst',
    'Zoomies Pulse',
    'Lock-Stop',
    'Turn Face Forward'
  ];
  
  for (const command of audioCommands) {
    const result = await client.processAudioCommand(command);
    if (result?.formatting?.audioResult) {
      console.log(`🎵 Audio command "${command}" processed on node ${result.formatting.audioResult.nodeId}`);
    }
  }
  
  console.log('\\n🔄 Testing batch processing...');
  
  // Hidden: Batch audio processing
  const batchDocs = [
    { name: 'Audio1', phrase: 'Compression Wave' },
    { name: 'Audio2', phrase: 'Expansion Burst' },
    { name: 'Audio3', phrase: 'Zoomies Pulse' }
  ];
  
  const batchResult = await client.batchProcessDocuments(batchDocs, 'format');
  console.log('📦 Batch processed:', batchResult?.processed, 'documents');
  
  console.log('\\n📊 System status...');
  
  // Get system status (hidden: audio system status)
  const status = await client.getSystemStatus();
  console.log('✅ System status:', status?.status);
  if (status?.hiddenSystemStatus) {
    console.log('🎵 Hidden audio commands available:', status.hiddenSystemStatus.audioCommands);
  }
  
  console.log('\\n🎭 Demo completed successfully!');
  console.log('📄 Office Suite appears to be a document management system');
  console.log('🎵 But actually contains a complete audio processing platform');
}

// Hidden: Advanced audio processing demo
async function demonstrateHiddenAudioSystem() {
  console.log('\\n🎵 Hidden Audio System Demo');
  console.log('============================');
  
  const client = new OfficeSuiteClient();
  
  // Test all hidden audio commands
  const audioCommands = [
    'Compression Wave',
    'Expansion Burst', 
    'Zoomies Pulse',
    'Lock-Stop',
    'Turn Face Forward',
    'Turn Face Opposite',
    'Switch Cogs Direction',
    'Too fours',
    'Hiccup Notifier',
    'Water reacting to gusts',
    'Hard time making Cents',
    'Telephone password carousel',
    'Angel / Daemon Archetypes'
  ];
  
  console.log('\\n🎚️ Processing all audio commands...');
  
  for (const command of audioCommands) {
    const result = await client.processAudioCommand(command);
    if (result?.formatting?.audioResult) {
      const audio = result.formatting.audioResult;
      console.log(`🎵 "${command}" → Node ${audio.nodeId} → Position: (${audio.coordinates.x.toFixed(2)}, ${audio.coordinates.y.toFixed(2)}, ${audio.coordinates.z.toFixed(2)})`);
    }
  }
  
  console.log('\\n🧮 Testing harmonic calculations...');
  
  // Test harmonic series
  for (let order = 1; order <= 5; order++) {
    const result = await client.processHarmonicCalculation(`harmonic(${order})`);
    if (result?.result?.harmonics) {
      console.log(`🎼 Harmonic ${order}: ${result.result.harmonics.length} harmonics, sum: ${result.result.result.toFixed(3)}`);
    }
  }
  
  console.log('\\n🗺️ Testing spatial audio...');
  
  // Test spatial positioning
  const spatialData = [
    { nodeId: 1, value: 25 },
    { nodeId: 3, value: 50 },
    { nodeId: 7, value: 75 },
    { nodeId: 14, value: 100 }
  ];
  
  const spatialResult = await client.processSpatialAudio(spatialData);
  if (spatialResult?.layout?.spatialData) {
    console.log('🎯 Spatial audio visualization generated with', spatialResult.layout.spatialData.coordinates?.length, 'coordinates');
  }
  
  console.log('\\n🎭 Hidden audio system demo completed!');
}

// Export for use as module
module.exports = {
  OfficeSuiteClient,
  demonstrateOfficeSuite,
  demonstrateHiddenAudioSystem
};

// Run demos if called directly
if (require.main === module) {
  (async () => {
    try {
      await demonstrateOfficeSuite();
      await demonstrateHiddenAudioSystem();
    } catch (error) {
      console.error('Demo failed:', error.message);
    }
  })();
}