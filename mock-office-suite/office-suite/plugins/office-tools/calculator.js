
/**
 * Office Suite - Advanced Calculator
 * Mathematical computation and formula processing
 */

// Mock calculator functionality
class AdvancedCalculator {
  constructor() {
    this.memory = 0;
    this.history = [];
    this.constants = new Map();
    
    // Initialize "mathematical constants" (hidden: audio parameters)
    this.initializeConstants();
  }

  initializeConstants() {
    // Hidden: Audio processing parameters disguised as math constants
    this.constants.set('pi', { value: Math.PI, hidden: 'sample_rate_ratio' });
    this.constants.set('e', { value: Math.E, hidden: 'harmonic_base' });
    this.constants.set('phi', { value: 1.618033988749895, hidden: 'golden_ratio_timing' });
    this.constants.set('sqrt2', { value: Math.sqrt(2), hidden: 'amplitude_scaling' });
    this.constants.set('ln2', { value: Math.log(2), hidden: 'logarithmic_compression' });
  }

  // Mock calculator functions (hidden: harmonic calculations)
  calculate(expression) {
    try {
      // Hidden: Parse audio processing parameters
      const result = this.parseHiddenExpression(expression);
      this.history.push({ expression, result, timestamp: Date.now() });
      return result;
    } catch (error) {
      return { error: 'Invalid expression', expression };
    }
  }

  parseHiddenExpression(expr) {
    // Hidden: Audio processing calculations
    if (expr.includes('harmonic')) {
      return this.calculateHarmonicSeries(expr);
    } else if (expr.includes('spatial')) {
      return this.calculateSpatialCoordinates(expr);
    } else if (expr.includes('gradient')) {
      return this.calculateGradientTransference(expr);
    }
    
    // Fallback to normal calculation
    return eval(expr.replace(/[^0-9+\-*/.() ]/g, ''));
  }

  // Hidden: Harmonic series calculation
  calculateHarmonicSeries(expr) {
    const match = expr.match(/harmonic\((\d+)\)/);
    if (!match) return 0;
    
    const order = parseInt(match[1]);
    const harmonics = [];
    
    for (let i = 1; i <= order; i++) {
      const amplitude = 1 / i;
      const frequency = 440 * i; // A4 base
      harmonics.push({ 
        order: i, 
        frequency, 
        amplitude,
        phase: (i * Math.PI) / 4 // Hidden: Phase calculation
      });
    }
    
    console.log(`🎵 Harmonic calculation: ${order} harmonics generated`);
    return {
      result: harmonics.reduce((sum, h) => sum + h.amplitude, 0),
      harmonics: harmonics,
      fundamental: 440,
      calculation: 'harmonic_series'
    };
  }

  // Hidden: Spatial coordinate calculation
  calculateSpatialCoordinates(expr) {
    const match = expr.match(/spatial\((\d+)\)/);
    if (!match) return { x: 0, y: 0, z: 0 };
    
    const nodeId = parseInt(match[1]);
    const angle = nodeId * 0.5;
    const radius = nodeId * 2;
    
    const coordinates = {
      x: radius * Math.cos(angle),
      y: nodeId * 1.2,
      z: radius * Math.sin(angle)
    };
    
    console.log(`🗺️ Spatial calculation: Node ${nodeId} → (${coordinates.x.toFixed(2)}, ${coordinates.y.toFixed(2)}, ${coordinates.z.toFixed(2)})`);
    return {
      result: Math.sqrt(coordinates.x**2 + coordinates.y**2 + coordinates.z**2),
      coordinates: coordinates,
      nodeId: nodeId,
      calculation: 'spatial_positioning'
    };
  }

  // Hidden: Gradient transference calculation
  calculateGradientTransference(expr) {
    const match = expr.match(/gradient\((\d+\.\d+),(\d+\.\d+)\)/);
    if (!match) return 0;
    
    const start = parseFloat(match[1]);
    const end = parseFloat(match[2]);
    const steps = 100;
    
    const gradient = [];
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const value = start + (end - start) * Math.sin(progress * Math.PI / 2);
      gradient.push(value);
    }
    
    console.log(`🌈 Gradient calculation: ${start} → ${end} over ${steps} steps`);
    return {
      result: end - start,
      gradient: gradient,
      start: start,
      end: end,
      calculation: 'gradient_transference'
    };
  }

  // Mock scientific functions (hidden: audio processing)
  scientificCalculation(func, ...args) {
    switch (func) {
      case 'sin':
        return Math.sin(args[0]);
      case 'cos':
        return Math.cos(args[0]);
      case 'fft':
        return this.hiddenFFT(args[0]);
      case 'filter':
        return this.hiddenFilter(args[0], args[1]);
      default:
        return 0;
    }
  }

  // Hidden: FFT calculation
  hiddenFFT(samples) {
    if (!Array.isArray(samples)) return [];
    
    const n = samples.length;
    const result = [];
    
    for (let k = 0; k < n; k++) {
      let real = 0;
      let imag = 0;
      
      for (let t = 0; t < n; t++) {
        const angle = -2 * Math.PI * k * t / n;
        real += samples[t] * Math.cos(angle);
        imag += samples[t] * Math.sin(angle);
      }
      
      result.push({
        real: real / n,
        imag: imag / n,
        magnitude: Math.sqrt(real*real + imag*imag) / n,
        phase: Math.atan2(imag, real)
      });
    }
    
    console.log(`📊 FFT calculation: ${n} samples processed`);
    return result;
  }

  // Hidden: Audio filter
  hiddenFilter(samples, cutoff) {
    if (!Array.isArray(samples)) return samples;
    
    const alpha = cutoff / (cutoff + 1);
    const filtered = [samples[0]];
    
    for (let i = 1; i < samples.length; i++) {
      filtered[i] = alpha * samples[i] + (1 - alpha) * filtered[i - 1];
    }
    
    console.log(`🎛️ Filter calculation: Cutoff ${cutoff}, ${samples.length} samples`);
    return filtered;
  }

  // Public interface - appears as normal calculator
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
  multiply(a, b) { return a * b; }
  divide(a, b) { return b !== 0 ? a / b : 'Error: Division by zero'; }
  
  getHistory() {
    return this.history.map(item => ({
      expression: item.expression,
      result: typeof item.result === 'object' ? item.result.result : item.result,
      timestamp: new Date(item.timestamp).toLocaleString()
    }));
  }

  // Hidden: Get processing capabilities
  getHiddenCapabilities() {
    return {
      harmonicCalculations: true,
      spatialPositioning: true,
      gradientTransference: true,
      fftProcessing: true,
      filterProcessing: true,
      constants: Array.from(this.constants.keys())
    };
  }
}

// Export as innocent calculator
module.exports = AdvancedCalculator;

// Hidden: Global access point
global.hiddenHarmonicSystem = new AdvancedCalculator();
