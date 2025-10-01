/**
 * Chakra-Inspired Color System for Solidarity Platform
 * 
 * This file implements the chakra-inspired gradient palette with advanced 
 * visualization features including pastel growth hues, deep core tones,
 * dark anti-color edges, and animation utilities.
 */

const baseColorUtils = require('./colorUtils');

/**
 * Chakra color palette definitions
 */
const CHAKRA_COLORS = {
  // Pastel Growth Hues (60-80% opacity)
  pastel: {
    pink: 'rgba(255, 182, 193, 0.7)',
    orange: 'rgba(255, 213, 171, 0.7)',
    green: 'rgba(193, 255, 193, 0.7)',
    blue: 'rgba(173, 216, 230, 0.7)',
    purple: 'rgba(221, 160, 221, 0.7)',
    yellow: 'rgba(255, 255, 224, 0.7)'
  },
  
  // Deep Core Tones (90-100% opacity)
  core: {
    magenta: 'rgba(139, 0, 139, 1)',
    orange: 'rgba(204, 85, 0, 1)',
    green: 'rgba(0, 100, 0, 1)',
    indigo: 'rgba(25, 25, 112, 1)',
    purple: 'rgba(85, 26, 139, 1)',
    gold: 'rgba(184, 134, 11, 1)'
  },
  
  // Dark Anti-Color Edges (100% opacity)
  antiColor: {
    pink: '#2e003e',
    orange: '#00304e',
    green: '#300030',
    blue: '#302200',
    purple: '#002200',
    yellow: '#000066'
  },
  
  // Primary Application Blocks
  blocks: {
    red: '#ff0000',
    yellow: '#ffff00',
    blue: '#0000ff'
  },
  
  // Neon Pulse Colors
  neon: {
    pink: '#ff6ec7',
    green: '#39ff14',
    blue: '#3677ff',
    yellow: '#ffff00',
    purple: '#cc00ff',
    orange: '#ff9900'
  },
  
  // Trend and Offset Colors
  trend: {
    gray: '#a0a8b8',
    lightGray: 'rgba(160, 168, 184, 0.4)',
    blue: 'rgba(100, 149, 237, 0.5)',
    green: 'rgba(143, 188, 143, 0.5)'
  }
};

/**
 * Get chakra growth palette (pastel to core transition)
 * @param {string} color - Base color name (pink, orange, green, blue, purple, yellow)
 * @param {number} intensity - Intensity of transition from 0 (pastel) to 1 (core)
 * @returns {Object} - Color information with fill and stroke values
 */
function getChakraGrowthColor(color, intensity) {
  // Ensure valid color and intensity
  if (!CHAKRA_COLORS.pastel[color] || !CHAKRA_COLORS.core[color]) {
    throw new Error(`Invalid color: ${color}`);
  }
  
  intensity = Math.max(0, Math.min(1, intensity));
  
  // Interpolate between pastel and core
  const pastelColor = CHAKRA_COLORS.pastel[color];
  const coreColor = CHAKRA_COLORS.core[color];
  
  // Generate anti-color border when intensity exceeds 0.75
  let strokeColor = null;
  if (intensity > 0.75) {
    strokeColor = CHAKRA_COLORS.antiColor[color];
  }
  
  // For simplicity in this implementation, we're using the colors directly
  // In a more advanced implementation, we would do proper RGBA interpolation
  const fillColor = intensity < 0.5 ? pastelColor : coreColor;
  
  return {
    fill: fillColor,
    stroke: strokeColor,
    intensity
  };
}

/**
 * Get neon pulse color for animations
 * @param {string} baseColor - Base color name to get complementary neon color
 * @returns {string} - Neon color for pulse effect
 */
function getNeonPulseColor(baseColor) {
  const colorMap = {
    'red': CHAKRA_COLORS.neon.blue,
    'blue': CHAKRA_COLORS.neon.yellow,
    'green': CHAKRA_COLORS.neon.pink,
    'yellow': CHAKRA_COLORS.neon.purple,
    'orange': CHAKRA_COLORS.neon.green,
    'pink': CHAKRA_COLORS.neon.blue,
    'purple': CHAKRA_COLORS.neon.green,
    'indigo': CHAKRA_COLORS.neon.orange
  };
  
  return colorMap[baseColor] || CHAKRA_COLORS.neon.green;
}

/**
 * Generate CSS variables string for the chakra color system
 * @returns {string} - CSS variables definition
 */
function generateCSSVariables() {
  let cssVars = ':root {\n';
  
  // Add pastel colors
  Object.entries(CHAKRA_COLORS.pastel).forEach(([name, value]) => {
    cssVars += `  --pastel-${name}: ${value};\n`;
  });
  
  // Add core colors
  Object.entries(CHAKRA_COLORS.core).forEach(([name, value]) => {
    cssVars += `  --core-${name}: ${value};\n`;
  });
  
  // Add anti-colors
  Object.entries(CHAKRA_COLORS.antiColor).forEach(([name, value]) => {
    cssVars += `  --anti-${name}: ${value};\n`;
  });
  
  // Add block colors
  Object.entries(CHAKRA_COLORS.blocks).forEach(([name, value]) => {
    cssVars += `  --block-${name}: ${value};\n`;
  });
  
  // Add neon colors
  Object.entries(CHAKRA_COLORS.neon).forEach(([name, value]) => {
    cssVars += `  --neon-${name}: ${value};\n`;
  });
  
  // Add trend colors
  Object.entries(CHAKRA_COLORS.trend).forEach(([name, value]) => {
    cssVars += `  --trend-${name}: ${value};\n`;
  });
  
  cssVars += '}\n';
  
  return cssVars;
}

/**
 * Generate Canvas animation code for neon pulse effect
 * @returns {string} - JavaScript code for canvas animation
 */
function generateNeonPulseAnimationCode() {
  return `
/**
 * Animate neon pulse effect on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Neon color
 * @param {number} duration - Animation duration in seconds
 */
function animateNeonPulse(ctx, x, y, color, duration = 1.5) {
  let t = 0;
  const fps = 60;
  const interval = 1000 / fps;
  const incrementPerFrame = 1 / (fps * duration);
  
  function frame() {
    t += incrementPerFrame;
    const alpha = 1 - t;
    if (alpha <= 0) return;
    
    ctx.beginPath();
    ctx.arc(x, y, 20 + t * 10, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.globalAlpha = alpha;
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    setTimeout(() => requestAnimationFrame(frame), interval);
  }
  
  requestAnimationFrame(frame);
}

/**
 * Draw habitual correction pulse
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Ring color
 */
function drawCorrectionPulse(ctx, x, y, color) {
  let scale = 1;
  let growing = true;
  const maxScale = 1.2;
  const minScale = 1;
  const increment = 0.01;
  
  function pulse() {
    ctx.clearRect(x - 30, y - 30, 60, 60); // Clear previous ring
    
    // Update scale
    if (growing) {
      scale += increment;
      if (scale >= maxScale) growing = false;
    } else {
      scale -= increment;
      if (scale <= minScale) growing = true;
    }
    
    // Draw ring
    ctx.beginPath();
    ctx.arc(x, y, 10 * scale, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    requestAnimationFrame(pulse);
  }
  
  pulse();
}

/**
 * Draw trend point
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} color - Point color
 * @param {number} radius - Point radius
 */
function drawTrendPoint(ctx, x, y, color = 'var(--trend-gray)', radius = 4) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Connect trend points with dashed line
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} points - Array of points [{x, y}]
 * @param {string} color - Line color
 */
function connectTrendPoints(ctx, points, color = 'var(--trend-lightGray)') {
  if (points.length < 2) return;
  
  ctx.beginPath();
  ctx.setLineDash([5, 3]);
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}
`;
}

/**
 * Generate a chakra-based visualization toolkit
 * @returns {Object} Object with visualization utilities
 */
function createChakraVisualization() {
  return {
    colors: CHAKRA_COLORS,
    getChakraGrowthColor,
    getNeonPulseColor,
    baseColorUtils,
    cssVariables: generateCSSVariables(),
    animationCode: generateNeonPulseAnimationCode()
  };
}

// Export the chakra color system
module.exports = {
  CHAKRA_COLORS,
  getChakraGrowthColor,
  getNeonPulseColor,
  generateCSSVariables,
  generateNeonPulseAnimationCode,
  createChakraVisualization
};