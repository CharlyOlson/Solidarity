/**
 * ColorPaletteSystemWithTypes.tsx
 * 
 * A comprehensive React context provider for the Solidarity color system
 * that implements the chakra-inspired gradient system as specified in
 * the Dynamic Color Palette Framework documentation.
 */

import * as React from 'react';
import { 
  calculatePressure,
  getIntensityFactor,
  getChakraGradient, 
  getPrimarySegmentColors,
  getNeonPulseEffect,
  createColorLayeredMotionTracking,
  generateColorSystemVariables,
  PALETTES, 
  PHI 
} from '../utils/colorMapping';

// Types for color palette
export interface ColorShades {
  soft: string;
  deep: string;
  dark: string;
}

export interface PrimaryColorSet {
  base: string;
  pastel: string;
  neon: string;
  antiColor: string;
}

export interface NeonColors {
  pulse: {
    pink: string;
    green: string;
    blue: string;
    orange: string;
    yellow: string;
  };
  trail: {
    pink: string;
    green: string;
    blue: string;
    orange: string;
    yellow: string;
  };
}

export interface Palette {
  chakra: {
    root: ColorShades;
    sacral: ColorShades;
    solar: ColorShades;
    heart: ColorShades;
    throat: ColorShades;
    third_eye: ColorShades;
    crown: ColorShades;
  };
  primary: {
    trading: PrimaryColorSet;
    liquidity: PrimaryColorSet;
    governance: PrimaryColorSet;
  };
  neon: NeonColors;
}

// System metrics interface
export interface SystemMetrics {
  stability: number;
  transitionSpeed: number;
  pressure?: number;
  offsetVariance?: number;
}

// Color system context state
export interface ColorSystemState {
  palette: Palette;
  metrics: SystemMetrics;
  activeSegment: 'trading' | 'liquidity' | 'governance';
  activeChakra: 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third_eye' | 'crown';
}

// Color system context value
export interface ColorSystemContextValue extends ColorSystemState {
  updateMetrics: (metrics: Partial<SystemMetrics>) => void;
  setActiveSegment: (segment: 'trading' | 'liquidity' | 'governance') => void;
  setActiveChakra: (chakra: 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third_eye' | 'crown') => void;
  getChakraGradient: (chakraPosition?: string, intensityFactor?: number) => string;
  getNeonPulseEffect: (transitionSpeed?: number, pressure?: number) => any;
  createTrackingVisualization: (customMetrics?: Partial<SystemMetrics>) => any;
  getCSSVariables: () => any;
}

// Default values
const defaultPalette: Palette = PALETTES as Palette;

const defaultMetrics: SystemMetrics = {
  stability: 0.7,
  transitionSpeed: 0.3,
  pressure: 0.5,
  offsetVariance: 0
};

// Create the context with a default value
const ColorPaletteContext = React.createContext<ColorSystemContextValue>({
  palette: defaultPalette,
  metrics: defaultMetrics,
  activeSegment: 'trading',
  activeChakra: 'heart',
  updateMetrics: () => {},
  setActiveSegment: () => {},
  setActiveChakra: () => {},
  getChakraGradient: () => '',
  getNeonPulseEffect: () => ({}),
  createTrackingVisualization: () => ({}),
  getCSSVariables: () => ({})
});

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMetrics?: Partial<SystemMetrics>;
  initialSegment?: 'trading' | 'liquidity' | 'governance';
  initialChakra?: 'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third_eye' | 'crown';
}

// Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMetrics,
  initialSegment = 'trading',
  initialChakra = 'heart'
}) => {
  // State for metrics
  const [metrics, setMetrics] = React.useState<SystemMetrics>({
    ...defaultMetrics,
    ...initialMetrics
  });
  
  // States for active segment and chakra position
  const [activeSegment, setActiveSegment] = React.useState<'trading' | 'liquidity' | 'governance'>(initialSegment);
  const [activeChakra, setActiveChakra] = React.useState<'root' | 'sacral' | 'solar' | 'heart' | 'throat' | 'third_eye' | 'crown'>(initialChakra);
  
  // Calculate pressure when stability, transitionSpeed or offsetVariance change
  React.useEffect(() => {
    const { stability, transitionSpeed, offsetVariance = 0 } = metrics;
    const pressure = calculatePressure(stability, transitionSpeed, offsetVariance);
    
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      pressure
    }));
  }, [metrics.stability, metrics.transitionSpeed, metrics.offsetVariance]);
  
  // Update metrics function
  const updateMetrics = React.useCallback((newMetrics: Partial<SystemMetrics>) => {
    setMetrics(prevMetrics => ({
      ...prevMetrics,
      ...newMetrics
    }));
  }, []);
  
  // Get chakra gradient
  const getActiveChakraGradient = React.useCallback((
    chakraPosition?: string,
    intensityFactor?: number
  ) => {
    const position = chakraPosition || activeChakra;
    const intensity = intensityFactor !== undefined ? 
      intensityFactor : 
      getIntensityFactor(1 - metrics.stability);
    
    return getChakraGradient(position, intensity);
  }, [activeChakra, metrics.stability]);
  
  // Get neon pulse effect
  const getActiveNeonPulseEffect = React.useCallback((
    transitionSpeed?: number,
    pressure?: number
  ) => {
    const speed = transitionSpeed !== undefined ? 
      transitionSpeed : 
      metrics.transitionSpeed;
    
    const pressureValue = pressure !== undefined ? 
      pressure : 
      metrics.pressure || 0.5;
    
    return getNeonPulseEffect(speed, pressureValue);
  }, [metrics.transitionSpeed, metrics.pressure]);
  
  // Create complete tracking visualization
  const createTrackingVisualization = React.useCallback((
    customMetrics?: Partial<SystemMetrics>
  ) => {
    const mergedMetrics = {
      ...metrics,
      ...customMetrics
    };
    
    return createColorLayeredMotionTracking(
      mergedMetrics as SystemMetrics, 
      activeSegment, 
      activeChakra
    );
  }, [metrics, activeSegment, activeChakra]);
  
  // Get CSS variables
  const getCSSVariables = React.useCallback(() => {
    return generateColorSystemVariables(
      metrics, 
      { 
        segment: activeSegment, 
        chakraPosition: activeChakra 
      }
    );
  }, [metrics, activeSegment, activeChakra]);
  
  const contextValue: ColorSystemContextValue = React.useMemo(() => ({
    palette: defaultPalette,
    metrics,
    activeSegment,
    activeChakra,
    updateMetrics,
    setActiveSegment,
    setActiveChakra,
    getChakraGradient: getActiveChakraGradient,
    getNeonPulseEffect: getActiveNeonPulseEffect,
    createTrackingVisualization,
    getCSSVariables
  }), [
    metrics, 
    activeSegment, 
    activeChakra, 
    updateMetrics, 
    getActiveChakraGradient,
    getActiveNeonPulseEffect,
    createTrackingVisualization,
    getCSSVariables
  ]);
  
  return (
    <ColorPaletteContext.Provider value={contextValue}>
      {children}
    </ColorPaletteContext.Provider>
  );
};

// Custom hooks
export const useColorPalette = () => {
  const context = React.useContext(ColorPaletteContext);
  if (!context) {
    throw new Error('useColorPalette must be used within a ThemeProvider');
  }
  
  const { palette, metrics, activeSegment, activeChakra } = context;
  
  return {
    palette,
    metrics,
    activeSegment,
    activeChakra,
    pressureResult: metrics.pressure || 0.5,
    intensityFactor: getIntensityFactor(1 - metrics.stability)
  };
};

export const useColorSystem = () => {
  const context = React.useContext(ColorPaletteContext);
  if (!context) {
    throw new Error('useColorSystem must be used within a ThemeProvider');
  }
  
  return context;
};

export const useColorMotionTracking = () => {
  const context = React.useContext(ColorPaletteContext);
  if (!context) {
    throw new Error('useColorMotionTracking must be used within a ThemeProvider');
  }
  
  const { metrics, updateMetrics, createTrackingVisualization } = context;
  
  return {
    metrics,
    updateMetrics,
    createVisualization: createTrackingVisualization
  };
};

// Utility hooks
export const useColorShading = () => {
  // Get shades of a color using lightness adjustments
  const getLightnessShade = (hexColor: string, lightness: number): string => {
    // Convert hex to HSL
    let r = parseInt(hexColor.slice(1, 3), 16) / 255;
    let g = parseInt(hexColor.slice(3, 5), 16) / 255;
    let b = parseInt(hexColor.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      
      h /= 6;
    }
    
    // Adjust lightness
    l = lightness / 100;
    
    // Convert back to RGB
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h * 6) % 2 - 1));
    let m = l - c / 2;
    let r1, g1, b1;
    
    if (h < 1/6) {
      [r1, g1, b1] = [c, x, 0];
    } else if (h < 2/6) {
      [r1, g1, b1] = [x, c, 0];
    } else if (h < 3/6) {
      [r1, g1, b1] = [0, c, x];
    } else if (h < 4/6) {
      [r1, g1, b1] = [0, x, c];
    } else if (h < 5/6) {
      [r1, g1, b1] = [x, 0, c];
    } else {
      [r1, g1, b1] = [c, 0, x];
    }
    
    r = Math.round((r1 + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g1 + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b1 + m) * 255).toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`;
  };
  
  // Get dynamic shade based on a base color and the pressure factor
  const getDynamicShade = (baseColor: string, pressureFactor: number): string => {
    return getLightnessShade(baseColor, pressureFactor);
  };
  
  // Generate a complete scale of shades from a base color
  const generateShadeScale = (baseColor: string, steps = 10): Record<number, string> => {
    const shadeScale: Record<number, string> = {};
    
    for (let i = 0; i <= steps; i++) {
      const percent = (100 / steps) * i;
      shadeScale[i * 10] = getLightnessShade(baseColor, percent);
    }
    
    return shadeScale;
  };
  
  return {
    getLightnessShade,
    getDynamicShade,
    generateShadeScale
  };
};

// Helper for creating harmonic color combinations based on Golden Ratio
export const useHarmonicColors = () => {
  // Convert hex to HSL
  const hexToHSL = (hex: string): [number, number, number] => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      
      h /= 6;
    }
    
    return [h * 360, s * 100, l * 100];
  };
  
  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h * 6) % 2 - 1));
    let m = l - c / 2;
    let r1, g1, b1;
    
    if (h < 1/6) {
      [r1, g1, b1] = [c, x, 0];
    } else if (h < 2/6) {
      [r1, g1, b1] = [x, c, 0];
    } else if (h < 3/6) {
      [r1, g1, b1] = [0, c, x];
    } else if (h < 4/6) {
      [r1, g1, b1] = [0, x, c];
    } else if (h < 5/6) {
      [r1, g1, b1] = [x, 0, c];
    } else {
      [r1, g1, b1] = [c, 0, x];
    }
    
    let r = Math.round((r1 + m) * 255).toString(16).padStart(2, '0');
    let g = Math.round((g1 + m) * 255).toString(16).padStart(2, '0');
    let b = Math.round((b1 + m) * 255).toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`;
  };
  
  // Generate harmonic colors using Golden Ratio
  const generateHarmonicColors = (baseColor: string, count: number): string[] => {
    const [h, s, l] = hexToHSL(baseColor);
    const harmonicColors: string[] = [baseColor];
    
    // Golden ratio conjugate
    const goldenRatioConjugate = 1 / PHI;
    
    for (let i = 1; i < count; i++) {
      // Rotate hue by golden ratio conjugate
      const newHue = (h + (goldenRatioConjugate * 360 * i)) % 360;
      harmonicColors.push(hslToHex(newHue, s, l));
    }
    
    return harmonicColors;
  };
  
  // Generate complementary color
  const getComplementaryColor = (baseColor: string): string => {
    const [h, s, l] = hexToHSL(baseColor);
    return hslToHex((h + 180) % 360, s, l);
  };
  
  return {
    generateHarmonicColors,
    getComplementaryColor,
    hexToHSL,
    hslToHex
  };
};

export default ColorPaletteContext;