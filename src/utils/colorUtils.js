/**
 * Color Utilities for Solidarity Platform
 * 
 * This file contains utilities for color handling, interpolation, and visualization
 * based on the sacred number sequence (6-7-8-9) and golden ratio principles.
 * Functions here help with visual representation of harmonic data in the platform.
 * 
 * @see /docs/COLOR_PALETTE_FRAMEWORK.md for detailed documentation
 */

/**
 * Linear interpolation between two colors
 * @param {string} color1 - Starting color in hex format
 * @param {string} color2 - Ending color in hex format 
 * @param {number} factor - Interpolation factor between 0 and 1
 * @returns {string} - Resulting color in hex format
 */
function lerp(color1, color2, factor) {
  // Ensure factor is between 0 and 1
  factor = Math.max(0, Math.min(1, factor));
  
  // Parse hex colors into RGB components
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);
  
  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);
  
  // Interpolate each component
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get the inverted color of a hex color
 * @param {string} hexColor - Color in hex format
 * @returns {string} - Inverted color in hex format
 */
function invertColor(hexColor) {
  // Remove # if present
  if (hexColor.indexOf('#') === 0) {
    hexColor = hexColor.slice(1);
  }
  
  // Parse hex to RGB
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);
  
  // Invert each component
  const invertedR = (255 - r).toString(16).padStart(2, '0');
  const invertedG = (255 - g).toString(16).padStart(2, '0');
  const invertedB = (255 - b).toString(16).padStart(2, '0');
  
  return `#${invertedR}${invertedG}${invertedB}`;
}

/**
 * Get color intensity based on offset strength
 * @param {number} offsetStrength - Offset strength between 0 and 1 
 * @returns {Object} - Object containing fill and stroke colors
 */
function getColorIntensity(offsetStrength) {
  // offsetStrength ∈ [0,1]
  // Pastel→Core transition
  const basePastel = lerp('#E3E4FA', '#4B0082', offsetStrength);
  // Border anti-color if offsetStrength > 0.75
  const border = offsetStrength > 0.75 ? invertColor(basePastel) : null;
  return { fill: basePastel, stroke: border };
}

/**
 * Generate a palette of colors based on harmonic principles
 * @param {number} base - Base color hue (0-360)
 * @param {number} count - Number of colors to generate
 * @returns {string[]} - Array of hex color codes
 */
function generateHarmonicPalette(base, count = 7) {
  const palette = [];
  // Generate colors using the golden ratio
  const goldenRatio = 0.618033988749895;
  let h = base / 360; // Normalize to 0-1
  
  for (let i = 0; i < count; i++) {
    h = (h + goldenRatio) % 1;
    
    // Convert HSL to RGB
    const hue = Math.floor(h * 360);
    const saturation = 0.7;
    const lightness = 0.5;
    
    // Convert to hex format
    const color = hslToHex(hue, saturation, lightness);
    palette.push(color);
  }
  
  return palette;
}

/**
 * Convert HSL to hex color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {string} - Hex color string
 */
function hslToHex(h, s, l) {
  // Normalize h to 0-1
  h /= 360;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  // Convert to hex
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Export all utilities for CommonJS usage
module.exports = {
  lerp,
  invertColor,
  getColorIntensity,
  generateHarmonicPalette
};