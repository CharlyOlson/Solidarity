/**
 * ColorSystemIntegration.js
 * 
 * This file integrates the new color palette system with the existing
 * color utilities and visualization systems in the Solidarity Platform.
 */

import { ColorPaletteProvider } from './palette/ColorPaletteContext';
import { useColorPalette } from './palette/ColorPaletteContext';
import { useColorShading } from './palette/useColorShading';

// Import existing color utilities
const colorUtils = require('./src/utils/colorUtils');
const ColorMotionVisualizer = require('./color_motion_tracking').ColorMotionVisualizer;

/**
 * Adapter class that connects the new color palette system with 
 * existing color utilities in the project
 */
class ColorSystemAdapter {
  constructor(paletteContext) {
    this.palette = paletteContext.palette;
    this.colorUtils = colorUtils;
    this.pressureResult = paletteContext.pressureResult || 0.5;
    this.stabilityScore = paletteContext.stabilityScore || 0.5;
    this.transitionRate = paletteContext.transitionRate || 0.2;
  }

  /**
   * Convert a color from the palette to the format used by existing utilities
   * @param {string} hexColor - Hex color from the palette
   * @returns {Object} Color in the format expected by existing utilities
   */
  adaptColorForExistingSystem(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Use existing utilities to get HSL
    const hsl = this.colorUtils.rgbToHsl(r, g, b);
    
    return {
      hex: hexColor,
      rgb: { r, g, b },
      hsl: hsl
    };
  }

  /**
   * Generate a harmonized color palette using both systems
   * @param {string} baseColor - Base color to build palette from
   * @returns {Object} Enhanced color palette
   */
  generateEnhancedPalette(baseColor) {
    // Use existing utility to generate harmonic palette
    const existingPalette = this.colorUtils.generateHarmonicPalette(baseColor);
    
    // Enhance with chakra-inspired gradients
    const enhancedPalette = {};
    
    Object.keys(existingPalette).forEach(key => {
      const existingColor = existingPalette[key];
      
      // Add chakra gradient effect
      const intensityFactor = Math.min(1, 
        this.pressureResult * 0.7 + 
        this.stabilityScore * 0.3
      );
      
      // Use phi for enhanced color calculations
      const phi = 1.618033988749895;
      const phiAdjust = (phi - 1) * intensityFactor;
      
      // Apply custom transformations
      enhancedPalette[key] = {
        ...existingColor,
        chakraEnhanced: true,
        intensityFactor,
        // Add transformations to original color
        enhancedHsl: {
          h: existingColor.hsl.h,
          s: Math.min(1, existingColor.hsl.s * (1 + phiAdjust * 0.3)),
          l: existingColor.hsl.l * (0.9 + this.stabilityScore * 0.2)
        },
        // Add neon accent version
        neonAccent: this.colorUtils.shiftHue(existingColor.hex, 180 * this.transitionRate)
      };
    });
    
    return enhancedPalette;
  }

  /**
   * Apply the color palette to motion tracking visualization
   * @param {Object} motionData - Motion tracking data
   * @returns {Object} Visualization configuration
   */
  applyPaletteToMotionVisualization(motionData) {
    // Create a new visualizer instance
    const visualizer = new ColorMotionVisualizer();
    
    // Get dynamic colors from palette based on motion intensity
    const motionIntensity = motionData.intensity || 0.5;
    const primaryColor = this.getPaletteColorForIntensity('primary', motionIntensity);
    const accentColor = this.getPaletteColorForIntensity('neon', motionIntensity * 1.2);
    
    // Configure visualizer with dynamic palette colors
    visualizer.configure({
      baseColor: primaryColor,
      accentColor: accentColor,
      transitionFactor: this.transitionRate,
      stabilityFactor: this.stabilityScore,
      useChakraGradients: true
    });
    
    return visualizer;
  }

  /**
   * Get a palette color based on intensity
   * @param {string} colorKey - Key from the palette
   * @param {number} intensity - Intensity value (0-1)
   * @returns {string} Hex color
   */
  getPaletteColorForIntensity(colorKey, intensity) {
    const colorSet = this.palette[colorKey];
    if (!colorSet) return '#666666';
    
    // Map intensity to shade level (0-100)
    const level = Math.round(intensity * 100);
    
    // Find closest available shade
    const shadeKeys = Object.keys(colorSet).map(k => parseInt(k));
    const closest = shadeKeys.reduce((prev, curr) => 
      Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
    );
    
    return colorSet[closest];
  }
}

/**
 * React Hook that provides the integrated color system
 * @returns {Object} Combined color utilities from both systems
 */
function useIntegratedColorSystem() {
  const paletteContext = useColorPalette();
  const { getDynamicShade, getNeonPulse } = useColorShading();
  
  // Create adapter instance
  const adapter = new ColorSystemAdapter(paletteContext);
  
  return {
    // New palette system
    palette: paletteContext.palette,
    getDynamicShade,
    getNeonPulse,
    updateSystemMetrics: paletteContext.updateSystemMetrics,
    
    // Integrated utilities
    generateEnhancedPalette: (baseColor) => adapter.generateEnhancedPalette(baseColor),
    applyPaletteToMotionVisualization: (motionData) => adapter.applyPaletteToMotionVisualization(motionData),
    
    // Original utilities (for backward compatibility)
    lerp: colorUtils.lerp,
    invertColor: colorUtils.invertColor,
    getColorIntensity: colorUtils.getColorIntensity
  };
}

module.exports = {
  ColorSystemAdapter,
  useIntegratedColorSystem,
  // Re-export core components
  ColorPaletteProvider
};