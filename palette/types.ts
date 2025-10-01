/**
 * Color Palette System Type Definitions
 * 
 * This file contains TypeScript type definitions for the Solidarity Platform's
 * chakra-inspired gradient color palette system, following React's attribute typing patterns.
 */

import React, { 
  ReactNode, 
  ComponentType, 
  HTMLAttributes, 
  DetailedHTMLProps 
} from 'react';

/**
 * Color Shade definitions from 0-100
 * Each number represents a brightness level
 */
export interface ColorShades {
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  60: string;
  70: string;
  80: string;
  90: string;
  100: string;
  [key: number]: string;
}

/**
 * Complete color palette structure with all functional segments
 */
export interface Palette {
  primary: ColorShades;
  trading: ColorShades;
  liquidity: ColorShades;
  governance: ColorShades;
  neon: ColorShades;
  chakra: ColorShades;
  [key: string]: ColorShades;
}

/**
 * System metrics that affect color behavior
 */
export interface SystemMetricsData {
  /** Stability score (0-1) affects color balance */
  stability: number;
  /** Transition rate (0-1) controls animation speed */
  transition: number;
  /** Pressure (0-1) impacts intensity */
  pressure: number;
  /** Optional offset for additional calculations */
  offset?: number;
}

/**
 * Props for the ColorPaletteProvider component
 */
export interface ColorPaletteProviderProps {
  /** Child components that will have access to the color palette */
  children: ReactNode;
  /** Optional initial palette to override defaults */
  initialPalette?: Palette;
}

/**
 * Context shape for the ColorPaletteContext
 */
export interface ColorPaletteContextType {
  /** Current color palette */
  palette: Palette;
  /** Update the entire palette or merge partial updates */
  updatePalette: (newPalette: Partial<Palette>) => void;
  /** Current intensity factor (0-1) */
  intensityFactor: number;
  /** Current pressure result (0-1) */
  pressureResult: number;
  /** Current stability score (0-1) */
  stabilityScore: number;
  /** Current transition rate (0-1) */
  transitionRate: number;
  /** Update intensity factor based on offset */
  updateIntensity: (offset: number) => void;
  /** Update system metrics and recalculate pressure */
  updateSystemMetrics: (stability: number, transition: number, offset: number) => void;
  /** Generate a pulse trigger for animations */
  generatePulseTrigger: (layerKey: keyof Palette) => void;
}

/**
 * Options for color shading behavior
 */
export interface ColorShadingOptions {
  /** How sensitive colors are to pressure changes (0-1) */
  pressureSensitivity?: number;
  /** How much transition effects are amplified (multiplier) */
  transitionAmplification?: number;
  /** Multiplier for intensity effects */
  intensityMultiplier?: number;
}

/**
 * Props for the ThemeProvider component
 */
export interface ThemeProviderProps {
  /** Child components that will have access to the theme */
  children: ReactNode;
  /** Optional initial palette to override defaults */
  initialPalette?: Palette;
  /** Optional data source for system metrics */
  systemDataSource?: {
    /** Subscribe to system metrics updates */
    subscribe: (callback: (data: SystemMetricsData) => void) => () => void;
  };
}

/**
 * Props for the GradientCard component
 */
export interface GradientCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title: string;
  /** Children components */
  children: ReactNode;
  /** Base shade level (0-100) */
  baseLevel?: number;
  /** Color type (primary, trading, liquidity, governance) */
  type?: 'primary' | 'trading' | 'liquidity' | 'governance';
  /** Whether the card responds to pressure changes */
  pressureSensitive?: boolean;
}

/**
 * Props for the ColorPressureIndicator component
 */
export interface ColorPressureIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Size of the indicator */
  size?: 'small' | 'medium' | 'large';
  /** Whether the indicator is vertical */
  vertical?: boolean;
  /** Optional class name */
  className?: string;
}

/**
 * Result of the useColorShading hook
 */
export interface ColorShadingResult {
  /** Get a shade from color shades based on system metrics */
  getDynamicShade: (
    shades: ColorShades,
    baseLevel?: number,
    isInverted?: boolean
  ) => string;
  
  /** Create a transition effect between colors */
  getTransitionEffect: (
    baseShade: string,
    accentShade: string
  ) => string;
  
  /** Create a neon pulse effect */
  getNeonPulse: (
    baseColor: string,
    neonColor: string,
    pulseIntensity?: number
  ) => string;
  
  /** Current palette */
  palette: Palette;
}

/**
 * Props with system metrics data
 */
export type WithSystemMetricsProps<P = {}> = P & {
  /** System metrics data */
  systemMetrics?: SystemMetricsData;
};

/**
 * Helper type to create a component that receives system metrics
 */
export type SystemMetricsComponent<P = {}> = ComponentType<WithSystemMetricsProps<P>>;

/**
 * Result of the useIntegratedColorSystem hook
 */
export interface IntegratedColorSystemResult extends ColorShadingResult {
  /** Update system metrics */
  updateSystemMetrics: ColorPaletteContextType['updateSystemMetrics'];
  
  /** Generate an enhanced palette combining both systems */
  generateEnhancedPalette: (baseColor: string) => any;
  
  /** Apply palette to motion visualization */
  applyPaletteToMotionVisualization: (motionData: any) => any;
  
  /** Linear interpolation between values */
  lerp: (a: number, b: number, t: number) => number;
  
  /** Invert a color */
  invertColor: (color: string) => string;
  
  /** Get color intensity */
  getColorIntensity: (color: string) => number;
}

// Re-export default palette
export { defaultPalette } from './colorPalette';