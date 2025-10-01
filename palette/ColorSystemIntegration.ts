/**
 * Color System Integration
 * 
 * This file bridges the new color palette system with the existing color utilities
 * in the Solidarity Platform, providing backward compatibility and enhanced functionality.
 */

import React, { useEffect, useMemo } from 'react';
import { useColorPalette, useColorShading } from './ColorPaletteSystemWithTypes';
import { IntegratedColorSystemResult, SystemMetricsData } from './types';

// Import existing color utilities
const colorUtils = require('../src/utils/colorUtils');
const colorMotionTracker = require('../color_motion_tracking');

// Destructure required functions for TypeScript type safety
const { 
  lerp: adjustColorLuminance,
  invertColor: getComplimentaryColor,
  hslToHex: convertToHSL
} = colorUtils;

const {
  ColorMotionVisualizer
} = colorMotionTracker;

// Calculate contrast ratio function (not in colorUtils, defining here)
const calculateContrastRatio = (foreground: string, background: string): number => {
  // Simple luminance calculation
  const getLuminance = (color: string): number => {
    const hex = color.startsWith('#') ? color.slice(1) : color;
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const luminance1 = getLuminance(foreground);
  const luminance2 = getLuminance(background);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// Define missing functions
const trackColorMotion = (colorData: any, motionVector: [number, number]): any => {
  // Create a visualizer instance to use its methods
  const visualizer = new ColorMotionVisualizer();
  
  // Process the data
  return {
    ...colorData,
    velocityMagnitude: Math.sqrt(motionVector[0]**2 + motionVector[1]**2),
    direction: Math.atan2(motionVector[1], motionVector[0]),
    color: colorUtils.getColorIntensity(colorData.intensity || 0.5).fill
  };
};

const applyColorGradient = (
  baseColor: string, 
  accentColor: string, 
  direction: string = 'to right',
  stability: number = 0.5
): string => {
  // Create gradient with specified direction
  return `linear-gradient(${direction}, ${baseColor}, ${accentColor})`;
};

/**
 * Adapter class that provides compatibility between the new color system
 * and existing color utilities in the Solidarity Platform.
 */
export class ColorSystemAdapter {
  private colorPalette: any;
  private metrics: SystemMetricsData;
  
  /**
   * Initialize the adapter with the current palette and metrics
   */
  constructor(palette: any, metrics: SystemMetricsData) {
    this.colorPalette = palette;
    this.metrics = metrics;
  }
  
  /**
   * Convert a legacy color to the new palette system
   */
  convertLegacyColor(color: string, targetCategory: string = 'primary'): string {
    // Extract HSL values from legacy color
    const hsl = convertToHSL(color);
    
    // Use luminance to determine shade level
    const luminance = hsl[2]; // 0-100
    const shadeLevel = Math.round(luminance / 10) * 10;
    
    // Return the closest matching color from the new palette
    return this.colorPalette[targetCategory][shadeLevel] || 
      this.colorPalette[targetCategory][50]; // Default to middle shade
  }
  
  /**
   * Apply the golden ratio to color transitions
   * for a more harmonically pleasing result
   */
  applyHarmonicTransition(color: string, intensity: number): string {
    const phi = 1.618033988749895; // Golden ratio
    const adjustedIntensity = Math.sin(intensity * Math.PI / 2) * (1 / phi);
    
    // Use colorUtils.lerp instead of adjustColorLuminance
    const white = '#FFFFFF';
    const black = '#000000';
    
    if (adjustedIntensity >= 0) {
      // Lighten: blend with white
      return colorUtils.lerp(color, white, adjustedIntensity);
    } else {
      // Darken: blend with black
      return colorUtils.lerp(color, black, -adjustedIntensity);
    }
  }
  
  /**
   * Track color motion and apply the new color system's metrics
   */
  trackWithEnhancedMetrics(colorData: any, motionVector: [number, number]): any {
    // Use existing tracking functionality
    const trackedData = trackColorMotion(colorData, motionVector);
    
    // Enhance with system metrics
    trackedData.stabilityFactor = this.metrics.stability;
    trackedData.pressureValue = this.metrics.pressure;
    trackedData.transitionSpeed = this.metrics.transition;
    
    // Calculate harmonic alignment using the golden ratio
    const phi = 1.618033988749895;
    trackedData.harmonicAlignment = (trackedData.velocityMagnitude * phi) % 1;
    
    return trackedData;
  }
  
  /**
   * Generate an enhanced gradient that combines both systems
   */
  generateEnhancedGradient(baseColor: string, direction: string = 'to right'): string {
    // Get neon highlight from new system
    const neonHighlight = this.colorPalette.neon[70];
    
    // Apply existing gradient function with enhanced colors
    return applyColorGradient(
      baseColor, 
      this.applyHarmonicTransition(neonHighlight, this.metrics.pressure),
      direction,
      this.metrics.stability
    );
  }
  
  /**
   * Calculate contrast ratio and ensure accessibility
   */
  getAccessibleColor(foreground: string, background: string, minRatio: number = 4.5): string {
    const ratio = calculateContrastRatio(foreground, background);
    
    if (ratio >= minRatio) {
      return foreground;
    }
    
    // Adjust color until it meets the required contrast ratio
    let adjustedColor = foreground;
    let adjustmentStep = 0.1;
    let iterations = 0;
    const maxIterations = 10;
    
    while (calculateContrastRatio(adjustedColor, background) < minRatio && iterations < maxIterations) {
      // Make color lighter or darker based on background
      const hsl = convertToHSL(background);
      const backgroundLuminance = hsl[2];
      
      if (backgroundLuminance > 50) {
        // Dark text on light background
        adjustedColor = adjustColorLuminance(adjustedColor, -adjustmentStep);
      } else {
        // Light text on dark background
        adjustedColor = adjustColorLuminance(adjustedColor, adjustmentStep);
      }
      
      iterations++;
    }
    
    return adjustedColor;
  }
}

/**
 * Custom hook that integrates the new color palette system with existing utilities
 */
export function useIntegratedColorSystem(): IntegratedColorSystemResult {
  const { palette, updateSystemMetrics, pressureResult } = useColorPalette();
  const { getDynamicShade, getTransitionEffect, getNeonPulse } = useColorShading();
  
  // Create adapter instance
  const adapter = useMemo(() => {
    const metrics: SystemMetricsData = {
      stability: 0.5,
      transition: 0.2,
      pressure: pressureResult
    };
    
    return new ColorSystemAdapter(palette, metrics);
  }, [palette, pressureResult]);
  
  // Update adapter when metrics change
  useEffect(() => {
    adapter.metrics = {
      stability: 0.5,
      transition: 0.2,
      pressure: pressureResult
    };
  }, [adapter, pressureResult]);
  
  // Linear interpolation helper function
  const lerp = (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
  };
  
  // Invert a color (for contrast)
  const invertColor = (color: string): string => {
    if (color.startsWith('#')) {
      color = color.slice(1);
    }
    
    // Convert hex to rgb
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    
    // Invert each channel
    const ir = 255 - r;
    const ig = 255 - g;
    const ib = 255 - b;
    
    // Convert back to hex
    const invertedColor = '#' + [ir, ig, ib].map(c => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    
    return invertedColor;
  };
  
  // Get color intensity (0-1)
  const getColorIntensity = (color: string): number => {
    if (color.startsWith('#')) {
      color = color.slice(1);
    }
    
    // Convert hex to rgb
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    
    // Calculate luminance using the perceived brightness formula
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  
  // Generate enhanced palette combining both systems
  const generateEnhancedPalette = (baseColor: string) => {
    const enhancedPalette = {
      base: baseColor,
      light: adapter.applyHarmonicTransition(baseColor, 0.3),
      dark: adapter.applyHarmonicTransition(baseColor, -0.3),
      accent: getComplimentaryColor(baseColor),
      neon: getNeonPulse(baseColor, palette.neon[60], 0.7),
      gradient: adapter.generateEnhancedGradient(baseColor),
      accessible: {
        onLight: adapter.getAccessibleColor(baseColor, '#ffffff', 4.5),
        onDark: adapter.getAccessibleColor(baseColor, '#121212', 4.5)
      }
    };
    
    return enhancedPalette;
  };
  
  // Apply palette to motion visualization data
  const applyPaletteToMotionVisualization = (motionData: any) => {
    const baseCategory = motionData.isActive ? 'trading' : 'primary';
    const intensityLevel = Math.round(motionData.intensity * 100);
    const shadeLevelBase = Math.min(100, Math.max(10, intensityLevel));
    
    const visualizationColors = {
      primary: getDynamicShade(palette[baseCategory], shadeLevelBase),
      secondary: getDynamicShade(palette.governance, shadeLevelBase - 20),
      highlight: getNeonPulse(
        getDynamicShade(palette.neon, shadeLevelBase),
        getDynamicShade(palette.neon, shadeLevelBase + 30),
        motionData.velocity
      ),
      background: getTransitionEffect(
        getDynamicShade(palette.neutral, 10),
        getDynamicShade(palette.neutral, 20)
      )
    };
    
    return {
      ...motionData,
      colors: visualizationColors,
      harmonicPulse: adapter.applyHarmonicTransition(
        visualizationColors.primary,
        Math.sin(Date.now() * 0.001) * 0.5 + 0.5
      )
    };
  };
  
  return {
    // Original color shading functions
    getDynamicShade,
    getTransitionEffect,
    getNeonPulse,
    palette,
    
    // System metrics updater
    updateSystemMetrics,
    
    // Enhanced integration functions
    generateEnhancedPalette,
    applyPaletteToMotionVisualization,
    
    // Utility functions
    lerp,
    invertColor,
    getColorIntensity
  };
}

export default useIntegratedColorSystem;