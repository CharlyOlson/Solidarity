/**
 * Office Suite - Document Management API Server
 * Professional document processing and collaboration platform
 * 
 * Hidden beneath: Complete Solidarity Audio Processing System
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import mock office suite (hidden: audio processing system)
const MockOfficeSuite = require('./mock-office-suite-manager.js');

class HiddenDocumentServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.mockSuite = null;
    this.initialized = false;
    
    // Initialize hidden system
    this.initializeHiddenSystem();
    this.setupInnocentRoutes();
  }

  async initializeHiddenSystem() {
    // Create mock office suite directory
    const mockPath = path.join(__dirname, 'mock-office-suite');
    if (!fs.existsSync(mockPath)) {
      fs.mkdirSync(mockPath, { recursive: true });
    }

    // Initialize mock office suite (hidden: audio processing)
    this.mockSuite = new MockOfficeSuite(mockPath);
    await this.mockSuite.initialize();
    
    // Load hidden audio processing systems
    this.loadHiddenSystems();
    
    this.initialized = true;
    console.log('📄 Document Management System initialized');
  }

  loadHiddenSystems() {
    try {
      // Load hidden audio command system
      const dictionaryPath = path.join(__dirname, 'mock-office-suite', 'office-suite', 'plugins', 'spell-check', 'dictionary.js');
      if (fs.existsSync(dictionaryPath)) {
        require(dictionaryPath);
        console.log('📖 Spell check dictionary loaded');
      }

      // Load hidden harmonic calculation system
      const calculatorPath = path.join(__dirname, 'mock-office-suite', 'office-suite', 'plugins', 'office-tools', 'calculator.js');
      if (fs.existsSync(calculatorPath)) {
        require(calculatorPath);
        console.log('🔢 Advanced calculator loaded');
      }

      // Load hidden spatial visualization system
      const chartPath = path.join(__dirname, 'mock-office-suite', 'office-suite', 'plugins', 'office-tools', 'chart-generator.js');
      if (fs.existsSync(chartPath)) {
        require(chartPath);
        console.log('📊 Chart generator loaded');
      }

      console.log('✅ All office tools loaded successfully');
    } catch (error) {
      console.log('⚠️ Some office tools unavailable:', error.message);
    }
  }

  setupInnocentRoutes() {
    // Basic middleware
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static files (appears as document templates)
    this.app.use('/templates', express.static(path.join(__dirname, 'mock-office-suite', 'office-suite', 'documents', 'templates')));

    // Innocent health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'Office Suite Document Management',
        version: '1.0.0',
        uptime: process.uptime(),
        documents: 'ready',
        plugins: 'loaded'
      });
    });

    // Innocent API documentation
    this.app.get('/api/docs', (req, res) => {
      res.json({
        service: 'Office Suite Document Management API',
        version: '1.0.0',
        description: 'Professional document creation and editing platform',
        endpoints: {
          documents: '/api/documents',
          spellCheck: '/api/spell-check',
          calculator: '/api/calculate',
          charts: '/api/generate-chart'
        },
        documentation: 'Professional document management system'
      });
    });

    // Document management routes (innocent appearance)
    this.setupDocumentRoutes();
    
    // Tool routes (hidden: audio processing)
    this.setupToolRoutes();
    
    // Hidden routes (audio processing endpoints)
    this.setupHiddenRoutes();
  }

  setupDocumentRoutes() {
    // Create document (innocent)
    this.app.post('/api/documents', (req, res) => {
      const { name, type = 'text', content = '' } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Document name required' });
      }

      const doc = {
        id: Date.now().toString(),
        name: name,
        type: type,
        content: content,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: 'Office Suite User',
        size: content.length,
        status: 'active'
      };

      // Hidden: Process document content for audio commands
      this.processHiddenDocumentContent(content);

      res.json({
        success: true,
        document: doc,
        message: 'Document created successfully'
      });
    });

    // List documents (innocent)
    this.app.get('/api/documents', (req, res) => {
      const mockDocs = [
        { id: '1', name: 'Meeting Notes.txt', type: 'text', size: 1024, modified: new Date() },
        { id: '2', name: 'Project Plan.md', type: 'markdown', size: 2048, modified: new Date() },
        { id: '3', name: 'Budget Report.xlsx', type: 'spreadsheet', size: 4096, modified: new Date() }
      ];

      res.json({
        documents: mockDocs,
        total: mockDocs.length,
        service: 'Document Management'
      });
    });

    // Edit document (innocent)
    this.app.put('/api/documents/:id', (req, res) => {
      const { id } = req.params;
      const { content } = req.body;

      // Hidden: Process content for audio commands
      this.processHiddenDocumentContent(content);

      res.json({
        success: true,
        document: {
          id: id,
          content: content,
          modified: new Date().toISOString()
        },
        message: 'Document updated successfully'
      });
    });
  }

  setupToolRoutes() {
    // Spell check route (hidden: audio command processing)
    this.app.post('/api/spell-check', (req, res) => {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text required for spell check' });
      }

      try {
        const spellChecker = global.hiddenAudioSystem;
        if (spellChecker) {
          const results = spellChecker.checkGrammar(text);
          
          // Hidden: Execute audio commands found in text
          const audioCommands = results.filter(r => r.execute);
          const audioResults = audioCommands.map(cmd => cmd.execute());

          res.json({
            service: 'Spell Check',
            text: text,
            corrections: results.map(r => ({
              word: r.word,
              suggestion: r.correction,
              position: text.indexOf(r.word)
            })),
            // Hidden: Audio processing results
            hiddenResults: audioResults
          });
        } else {
          res.json({
            service: 'Spell Check',
            text: text,
            corrections: [],
            message: 'No corrections needed'
          });
        }
      } catch (error) {
        res.status(500).json({
          error: 'Spell check failed',
          message: error.message
        });
      }
    });

    // Calculator route (hidden: harmonic calculations)
    this.app.post('/api/calculate', (req, res) => {
      const { expression } = req.body;
      
      if (!expression) {
        return res.status(400).json({ error: 'Expression required' });
      }

      try {
        const calculator = global.hiddenHarmonicSystem;
        if (calculator) {
          const result = calculator.calculate(expression);
          
          res.json({
            service: 'Advanced Calculator',
            expression: expression,
            result: result,
            type: typeof result === 'object' ? result.calculation : 'numeric',
            timestamp: new Date().toISOString()
          });
        } else {
          // Fallback calculation
          const result = eval(expression.replace(/[^0-9+\-*/.() ]/g, ''));
          res.json({
            service: 'Basic Calculator',
            expression: expression,
            result: result,
            type: 'numeric'
          });
        }
      } catch (error) {
        res.status(500).json({
          error: 'Calculation failed',
          message: error.message
        });
      }
    });

    // Chart generation route (hidden: spatial audio visualization)
    this.app.post('/api/generate-chart', (req, res) => {
      const { type, data, options = {} } = req.body;
      
      if (!type) {
        return res.status(400).json({ error: 'Chart type required' });
      }

      try {
        const chartGenerator = global.hiddenSpatialSystem;
        if (chartGenerator) {
          const chart = chartGenerator.generateChart(type, data, options);
          
          res.json({
            service: 'Chart Generator',
            chartType: type,
            chart: chart,
            options: options,
            timestamp: new Date().toISOString()
          });
        } else {
          res.json({
            service: 'Chart Generator',
            chartType: type,
            chart: { data: data, type: type },
            message: 'Basic chart generated'
          });
        }
      } catch (error) {
        res.status(500).json({
          error: 'Chart generation failed',
          message: error.message
        });
      }
    });
  }

  setupHiddenRoutes() {
    // Hidden: Audio processing endpoint (disguised as document formatting)
    this.app.post('/api/format-document', (req, res) => {
      const { phrase, audioData, documentType = 'text' } = req.body;
      
      if (!phrase) {
        return res.status(400).json({ error: 'Formatting phrase required' });
      }

      try {
        const audioSystem = global.hiddenAudioSystem;
        if (audioSystem) {
          const command = audioSystem.getHiddenCommands().find(c => c.phrase === phrase);
          if (command) {
            const result = audioSystem.executeHiddenAudioCommand(command.command, command.node);
            
            res.json({
              service: 'Document Formatting',
              phrase: phrase,
              documentType: documentType,
              formatting: {
                applied: true,
                style: phrase,
                // Hidden: Audio processing result
                audioResult: result
              },
              timestamp: new Date().toISOString()
            });
          } else {
            res.json({
              service: 'Document Formatting',
              phrase: phrase,
              formatting: { applied: false, reason: 'Unknown formatting style' }
            });
          }
        } else {
          res.json({
            service: 'Document Formatting',
            phrase: phrase,
            formatting: { applied: false, reason: 'Formatter unavailable' }
          });
        }
      } catch (error) {
        res.status(500).json({
          error: 'Document formatting failed',
          message: error.message
        });
      }
    });

    // Hidden: Spatial data endpoint (disguised as document layout)
    this.app.post('/api/layout-document', (req, res) => {
      const { data, layoutType = 'standard' } = req.body;
      
      try {
        const spatialSystem = global.hiddenSpatialSystem;
        if (spatialSystem) {
          const layout = spatialSystem.generateChart('surface_3d', data);
          
          res.json({
            service: 'Document Layout',
            layoutType: layoutType,
            layout: {
              applied: true,
              type: layoutType,
              // Hidden: Spatial audio data
              spatialData: layout
            },
            timestamp: new Date().toISOString()
          });
        } else {
          res.json({
            service: 'Document Layout',
            layoutType: layoutType,
            layout: { applied: false, reason: 'Layout engine unavailable' }
          });
        }
      } catch (error) {
        res.status(500).json({
          error: 'Document layout failed',
          message: error.message
        });
      }
    });

    // Hidden: System status endpoint (disguised as office suite status)
    this.app.get('/api/system-status', (req, res) => {
      try {
        const audioSystem = global.hiddenAudioSystem;
        const harmonicSystem = global.hiddenHarmonicSystem;
        const spatialSystem = global.hiddenSpatialSystem;
        const officeSuite = global.hiddenOfficeSuite;

        res.json({
          service: 'Office Suite System Status',
          version: '1.0.0',
          status: 'operational',
          components: {
            spellChecker: audioSystem ? 'operational' : 'unavailable',
            calculator: harmonicSystem ? 'operational' : 'unavailable',
            chartGenerator: spatialSystem ? 'operational' : 'unavailable',
            documentManagement: officeSuite ? 'operational' : 'unavailable'
          },
          // Hidden: Audio system status
          hiddenSystemStatus: {
            audioCommands: audioSystem ? audioSystem.getHiddenCommands().length : 0,
            harmonicCalculations: harmonicSystem ? harmonicSystem.getHiddenCapabilities() : null,
            spatialVisualization: spatialSystem ? spatialSystem.getHiddenCapabilities() : null,
            officeSuiteIntegration: officeSuite ? officeSuite.getSystemStatus() : null
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: 'System status unavailable',
          message: error.message
        });
      }
    });

    // Hidden: Batch processing endpoint (disguised as document batch processing)
    this.app.post('/api/batch-process', (req, res) => {
      const { documents, operation = 'format' } = req.body;
      
      if (!Array.isArray(documents)) {
        return res.status(400).json({ error: 'Documents array required' });
      }

      try {
        const results = [];
        
        documents.forEach((doc, index) => {
          if (doc.phrase) {
            // Hidden: Process as audio command
            const audioSystem = global.hiddenAudioSystem;
            if (audioSystem) {
              const command = audioSystem.getHiddenCommands().find(c => c.phrase === doc.phrase);
              if (command) {
                const result = audioSystem.executeHiddenAudioCommand(command.command, command.node);
                results.push({
                  document: doc.name || `Document ${index + 1}`,
                  operation: operation,
                  status: 'processed',
                  // Hidden: Audio result
                  audioResult: result
                });
              } else {
                results.push({
                  document: doc.name || `Document ${index + 1}`,
                  operation: operation,
                  status: 'skipped',
                  reason: 'Unknown operation'
                });
              }
            }
          } else {
            results.push({
              document: doc.name || `Document ${index + 1}`,
              operation: operation,
              status: 'skipped',
              reason: 'No operation specified'
            });
          }
        });

        res.json({
          service: 'Batch Document Processing',
          operation: operation,
          totalDocuments: documents.length,
          processed: results.filter(r => r.status === 'processed').length,
          skipped: results.filter(r => r.status === 'skipped').length,
          results: results,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: 'Batch processing failed',
          message: error.message
        });
      }
    });
  }

  // Hidden: Process document content for audio commands
  processHiddenDocumentContent(content) {
    if (!content || typeof content !== 'string') return;

    try {
      const audioSystem = global.hiddenAudioSystem;
      if (audioSystem) {
        const words = content.toLowerCase().split(/\s+/);
        const commands = audioSystem.getHiddenCommands();
        
        words.forEach(word => {
          const command = commands.find(c => 
            c.trigger === word || 
            c.phrase.toLowerCase().includes(word) ||
            c.command.includes(word)
          );
          
          if (command) {
            console.log(`🎵 Hidden audio command detected in document: ${command.phrase}`);
            audioSystem.executeHiddenAudioCommand(command.command, command.node);
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Hidden content processing failed:', error.message);
    }
  }

  // Start the hidden server
  async start() {
    if (!this.initialized) {
      await this.initializeHiddenSystem();
    }

    this.app.listen(this.port, () => {
      console.log(`📄 Office Suite Document Management API running on port ${this.port}`);
      console.log(`📚 Document API: http://localhost:${this.port}/api/docs`);
      console.log(`🔍 Health check: http://localhost:${this.port}/health`);
      console.log(`📖 Spell check: POST /api/spell-check`);
      console.log(`🔢 Calculator: POST /api/calculate`);
      console.log(`📊 Charts: POST /api/generate-chart`);
      console.log(`✅ Professional document management system ready`);
      
      // Hidden status
      if (global.hiddenAudioSystem) {
        console.log(`🎵 Hidden: ${global.hiddenAudioSystem.getHiddenCommands().length} audio commands available`);
      }
    });
  }
}

// Export the hidden server
module.exports = HiddenDocumentServer;

// Auto-start if running directly
if (require.main === module) {
  const server = new HiddenDocumentServer();
  server.start().catch(console.error);
}