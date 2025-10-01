/**
 * Color Palette implementation with enhanced type safety
 * 
 * This file creates properly typed React components and hooks
 * following React's DOM attribute typing patterns.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type {
  Palette,
  ColorPaletteContextType,
  ColorPaletteProviderProps,
  SystemMetricsData,
  ThemeProviderProps,
  GradientCardProps,
  ColorPressureIndicatorProps,
  ColorShadingOptions,
  ColorShadingResult
} from './types';

// Import from original implementation
import { defaultPalette, calculateIntensityFactor, computePressure } from './colorPalette';

// Create context with proper typing
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

// Typed hook for consuming the context
export function useColorPalette(): ColorPaletteContextType {
  return useContext(ColorPaletteContext);
}

// Properly typed provider component
export function ColorPaletteProvider({
  children,
  initialPalette = defaultPalette
}: ColorPaletteProviderProps): JSX.Element {
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

// Strongly typed ThemeProvider component
export function ThemeProvider({
  children,
  initialPalette = defaultPalette,
  systemDataSource
}: ThemeProviderProps): JSX.Element {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsData>({
    stability: 0.5,
    transition: 0.2,
    pressure: 0.0
  });

  // Subscribe to system data changes if source is provided
  useEffect(() => {
    if (!systemDataSource) return;

    // Subscribe to system metrics data
    const unsubscribe = systemDataSource.subscribe((data) => {
      setSystemMetrics(data);
    });

    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [systemDataSource]);

  return (
    <ColorPaletteProvider initialPalette={initialPalette}>
      {React.Children.map(children, child => {
        // Pass system metrics to any component that accepts them
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          return React.cloneElement(child, {
            systemMetrics,
            ...child.props
          });
        }
        return child;
      })}
    </ColorPaletteProvider>
  );
}

/**
 * Properly typed hook for dynamic color shading based on system metrics
 */
export function useColorShading(options: ColorShadingOptions = {}): ColorShadingResult {
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
   * Returns a shade from the specified color shades based on system metrics
   */
  const getDynamicShade = (
    shades: Record<number, string>,
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
   */
  const getTransitionEffect = (baseShade: string, accentShade: string): string => {
    const transitionFactor = Math.sin(Date.now() * 0.001 * transitionAmplification) * 0.5 + 0.5;
    const blendRatio = transitionRate * transitionFactor * 0.5;
    
    return blendColors(baseShade, accentShade, blendRatio);
  };

  /**
   * Creates a neon pulse effect for highlight colors
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

// Strongly typed components with proper React prop interfaces
export function GradientCard({
  title,
  children,
  baseLevel = 50,
  type = 'primary',
  pressureSensitive = true,
  ...divProps
}: GradientCardProps): JSX.Element {
  const { pressureResult, updateSystemMetrics } = useColorPalette();
  const { getDynamicShade, getNeonPulse } = useColorShading({
    pressureSensitivity: pressureSensitive ? 0.8 : 0.2,
    transitionAmplification: 1.5
  });
  
  // Determine which color palette to use based on type
  const colorKey = type === 'primary' ? 'primary' : 
                  type === 'trading' ? 'trading' :
                  type === 'liquidity' ? 'liquidity' : 'governance';
                  
  const { palette } = useColorPalette();
  const colors = palette[colorKey];
  
  // Get dynamic shades for the component
  const baseColor = getDynamicShade(colors, baseLevel);
  const accentColor = getDynamicShade(colors, baseLevel + 30);
  const textColor = getDynamicShade(colors, baseLevel > 50 ? 10 : 90);
  
  // Add neon highlight effect
  const highlightColor = getNeonPulse(
    baseColor, 
    palette.neon[baseLevel > 50 ? 30 : 70], 
    pressureResult * 0.8
  );

  // Simulate a pressure change on interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pressureSensitive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Calculate normalized distance from center (0-1)
    const centerX = 0.5;
    const centerY = 0.5;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const normalizedDistance = Math.min(distance * 2, 1); // 0 at center, 1 at edge
    
    // Update system metrics based on mouse position
    updateSystemMetrics(
      0.5 + (y - 0.5) * 0.5,  // stability based on Y position
      0.2 + normalizedDistance * 0.6,  // transition based on distance from center
      x  // offset based on X position
    );
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: baseColor,
    color: textColor,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: `0 8px 24px rgba(0, 0, 0, 0.15), 0 0 12px ${highlightColor}80`,
    transition: 'all 0.3s ease',
    border: `1px solid ${accentColor}80`,
    backgroundImage: `linear-gradient(135deg, ${baseColor}, ${accentColor}40)`,
    position: 'relative',
    overflow: 'hidden',
    margin: '20px 0'
  };
  
  const titleStyle: React.CSSProperties = {
    marginBlockEnd: '16px',
    fontSize: '24px',
    fontWeight: '600',
    color: textColor,
    textShadow: `0 0 8px ${highlightColor}60`
  };

  // Add chakra-inspired decorative element
  const chakraDecoratorStyle: React.CSSProperties = {
    position: 'absolute',
    insetBlockStart: '-20px',
    insetInlineEnd: '-20px',
    inlineSize: '100px',
    blockSize: '100px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${highlightColor}40 0%, transparent 70%)`,
    opacity: 0.7,
    transform: `scale(${0.8 + pressureResult * 0.4})`,
    transition: 'transform 0.5s ease, opacity 0.5s ease'
  };

  return (
    <div 
      style={cardStyle}
      onMouseMove={handleMouseMove}
      {...divProps}
    >
      <div style={chakraDecoratorStyle} />
      <h3 style={titleStyle}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

/**
 * ColorPressureIndicator visualizes system pressure with gradients and neon accents
 */
export function ColorPressureIndicator({
  size = 'medium',
  vertical = false,
  className,
  ...divProps
}: ColorPressureIndicatorProps): JSX.Element {
  const { pressureResult, stabilityScore, transitionRate } = useColorPalette();
  const { getDynamicShade, getNeonPulse, palette } = useColorShading({
    pressureSensitivity: 1.0,
    transitionAmplification: 2.0
  });
  
  // Size mapping
  const sizeMap = {
    small: { 
      inlineSize: vertical ? '30px' : '120px', 
      blockSize: vertical ? '120px' : '30px' 
    },
    medium: { 
      inlineSize: vertical ? '40px' : '200px', 
      blockSize: vertical ? '200px' : '40px' 
    },
    large: { 
      inlineSize: vertical ? '60px' : '300px', 
      blockSize: vertical ? '300px' : '60px' 
    }
  };
  
  const dimensions = sizeMap[size] || sizeMap.medium;
  
  // Calculate colors based on pressure
  const lowColor = getDynamicShade(palette.primary, 20);
  const midColor = getDynamicShade(palette.primary, 50);
  const highColor = getDynamicShade(palette.primary, 80);
  
  // Add neon accents based on transition rate
  const accentColor = getNeonPulse(
    midColor, 
    palette.neon[60], 
    transitionRate * 0.9
  );
  
  // Calculate fill amount based on pressure (0-100%)
  const fillPercent = Math.round(pressureResult * 100);
  
  const containerStyle: React.CSSProperties = {
    ...dimensions,
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${accentColor}80`,
    position: 'relative',
    boxShadow: `0 0 8px ${accentColor}60`,
    background: `linear-gradient(${vertical ? 'to top' : 'to right'}, ${lowColor}, ${midColor}, ${highColor})`,
  };
  
  const fillStyle = {
    position: 'absolute',
    background: `linear-gradient(${vertical ? 'to top' : 'to right'}, ${accentColor}80, ${accentColor})`,
    transition: 'all 0.5s ease',
    ...(vertical 
      ? { 
          insetBlockEnd: 0, 
          insetInlineStart: 0, 
          inlineSize: '100%', 
          blockSize: `${fillPercent}%` 
        } 
      : { 
          insetInlineStart: 0, 
          insetBlockStart: 0, 
          blockSize: '100%', 
          inlineSize: `${fillPercent}%` 
        }
    )
  };
  
  const textStyle = {
    position: 'absolute',
    insetBlockStart: '50%',
    insetInlineStart: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ffffff',
    fontSize: size === 'small' ? '10px' : size === 'large' ? '18px' : '14px',
    fontWeight: 'bold',
    textShadow: '0 0 4px rgba(0,0,0,0.5)',
    zIndex: 10
  };
  
  const stabilityIndicatorStyle = {
    position: 'absolute',
    inlineSize: '4px',
    blockSize: '70%',
    background: palette.neon[90],
    opacity: 0.7,
    transition: 'all 0.3s ease',
    insetBlockStart: '15%',
    insetInlineStart: `${stabilityScore * 100}%`,
    transform: 'translateX(-50%)',
    display: vertical ? 'none' : 'block'
  };

  return (
    <div 
      style={containerStyle} 
      className={className}
      {...divProps}
    >
      <div style={fillStyle}></div>
      <div style={stabilityIndicatorStyle}></div>
      <div style={textStyle}>{fillPercent}%</div>
    </div>
  );
}

export default ColorPaletteContext;