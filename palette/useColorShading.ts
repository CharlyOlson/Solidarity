/**
 * useColorShading - A custom hook for applying color palette shades with dynamic effects
 * 
 * This hook provides utilities for applying the chakra-inspired color palette
 * to components with real-time adjustments based on system metrics.
 */

import { useColorPalette } from './ColorPaletteContext';
import { ColorShades } from './colorPalette';

interface ColorShadingOptions {
  pressureSensitivity?: number;
  transitionAmplification?: number;
  intensityMultiplier?: number;
}

// Helper function to blend two colors with a ratio
function blendColors(color1: string, color2: string, ratio: number): string {
  // Ensure ratio is between 0 and 1
  const safeRatio = Math.max(0, Math.min(1, ratio));
  
  // Convert hex to rgb
  const hexToRgb = (hex: string): [number, number, number] => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  };

  // Convert rgb to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(c => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Blend the colors
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  
  const r = r1 * (1 - safeRatio) + r2 * safeRatio;
  const g = g1 * (1 - safeRatio) + g2 * safeRatio;
  const b = b1 * (1 - safeRatio) + b2 * safeRatio;
  
  return rgbToHex(r, g, b);
}

/**
 * Hook for dynamic color shading based on system metrics
 */
export function useColorShading(options: ColorShadingOptions = {}) {
  const {
    pressureSensitivity = 0.5,
    transitionAmplification = 1,
    intensityMultiplier = 1
  } = options;
  
  const {
    palette,
    pressureResult,
    intensityFactor,
    transitionRate
  } = useColorPalette();

  /**
   * Returns a shade from the specified color shades based on system metrics
   * @param shades - The color shade object
   * @param baseLevel - Base level for shade selection (0-100)
   * @param isInverted - Whether to invert the pressure effect
   */
  const getDynamicShade = (
    shades: ColorShades,
    baseLevel: number = 50,
    isInverted: boolean = false
  ): string => {
    // Calculate dynamic level based on pressure
    const pressureEffect = (pressureResult - 0.5) * 2 * pressureSensitivity;
    const pressureAdjustment = isInverted ? -pressureEffect : pressureEffect;
    
    // Apply intensity scaling
    const intensityAdjustment = (intensityFactor - 0.5) * 20 * intensityMultiplier;
    
    // Calculate final shade level
    let dynamicLevel = Math.round(
      baseLevel + pressureAdjustment * 20 + intensityAdjustment
    );
    
    // Ensure we stay within bounds
    dynamicLevel = Math.max(0, Math.min(100, dynamicLevel));
    
    // Find the closest available shade
    const shadeKeys = Object.keys(shades).map(key => parseInt(key));
    const closestShade = shadeKeys.reduce((prev, curr) => 
      Math.abs(curr - dynamicLevel) < Math.abs(prev - dynamicLevel) ? curr : prev
    );
    
    return shades[closestShade];
  };

  /**
   * Creates a transition effect for dynamic color changes
   * @param baseShade - The base color shade
   * @param accentShade - The accent color shade
   */
  const getTransitionEffect = (baseShade: string, accentShade: string): string => {
    const transitionFactor = Math.sin(Date.now() * 0.001 * transitionAmplification) * 0.5 + 0.5;
    const blendRatio = transitionRate * transitionFactor * 0.5;
    
    return blendColors(baseShade, accentShade, blendRatio);
  };

  /**
   * Creates a neon pulse effect for highlight colors
   * @param baseColor - The base color
   * @param neonColor - The neon color to pulse
   * @param pulseIntensity - Intensity of the pulse (0-1)
   */
  const getNeonPulse = (
    baseColor: string,
    neonColor: string,
    pulseIntensity: number = 0.7
  ): string => {
    const pulseRate = (Math.sin(Date.now() * 0.002) * 0.5 + 0.5) * pulseIntensity;
    const transitionBoost = transitionRate * 0.5;
    const blendFactor = pulseRate * (1 + transitionBoost);
    
    return blendColors(baseColor, neonColor, blendFactor);
  };

  return {
    getDynamicShade,
    getTransitionEffect,
    getNeonPulse,
    palette
  };
}

export default useColorShading;