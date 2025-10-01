/**
 * Color Palette Types and Default Values for Solidarity Platform
 * 
 * This file defines the chakra-inspired gradient palette structure and default colors.
 * The palette includes pastel shades, deep core tones, dark anti-edges, and neon highlights.
 */

export interface ColorShades {
  pastel: string;
  deep: string;
  anti: string;
  neon: string;
  trail: string; // Semi-transparent trail for neon pulses
}

export interface Palette {
  // Functional System Segments
  stabilityLayer: ColorShades;
  slopeLayer: ColorShades;
  actionLayer: ColorShades;
  
  // Primary Colors for Application Pillars
  tradingPillar: ColorShades;
  liquidityPillar: ColorShades;
  governancePillar: ColorShades;
}

/**
 * Default chakra-inspired gradient palette
 * - Soft Pastels: Mark new/emerging shifts
 * - Deep Tones: Anchor core system layers
 * - Dark Anti-Edges: Provide high-contrast boundaries
 * - Neon Pulses: Indicate transition speed/pressure
 * - Pastel Trails: Preserve previous trends
 */
export const defaultPalette: Palette = {
  stabilityLayer: {
    pastel: '#E0BBE4', // Pale lavender
    deep: '#6A0572',   // Deep purple
    anti: '#2C003E',   // Dark purple border
    neon: '#FF6EC7',   // Electric pink pulse
    trail: '#FFD1EC'   // Faded coral trail
  },
  slopeLayer: {
    pastel: '#C8E6C9', // Mint
    deep: '#2E7D32',   // Emerald
    anti: '#1B4D1B',   // Dark green border
    neon: '#00E676',   // Bright lime pulse
    trail: '#B2DFDB'   // Faded mint trail
  },
  actionLayer: {
    pastel: '#FFE0B2', // Peach
    deep: '#EF6C00',   // Burnt sienna
    anti: '#7F3F00',   // Dark brown border
    neon: '#FF9100',   // Bright orange pulse
    trail: '#FFECB3'   // Faded peach trail
  },
  tradingPillar: {
    pastel: '#FFCDD2', // Light red
    deep: '#C62828',   // Deep red
    anti: '#801919',   // Dark red border
    neon: '#FF1744',   // Neon red pulse
    trail: '#FFEBEE'   // Faded pink trail
  },
  liquidityPillar: {
    pastel: '#FFF9C4', // Light yellow
    deep: '#F9A825',   // Deep yellow
    anti: '#8C6D1F',   // Dark yellow border
    neon: '#FFEA00',   // Neon yellow pulse
    trail: '#FFFDE7'   // Faded yellow trail
  },
  governancePillar: {
    pastel: '#BBDEFB', // Light blue
    deep: '#1565C0',   // Deep blue
    anti: '#0D47A1',   // Dark blue border
    neon: '#2979FF',   // Electric blue pulse
    trail: '#E3F2FD'   // Faded blue trail
  }
};

/**
 * Calculate the intensity factor for gradients
 * @param offset Stability offset value (0-1)
 * @returns Intensity factor for color calculations
 */
export function calculateIntensityFactor(offset: number): number {
  // Clamp between 0-1
  const clampedOffset = Math.max(0, Math.min(1, offset));
  
  // Calculate intensity:
  // - Low offset (stable) → very soft pastel (IntensityFactor < 0.25)
  // - High offset (corrective) → deep chakra tone intensified (IntensityFactor > 0.75)
  return clampedOffset * clampedOffset; // Squared for non-linear emphasis
}

/**
 * Compute a pressure result based on stability, transition speed, and offset
 * P = ST × R ± OV
 * 
 * @param stabilityScore Stability score (0-1)
 * @param transitionRate Transition rate/speed (0-1)
 * @param offsetVariance Offset variance (-1 to 1)
 * @returns Computed pressure result
 */
export function computePressure(
  stabilityScore: number, 
  transitionRate: number, 
  offsetVariance: number
): number {
  // Clamp input values
  const stability = Math.max(0, Math.min(1, stabilityScore));
  const transition = Math.max(0, Math.min(1, transitionRate));
  const offset = Math.max(-1, Math.min(1, offsetVariance));
  
  // Calculate pressure using the formula P = ST × R ± OV
  const pressure = (stability * transition) + offset;
  
  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, pressure + 0.5));
}