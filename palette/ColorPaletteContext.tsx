/**
 * Color Palette Context Provider for Solidarity Platform
 * 
 * This context provides the chakra-inspired gradient palette to all components,
 * allowing for dynamic color updates based on system state, pressure, and transitions.
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Palette, defaultPalette, calculateIntensityFactor, computePressure } from './colorPalette';

interface ColorPaletteContextType {
  palette: Palette;
  updatePalette: (newPalette: Partial<Palette>) => void;
  intensityFactor: number;
  pressureResult: number;
  stabilityScore: number;
  transitionRate: number;
  updateIntensity: (offset: number) => void;
  updateSystemMetrics: (stability: number, transition: number, offset: number) => void;
  generatePulseTrigger: (layerKey: keyof Palette) => void;
}

// Create the context with default values
const ColorPaletteContext = createContext<ColorPaletteContextType>({
  palette: defaultPalette,
  updatePalette: () => {},
  intensityFactor: 0.5,
  pressureResult: 0.5,
  stabilityScore: 0.5,
  transitionRate: 0.5,
  updateIntensity: () => {},
  updateSystemMetrics: () => {},
  generatePulseTrigger: () => {}
});

// Hook for consuming the context
export function useColorPalette() {
  return useContext(ColorPaletteContext);
}

interface ColorPaletteProviderProps {
  children: ReactNode;
  initialPalette?: Palette;
}

export function ColorPaletteProvider({
  children,
  initialPalette = defaultPalette
}: ColorPaletteProviderProps) {
  const [palette, setPalette] = useState<Palette>(initialPalette);
  const [intensityFactor, setIntensityFactor] = useState<number>(0.5);
  const [pressureResult, setPressureResult] = useState<number>(0.5);
  const [stabilityScore, setStabilityScore] = useState<number>(0.5);
  const [transitionRate, setTransitionRate] = useState<number>(0.5);
  const [pulseLayer, setPulseLayer] = useState<keyof Palette | null>(null);

  // Update the entire palette or merge partial updates
  const updatePalette = useCallback((newPalette: Partial<Palette>) => {
    setPalette(currentPalette => ({
      ...currentPalette,
      ...newPalette
    }));
  }, []);

  // Update intensity factor based on offset
  const updateIntensity = useCallback((offset: number) => {
    const intensity = calculateIntensityFactor(offset);
    setIntensityFactor(intensity);
  }, []);

  // Update system metrics and recalculate pressure
  const updateSystemMetrics = useCallback((stability: number, transition: number, offset: number) => {
    setStabilityScore(stability);
    setTransitionRate(transition);
    
    // Update intensity based on offset
    updateIntensity(offset);
    
    // Compute new pressure result
    const newPressure = computePressure(stability, transition, offset - 0.5);
    setPressureResult(newPressure);
  }, [updateIntensity]);

  // Generate a pulse trigger for animations
  const generatePulseTrigger = useCallback((layerKey: keyof Palette) => {
    setPulseLayer(layerKey);
    
    // Reset after a short delay to allow animations to detect the change
    setTimeout(() => {
      setPulseLayer(null);
    }, 50);
  }, []);

  const contextValue: ColorPaletteContextType = {
    palette,
    updatePalette,
    intensityFactor,
    pressureResult,
    stabilityScore,
    transitionRate,
    updateIntensity,
    updateSystemMetrics,
    generatePulseTrigger
  };

  return (
    <ColorPaletteContext.Provider value={contextValue}>
      {children}
    </ColorPaletteContext.Provider>
  );
}

export default ColorPaletteContext;