/**
 * Audio Visualization System for Solidarity Platform
 * 
 * This JavaScript module provides visualization capabilities for the Solidarity Platform's
 * audio processing system. It renders real-time visualizations for various audio
 * parameters including frequency spectrum, amplitude, spatial positioning,
 * and harmonic relationships.
 * 
 * The visualizations appear to be document styling tools in the UI but actually
 * represent the underlying audio processing capabilities.
 */

// Import color utilities
const chakraColorSystem = require('../utils/chakraColorSystem');
const colorUtils = require('../utils/colorUtils');

class SolidarityVisualization {
  constructor() {
    // Audio parameters (to be set by the audio processing system)
    this.audioState = {
      frequencies: new Array(64).fill(0),
      amplitudes: new Array(32).fill(0),
      spatialPositions: [],
      harmonics: [],
      compressionSettings: {
        threshold: -24,
        ratio: 4,
        attack: 5,
        release: 50
      },
      modulationSettings: {
        rate: 1.4,
        depth: 0.6,
        waveform: 'sine'
      }
    };
    
    // Visualization state
    this.visualizationState = {
      isPlaying: false,
      selectedVisualization: 'frequency',
      renderTimestamp: 0,
      frames: 0,
      fps: 0
    };
    
    // Animation frame ID for cleanup
    this.animationFrameId = null;
  }
  
  /**
   * Initialize visualizations on the provided container
   * @param {HTMLElement} container - Container element
   */
  initialize(container) {
    this.container = container;
    
    // Create canvas elements for each visualization
    this.canvases = {
      frequency: this.createCanvas('frequency-visualization'),
      amplitude: this.createCanvas('amplitude-visualization'),
      spatial: this.createCanvas('spatial-visualization'),
      harmonic: this.createCanvas('harmonic-visualization'),
      compression: this.createCanvas('compression-visualization'),
      modulation: this.createCanvas('modulation-visualization')
    };
    
    // Initial render
    this.render();
    
    // Setup animation loop
    this.startAnimationLoop();
    
    return this;
  }
  
  /**
   * Create a canvas element
   * @param {String} className - CSS class for the canvas
   * @returns {HTMLCanvasElement} - Canvas element
   */
  createCanvas(className) {
    const canvas = document.createElement('canvas');
    canvas.className = `chakra-canvas js-${className}`;
    canvas.width = 800;
    canvas.height = 200;
    this.container.appendChild(canvas);
    return canvas;
  }
  
  /**
   * Start animation loop
   */
  startAnimationLoop() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const animate = (timestamp) => {
      // Calculate FPS
      frameCount++;
      const elapsed = timestamp - lastTime;
      
      if (elapsed >= 1000) {
        this.visualizationState.fps = Math.round(frameCount * 1000 / elapsed);
        frameCount = 0;
        lastTime = timestamp;
      }
      
      // Update visualizations
      this.updateAudioState();
      this.render();
      
      // Request next frame
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  /**
   * Stop animation loop
   */
  stopAnimationLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Update audio state with new values (to be called by audio system)
   * @param {Object} newState - New audio state values
   */
  updateAudioState(newState = null) {
    if (!newState) {
      // Generate demo values if no real audio data provided
      this.generateDemoAudioData();
      return;
    }
    
    // Update with real audio data
    Object.assign(this.audioState, newState);
  }
  
  /**
   * Generate demo audio data for visualization testing
   */
  generateDemoAudioData() {
    // Generate random frequency data (simulate audio spectrum)
    for (let i = 0; i < this.audioState.frequencies.length; i++) {
      // Create a realistic frequency distribution (higher at low frequencies)
      const baseValue = Math.pow(1 - (i / this.audioState.frequencies.length), 1.5);
      
      // Add some randomness and time-based variation
      const time = performance.now() / 1000;
      const randomness = 0.2 * Math.sin(time * 2 + i * 0.2) + 0.1 * Math.cos(time * 5 + i * 0.5);
      
      this.audioState.frequencies[i] = Math.max(0, Math.min(1, baseValue + randomness));
    }
    
    // Generate amplitude data
    for (let i = 0; i < this.audioState.amplitudes.length; i++) {
      const time = performance.now() / 1000;
      this.audioState.amplitudes[i] = 0.3 + 0.7 * Math.abs(Math.sin(time + i * 0.1));
    }
    
    // Generate spatial position data
    const time = performance.now() / 2000;
    this.audioState.spatialPositions = [];
    
    for (let i = 0; i < 5; i++) {
      const angle = time + (i * Math.PI * 2) / 5;
      const radius = 0.7 + 0.2 * Math.sin(time * 3 + i);
      
      this.audioState.spatialPositions.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        z: 0.5 + 0.5 * Math.sin(time * 2 + i)
      });
    }
    
    // Generate harmonic data
    const harmonics = [];
    const fundamental = 110; // A2 frequency in Hz
    
    for (let i = 1; i <= 8; i++) {
      // Harmonic frequencies decrease in amplitude as they increase in frequency
      const frequency = fundamental * i;
      const amplitude = 1 / i * (0.7 + 0.3 * Math.sin(time * 3 + i));
      
      harmonics.push({ frequency, amplitude });
    }
    
    this.audioState.harmonics = harmonics;
    
    // Simulate changes to compression settings
    this.audioState.compressionSettings.threshold = -24 + 10 * Math.sin(time * 0.2);
    this.audioState.compressionSettings.ratio = 3 + 2 * Math.sin(time * 0.3);
    
    // Simulate changes to modulation settings
    this.audioState.modulationSettings.rate = 1 + 0.5 * Math.sin(time * 0.25);
    this.audioState.modulationSettings.depth = 0.4 + 0.3 * Math.abs(Math.sin(time * 0.4));
  }
  
  /**
   * Render all visualizations
   */
  render() {
    this.renderFrequencyVisualization();
    this.renderAmplitudeVisualization();
    this.renderSpatialVisualization();
    this.renderHarmonicVisualization();
    this.renderCompressionVisualization();
    this.renderModulationVisualization();
    
    // Update timestamp
    this.visualizationState.renderTimestamp = performance.now();
    this.visualizationState.frames++;
  }
  
  /**
   * Render frequency visualization (spectrum analyzer)
   */
  renderFrequencyVisualization() {
    const canvas = this.canvases.frequency;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw frequency bars
    const barWidth = width / this.audioState.frequencies.length;
    
    this.audioState.frequencies.forEach((value, i) => {
      const x = i * barWidth;
      const barHeight = value * height;
      
      // Get color based on frequency
      const hue = 240 - (i / this.audioState.frequencies.length) * 240; // Blue to red
      const color = `hsl(${hue}, 100%, 50%)`;
      
      ctx.fillStyle = color;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
    });
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let y = height; y >= 0; y -= height / 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Add label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Frequency Spectrum', 10, 20);
    
    // Add FPS counter
    ctx.textAlign = 'right';
    ctx.fillText(`${this.visualizationState.fps} FPS`, width - 10, 20);
  }
  
  /**
   * Render amplitude visualization (waveform)
   */
  renderAmplitudeVisualization() {
    const canvas = this.canvases.amplitude;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fill background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw amplitude waveform
    ctx.strokeStyle = chakraColorSystem.CHAKRA_COLORS.neon.green;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const amplitudePoints = this.audioState.amplitudes;
    const pointSpacing = width / (amplitudePoints.length - 1);
    
    amplitudePoints.forEach((amp, i) => {
      const x = i * pointSpacing;
      const y = height / 2 * (1 - amp);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Add label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Amplitude Waveform', 10, 20);
  }
  
  /**
   * Render spatial visualization (3D positioning)
   */
  renderSpatialVisualization() {
    const canvas = this.canvases.spatial;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fill background
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, height / 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw circles representing the sound field
    const circles = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= circles; i++) {
      const radius = (height / 2) * (i / circles);
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw coordinate axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw spatial positions
    this.audioState.spatialPositions.forEach((pos, i) => {
      // Convert from -1,1 to canvas coordinates
      const x = width / 2 + (pos.x * width / 2);
      const y = height / 2 - (pos.y * height / 2);
      
      // Size based on z-coordinate (depth)
      const size = 5 + 10 * pos.z;
      
      // Color based on position
      const hue = (i * 60) % 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      
      // Draw position point
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Ch ${i + 1}`, x, y - size - 5);
    });
    
    // Add label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Spatial Positioning', 10, 20);
  }
  
  /**
   * Render harmonic visualization
   */
  renderHarmonicVisualization() {
    const canvas = this.canvases.harmonic;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fill background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw harmonic bars
    const harmonics = this.audioState.harmonics;
    const barWidth = width / (harmonics.length * 2);
    const spacing = width / harmonics.length;
    
    harmonics.forEach((harmonic, i) => {
      const x = i * spacing + spacing / 2 - barWidth / 2;
      const barHeight = harmonic.amplitude * height * 0.8;
      
      // Generate color based on the harmonic number
      const harmonicColor = colorUtils.frequencyToColor(harmonic.frequency);
      
      // Fill harmonic bar
      ctx.fillStyle = harmonicColor;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      // Draw harmonic number
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${i + 1}`, x + barWidth / 2, height - 5);
    });
    
    // Add label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Harmonic Distribution', 10, 20);
  }
  
  /**
   * Render compression visualization
   */
  renderCompressionVisualization() {
    const canvas = this.canvases.compression;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fill background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw compression curve
    const settings = this.audioState.compressionSettings;
    const threshold = settings.threshold;
    const ratio = settings.ratio;
    
    // Convert dB threshold to percentage (assuming range from -60dB to 0dB)
    const thresholdPercent = (threshold + 60) / 60;
    const thresholdX = thresholdPercent * width;
    
    // Draw axis
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    
    // Draw compression curve
    ctx.strokeStyle = chakraColorSystem.CHAKRA_COLORS.neon.blue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Start at bottom left
    ctx.moveTo(0, height);
    
    // Draw to threshold point (1:1 slope)
    ctx.lineTo(thresholdX, height - thresholdX);
    
    // Draw compressed section (1:ratio slope)
    const remainingX = width - thresholdX;
    const remainingY = remainingX / ratio;
    ctx.lineTo(width, height - (thresholdX + remainingY));
    
    ctx.stroke();
    
    // Draw threshold line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(thresholdX, 0);
    ctx.lineTo(thresholdX, height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Label threshold
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${threshold} dB`, thresholdX, height - 10);
    
    // Label ratio
    ctx.textAlign = 'right';
    ctx.fillText(`${ratio}:1`, width - 10, 20);
    
    // Add label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Compression Curve', 10, 20);
  }
  
  /**
   * Render modulation visualization
   */
  renderModulationVisualization() {
    const canvas = this.canvases.modulation;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fill background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    const settings = this.audioState.modulationSettings;
    const rate = settings.rate;
    const depth = settings.depth;
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw modulation wave
    ctx.strokeStyle = chakraColorSystem.CHAKRA_COLORS.neon.purple;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const time = performance.now() / 1000;
    const cycle = width;
    
    for (let x = 0; x < width; x++) {
      const phase = (x / cycle) * Math.PI * 2 * rate + time * rate;
      const y = height / 2 * (1 - depth * Math.sin(phase));
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw depth range
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.setLineDash([3, 3]);
    
    // Upper depth line
    ctx.beginPath();
    ctx.moveTo(0, height / 2 * (1 - depth));
    ctx.lineTo(width, height / 2 * (1 - depth));
    ctx.stroke();
    
    // Lower depth line
    ctx.beginPath();
    ctx.moveTo(0, height / 2 * (1 + depth));
    ctx.lineTo(width, height / 2 * (1 + depth));
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Add labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Modulation', 10, 20);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Rate: ${rate.toFixed(1)} Hz`, width - 10, 20);
    ctx.fillText(`Depth: ${(depth * 100).toFixed(0)}%`, width - 10, 40);
  }
  
  /**
   * Set selected visualization type
   * @param {String} type - Visualization type
   */
  setVisualizationType(type) {
    if (Object.keys(this.canvases).includes(type)) {
      this.visualizationState.selectedVisualization = type;
      
      // Show selected visualization, hide others
      Object.entries(this.canvases).forEach(([key, canvas]) => {
        canvas.style.display = key === type ? 'block' : 'none';
      });
    }
  }
  
  /**
   * Set play state
   * @param {Boolean} isPlaying - Whether audio is playing
   */
  setPlayState(isPlaying) {
    this.visualizationState.isPlaying = isPlaying;
    
    if (isPlaying) {
      this.startAnimationLoop();
    } else {
      this.stopAnimationLoop();
    }
  }
  
  /**
   * Clean up resources
   */
  dispose() {
    this.stopAnimationLoop();
    
    // Remove canvas elements
    Object.values(this.canvases).forEach(canvas => {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    });
    
    this.canvases = {};
  }
}

module.exports = SolidarityVisualization;