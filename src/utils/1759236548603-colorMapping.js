/**
 * Solidarity Platform Color Mapping Utilities
 * 
 * Enhanced implementation of the Dynamic Color Palette Framework
 * based on the sacred numeric sequence (6-7-8-9) and golden ratio principles.
 * 
 * This implementation follows the specifications in the Dynamic Color Palette Framework:
 * - Sacred numeric sequence colors (6-7-8-9)
 * - Golden ratio (φ) based color transitions
 * - Complementary and triadic relationships
 * - Accessibility-driven color adaptations
 * - Motion timing aligned with sacred numbers
 * - Chakra Gradients for Growth & Depth (legacy support)
 * - Color-Layered Motion Tracking Logic
 * - Animated Overlays & Real-Time Reactivity
 * 
 * @see /docs/COLOR_PALETTE_FRAMEWORK.md for detailed documentation
 */

// Golden ratio for harmonic color calculations
const PHI = 1.618033988749895;

/**
 * Base color palettes for the system
 */
const PALETTES = {
  // Sacred number palette (6-7-8-9)
  sacred: {
    six: {      // Solidarity Blue
      hex: '#3366CC',
      rgb: [51, 102, 204]
    },
    seven: {    // Quantum Purple
      hex: '#9933CC',
      rgb: [153, 51, 204]
    },
    eight: {    // Harmonic Green
      hex: '#33CC99',
      rgb: [51, 204, 153]
    },
    nine: {     // Golden Amber
      hex: '#FFCC33',
      rgb: [255, 204, 51]
    }
  },
  
  // Secondary palette (derived via Golden Ratio)
  secondary: {
    deepOcean: {
      hex: '#1A3366',
      rgb: [26, 51, 102]
    },
    lavenderMist: {
      hex: '#CC99FF',
      rgb: [204, 153, 255]
    },
    emeraldLight: {
      hex: '#66FFCC',
      rgb: [102, 255, 204]
    },
    sunsetGold: {
      hex: '#FFAA00',
      rgb: [255, 170, 0]
    }
  },

  // Chakra-inspired gradients (preserved for backward compatibility)
  chakra: {
    root: {
      soft: '#f5e6e6', // Soft pastel
      deep: '#8B0000', // Deep red
      dark: '#4a0000', // Dark anti-edge
    },
    sacral: {
      soft: '#fae8d2',
      deep: '#FF8C00', // Deep orange
      dark: '#804600',
    },
    solar: {
      soft: '#fbf8e0',
      deep: '#FFD700', // Golden yellow
      dark: '#806c00',
    },
    heart: {
      soft: '#e4f4e8',
      deep: '#228B22', // Forest green
      dark: '#114611',
    },
    throat: {
      soft: '#e0f0fa',
      deep: '#1E90FF', // Dodger blue
      dark: '#0f4880',
    },
    third_eye: {
      soft: '#e8e6f5',
      deep: '#4B0082', // Indigo
      dark: '#250041',
    },
    crown: {
      soft: '#f2e6f5',
      deep: '#9400D3', // Violet
      dark: '#4a0069',
    },
  },

  // Primary functional segments (updated to use sacred number colors)
  primary: {
    trading: {
      base: '#3366CC', // Solidarity Blue (6)
      pastel: '#C1D2F2',
      neon: '#66CCFF',
      antiColor: '#CC6633', // Complementary
    },
    liquidity: {
      base: '#FFCC33', // Golden Amber (9)
      pastel: '#FFF0C1',
      neon: '#FFEE66',
      antiColor: '#3333CC', // Complementary
    },
    governance: {
      base: '#9933CC', // Quantum Purple (7)
      pastel: '#E6C1F2',
      neon: '#CC66FF',
      antiColor: '#33CC99', // Harmonic Green (8) - Complementary
    },
  },
  
  // Neon pulse colors (preserved and enhanced)
  neon: {
    pulse: {
      pink: '#FF1493',
      green: '#00FF00',
      blue: '#00BFFF',
      orange: '#FF4500',
      yellow: '#FFFF00',
    },
    trail: {
      pink: 'rgba(255, 20, 147, 0.5)', // 50% transparent pink
      green: 'rgba(0, 255, 0, 0.5)', // 50% transparent green
      blue: 'rgba(0, 191, 255, 0.5)', // 50% transparent blue
      orange: 'rgba(255, 69, 0, 0.5)', // 50% transparent orange
      yellow: 'rgba(255, 255, 0, 0.5)', // 50% transparent yellow
    },
  },
  
  // Accessibility variants
  accessibility: {
    deuteranopia: {
      six: '#3366FF', // Enhanced blue
      seven: '#9966CC', // Adjusted purple
      eight: '#33CCFF', // Blue-teal instead of green
      nine: '#FFCC33'  // Unchanged gold
    },
    protanopia: {
      six: '#3399CC', // Adjusted blue
      seven: '#9966CC', // Adjusted purple
      eight: '#33CCFF', // Blue-teal instead of green
      nine: '#FFDD33'  // Enhanced gold
    },
    tritanopia: {
      six: '#3366CC', // Unchanged blue
      seven: '#CC66CC', // Reddish purple
      eight: '#33CC66', // Yellower green
      nine: '#FFCC66'  // Lighter gold
    },
    highContrast: {
      six: '#0033CC', // Deeper blue
      seven: '#9900CC', // Deeper purple
      eight: '#00CC66', // Deeper green
      nine: '#FFCC00'  // Deeper gold
    }
  },
};

/**
 * Calculate pressure based on stability, rate, and offset variance
 * P = ST × R ± OV (as per specification)
 * 
 * @param {number} stabilityFactor - System stability (0-1)
 * @param {number} transitionRate - Rate of change (0-1) 
 * @param {number} offsetVariance - Variation from baseline (-1 to 1)
 * @returns {number} - Calculated pressure value (0-1)
 */
function calculatePressure(stabilityFactor, transitionRate, offsetVariance) {
  // Ensure inputs are within valid ranges
  stabilityFactor = clamp(stabilityFactor, 0, 1);
  transitionRate = clamp(transitionRate, 0, 1);
  offsetVariance = clamp(offsetVariance, -1, 1);
  
  // Calculate pressure using the formula P = ST × R ± OV
  return clamp(stabilityFactor * transitionRate + offsetVariance, 0, 1);
}

/**
 * Get intensity factor for gradient scaling based on offset
 * 
 * @param {number} offset - Corrective offset value (-1 to 1)
 * @returns {number} - Intensity factor (0-1)
 */
function getIntensityFactor(offset) {
  // Convert offset to absolute value and normalize to 0-1 range
  const absOffset = Math.abs(offset);
  
  // Apply golden ratio scaling for harmonic progression
  return clamp(absOffset * PHI, 0, 1);
}

/**
 * Generate chakra gradient based on intensity and chakra position
 * 
 * @param {string} chakraPosition - Position in chakra system (root, sacral, etc)
 * @param {number} intensityFactor - Intensity factor (0-1)
 * @returns {string} - CSS gradient value
 */
function getChakraGradient(chakraPosition, intensityFactor) {
  if (!PALETTES.chakra[chakraPosition]) {
    chakraPosition = 'heart'; // Default to heart chakra if invalid
  }
  
  const colors = PALETTES.chakra[chakraPosition];
  const darkWidth = 10 + (intensityFactor * 15); // Anti-edge border width 10-25px
  
  return `linear-gradient(135deg, 
    ${colors.soft} 0%, 
    ${colors.deep} ${50 + (intensityFactor * 25)}%, 
    ${colors.dark} 100%)`;
}

/**
 * Generate primary segment color with pastel fade based on system metrics
 * 
 * @param {string} segment - Functional segment (trading, liquidity, governance)
 * @param {number} pressure - System pressure value (0-1)
 * @returns {Object} - Color object with base, pastel fade, and anti-color values
 */
function getPrimarySegmentColors(segment, pressure) {
  if (!PALETTES.primary[segment]) {
    segment = 'trading'; // Default if invalid segment
  }
  
  const colors = PALETTES.primary[segment];
  const pastelOpacity = 0.3 + (pressure * 0.5); // 30-80% opacity
  
  return {
    base: colors.base,
    pastelFade: `rgba(${hexToRgb(colors.pastel)}, ${pastelOpacity})`,
    antiColor: colors.antiColor,
  };
}

/**
 * Generate neon pulse effect based on transition speed and pressure
 * 
 * @param {number} transitionSpeed - Speed of transition (0-1)
 * @param {number} pressure - System pressure value (0-1)
 * @returns {Object} - Neon pulse configuration with color, pulse rate, and trail
 */
function getNeonPulseEffect(transitionSpeed, pressure) {
  // Select neon color based on transition speed
  let pulseColor, trailColor;
  
  if (transitionSpeed < 0.2) {
    pulseColor = PALETTES.neon.pulse.blue;
    trailColor = PALETTES.neon.trail.blue;
  } else if (transitionSpeed < 0.5) {
    pulseColor = PALETTES.neon.pulse.green;
    trailColor = PALETTES.neon.trail.green;
  } else if (transitionSpeed < 0.8) {
    pulseColor = PALETTES.neon.pulse.orange;
    trailColor = PALETTES.neon.trail.orange;
  } else {
    pulseColor = PALETTES.neon.pulse.pink;
    trailColor = PALETTES.neon.trail.pink;
  }
  
  // Calculate pulse rate based on pressure (0.5s - 2s)
  const pulseRate = 2 - (pressure * 1.5);
  
  // Calculate brightness based on pressure (50% - 100%)
  const brightness = 50 + (pressure * 50);
  
  return {
    color: pulseColor,
    trailColor: trailColor,
    pulseRate: `${pulseRate}s`,
    brightness: `${brightness}%`,
    // CSS for pulse animation
    cssAnimation: `
      @keyframes neonPulse {
        0% { filter: brightness(100%) blur(0px); }
        50% { filter: brightness(${brightness}%) blur(2px); }
        100% { filter: brightness(100%) blur(0px); }
      }
    `,
    // CSS for applying the pulse
    cssApply: `animation: neonPulse ${pulseRate}s infinite;`
  };
}

/**
 * Generate CSS for animated overlay layers
 * 
 * @param {string} baseColor - Base layer color
 * @param {Object} slopeConfig - Configuration for slope gradient
 * @param {Object} motionConfig - Configuration for motion effects
 * @returns {string} - CSS for animated overlay
 */
function generateAnimatedOverlay(baseColor, slopeConfig, motionConfig) {
  return `
    background-color: ${baseColor};
    background-image: 
      linear-gradient(135deg, 
        rgba(${hexToRgb(slopeConfig.startColor)}, ${slopeConfig.opacity}) 0%,
        rgba(${hexToRgb(slopeConfig.midColor)}, ${slopeConfig.opacity * 0.7}) 50%,
        rgba(${hexToRgb(slopeConfig.endColor)}, ${slopeConfig.opacity}) 100%
      );
    box-shadow: 0 0 15px ${motionConfig.color};
    ${motionConfig.cssApply}
  `;
}

/**
 * Create a color-layered motion tracking visualization
 * 
 * @param {Object} metrics - System metrics object with stability, transition, pressure
 * @param {string} segment - Functional segment (trading, liquidity, governance)
 * @param {string} chakraPosition - Position in chakra system
 * @returns {Object} - Complete styling for motion tracking visualization
 */
function createColorLayeredMotionTracking(metrics, segment, chakraPosition) {
  const { stability, transitionSpeed, pressure } = metrics;
  
  // Calculate intensity based on stability
  const intensityFactor = getIntensityFactor(1 - stability);
  
  // Get chakra gradient
  const chakraGradient = getChakraGradient(chakraPosition, intensityFactor);
  
  // Get primary segment colors
  const segmentColors = getPrimarySegmentColors(segment, pressure);
  
  // Get neon pulse effect
  const neonEffect = getNeonPulseEffect(transitionSpeed, pressure);
  
  // Calculate anti-edge border width based on intensity
  const borderWidth = 1 + Math.round(intensityFactor * 5);
  
  return {
    // Base styles
    baseStyles: {
      background: chakraGradient,
      borderColor: segmentColors.antiColor,
      borderWidth: `${borderWidth}px`,
      borderStyle: 'solid',
      transition: 'all 0.3s ease',
    },
    
    // Neon effect styles
    neonStyles: {
      boxShadow: `0 0 ${Math.round(pressure * 20)}px ${neonEffect.color}`,
      animation: neonEffect.cssAnimation ? 'neonPulse' : '',
      animationDuration: neonEffect.pulseRate,
      animationIterationCount: 'infinite',
    },
    
    // Trail effect styles (for motion path)
    trailStyles: {
      backgroundColor: neonEffect.trailColor,
      opacity: 0.5 + (pressure * 0.5),
      transition: `opacity ${0.5 + (transitionSpeed * 1.5)}s ease`,
    },
    
    // Complete CSS animations
    animations: {
      neonPulse: neonEffect.cssAnimation,
    },
    
    // Motion tracking overlay
    overlayConfig: {
      baseColor: segmentColors.base,
      slope: {
        startColor: neonEffect.color,
        midColor: segmentColors.base,
        endColor: PALETTES.neon.pulse.yellow,
        opacity: 0.3 + (pressure * 0.3),
      },
      motion: neonEffect,
    },
    
    // Complete overlay CSS
    overlay: generateAnimatedOverlay(
      segmentColors.base,
      {
        startColor: neonEffect.color,
        midColor: segmentColors.base,
        endColor: PALETTES.neon.pulse.yellow,
        opacity: 0.3 + (pressure * 0.3),
      },
      neonEffect
    ),
  };
}

/**
 * Utility to convert hex color to RGB values
 * 
 * @param {string} hex - Hex color code
 * @returns {string} - RGB values as "r, g, b" string
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Utility to clamp values between min and max
 * 
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Clamped value
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a CSS variable set for the color system
 * 
 * @param {Object} metrics - System metrics
 * @param {Object} options - Configuration options
 * @returns {Object} - CSS variables object
 */
function generateColorSystemVariables(metrics, options = {}) {
  const { stability = 0.5, transitionSpeed = 0.3 } = metrics;
  const { segment = 'trading', chakraPosition = 'heart' } = options;
  
  // Calculate pressure
  const offsetVariance = (Math.random() * 0.4) - 0.2; // Random offset between -0.2 and 0.2
  const pressure = calculatePressure(stability, transitionSpeed, offsetVariance);
  
  // Get intensity factor
  const intensityFactor = getIntensityFactor(1 - stability);
  
  // Get all color systems
  const chakraColors = PALETTES.chakra[chakraPosition] || PALETTES.chakra.heart;
  const primaryColors = PALETTES.primary[segment] || PALETTES.primary.trading;
  
  // Generate CSS variables
  return {
    // Chakra colors
    '--chakra-soft': chakraColors.soft,
    '--chakra-deep': chakraColors.deep,
    '--chakra-dark': chakraColors.dark,
    
    // Primary colors
    '--primary-base': primaryColors.base,
    '--primary-pastel': primaryColors.pastel,
    '--primary-neon': primaryColors.neon,
    '--primary-anti': primaryColors.antiColor,
    
    // Calculated values
    '--system-pressure': pressure.toFixed(2),
    '--system-intensity': intensityFactor.toFixed(2),
    
    // Gradient and borders
    '--gradient-position': `${50 + (intensityFactor * 25)}%`,
    '--border-width': `${1 + Math.round(intensityFactor * 5)}px`,
    
    // Animation properties
    '--pulse-rate': `${2 - (pressure * 1.5)}s`,
    '--brightness': `${50 + (pressure * 50)}%`,
    
    // Neon glow
    '--neon-glow': `0 0 ${Math.round(pressure * 20)}px`,
    
    // Complete variables string (for direct application)
    cssVariables: `
      --chakra-soft: ${chakraColors.soft};
      --chakra-deep: ${chakraColors.deep};
      --chakra-dark: ${chakraColors.dark};
      --primary-base: ${primaryColors.base};
      --primary-pastel: ${primaryColors.pastel};
      --primary-neon: ${primaryColors.neon};
      --primary-anti: ${primaryColors.antiColor};
      --system-pressure: ${pressure.toFixed(2)};
      --system-intensity: ${intensityFactor.toFixed(2)};
      --gradient-position: ${50 + (intensityFactor * 25)}%;
      --border-width: ${1 + Math.round(intensityFactor * 5)}px;
      --pulse-rate: ${2 - (pressure * 1.5)}s;
      --brightness: ${50 + (pressure * 50)}%;
      --neon-glow: 0 0 ${Math.round(pressure * 20)}px;
    `
  };
}

/**
 * Animation timing constants based on sacred numbers
 */
const ANIMATION_TIMINGS = {
  quick: 600,       // 6
  standard: 700,    // 7
  emphasis: 800,    // 8
  sequence: 900     // 9
};

/**
 * Easing functions derived from golden ratio
 */
const EASING_FUNCTIONS = {
  goldenIn: 'cubic-bezier(0, 0.618, 0.382, 1)',
  goldenOut: 'cubic-bezier(0.618, 0, 1, 0.382)',
  goldenInOut: 'cubic-bezier(0.618, 0, 0.382, 1)'
};

/**
 * Get color by harmonic number (6, 7, 8, or 9)
 * 
 * @param {number} harmonic - Sacred number (6, 7, 8, or 9)
 * @param {string} format - Output format ('hex' or 'rgb')
 * @param {Object} options - Additional options (accessibility mode, etc)
 * @returns {string} - Color in requested format
 */
function getColorByHarmonic(harmonic, format = 'hex', options = {}) {
  // Map the harmonic to the palette key
  let harmonicKey;
  switch (harmonic) {
    case 6:
      harmonicKey = 'six';
      break;
    case 7:
      harmonicKey = 'seven';
      break;
    case 8:
      harmonicKey = 'eight';
      break;
    case 9:
      harmonicKey = 'nine';
      break;
    default:
      // Default to six if invalid harmonic
      harmonicKey = 'six';
  }
  
  // Check for accessibility mode
  const { accessibilityMode } = options;
  let palette = PALETTES.sacred;
  
  if (accessibilityMode && PALETTES.accessibility[accessibilityMode]) {
    palette = PALETTES.accessibility[accessibilityMode];
  }
  
  // Get the color
  const color = palette[harmonicKey];
  
  // Return in requested format
  if (format === 'rgb') {
    return `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
  }
  
  return color.hex;
}

/**
 * Generate a gradient between two harmonic colors
 * 
 * @param {number} startHarmonic - Starting harmonic number (6, 7, 8, or 9)
 * @param {number} endHarmonic - Ending harmonic number (6, 7, 8, or 9)
 * @param {number} steps - Number of steps in the gradient
 * @param {Object} options - Additional options (direction, accessibility mode)
 * @returns {string} - CSS gradient value
 */
function generateGradient(startHarmonic, endHarmonic, steps = 2, options = {}) {
  const { direction = '135deg', accessibilityMode } = options;
  
  // Get start and end colors in RGB format
  const startColor = hexToRgb(getColorByHarmonic(startHarmonic, 'hex', { accessibilityMode }));
  const endColor = hexToRgb(getColorByHarmonic(endHarmonic, 'hex', { accessibilityMode }));
  
  // Create gradient steps
  let gradientSteps = [];
  
  // Always include start color at 0%
  gradientSteps.push(`rgb(${startColor}) 0%`);
  
  // Add intermediate steps if more than 2 steps requested
  if (steps > 2) {
    for (let i = 1; i < steps - 1; i++) {
      const percentage = (i / (steps - 1)) * 100;
      const interpolatedColor = interpolateColors(
        startColor,
        endColor,
        i / (steps - 1)
      );
      gradientSteps.push(`rgb(${interpolatedColor}) ${percentage}%`);
    }
  }
  
  // Always include end color at 100%
  gradientSteps.push(`rgb(${endColor}) 100%`);
  
  // Return the complete gradient string
  return `linear-gradient(${direction}, ${gradientSteps.join(', ')})`;
}

/**
 * Get complementary color for a harmonic number
 * 
 * @param {number} harmonic - Harmonic number (6, 7, 8, or 9)
 * @param {string} format - Output format ('hex' or 'rgb')
 * @param {Object} options - Additional options
 * @returns {string} - Complementary color
 */
function getComplementaryColor(harmonic, format = 'hex', options = {}) {
  // Complementary pairs defined in the framework:
  // 6 (Solidarity Blue) ↔ 8 (Harmonic Green)
  // 7 (Quantum Purple) ↔ 9 (Golden Amber)
  
  let complementaryHarmonic;
  
  switch (harmonic) {
    case 6:
      complementaryHarmonic = 8;
      break;
    case 8:
      complementaryHarmonic = 6;
      break;
    case 7:
      complementaryHarmonic = 9;
      break;
    case 9:
      complementaryHarmonic = 7;
      break;
    default:
      complementaryHarmonic = harmonic === 6 ? 8 : 6; // Default complementary pair
  }
  
  return getColorByHarmonic(complementaryHarmonic, format, options);
}

/**
 * Get triadic colors for a harmonic number
 * 
 * @param {number} harmonic - Harmonic number (6, 7, 8, or 9)
 * @param {string} format - Output format ('hex' or 'rgb')
 * @param {Object} options - Additional options
 * @returns {Array} - Array of three colors forming a triad
 */
function getTriadicColors(harmonic, format = 'hex', options = {}) {
  // Triadic relationships:
  // Set 1: 6 (Blue) → 7 (Purple) → 8 (Green)
  // Set 2: 7 (Purple) → 8 (Green) → 9 (Amber)
  
  let triad = [];
  
  switch (harmonic) {
    case 6:
      triad = [6, 7, 8]; // Set 1
      break;
    case 7:
      triad = [7, 8, 9]; // Set 2
      break;
    case 8:
      triad = [8, 6, 7]; // Variant of Set 1
      break;
    case 9:
      triad = [9, 7, 8]; // Variant of Set 2
      break;
    default:
      triad = [6, 7, 8]; // Default to Set 1
  }
  
  return triad.map(h => getColorByHarmonic(h, format, options));
}

/**
 * Apply golden ratio transition to a color
 * 
 * @param {number} harmonic - Harmonic number (6, 7, 8, or 9)
 * @param {boolean} increase - Whether to multiply (true) or divide (false) by phi
 * @param {string} format - Output format ('hex' or 'rgb')
 * @returns {string} - Transformed color
 */
function applyGoldenRatioTransition(harmonic, increase = true, format = 'hex') {
  // Get the base color in RGB
  const baseColorRgb = hexToRgb(getColorByHarmonic(harmonic, 'hex'));
  const baseArray = baseColorRgb.split(',').map(Number);
  
  // Apply golden ratio transformation
  const transformedArray = baseArray.map(component => {
    // Apply phi multiplication or division
    const transformedValue = increase
      ? Math.round(component * PHI)
      : Math.round(component / PHI);
    
    // Clamp to valid RGB range (0-255)
    return clamp(transformedValue, 0, 255);
  });
  
  // Convert back to requested format
  if (format === 'rgb') {
    return `rgb(${transformedArray.join(', ')})`;
  }
  
  return rgbToHex(transformedArray);
}

/**
 * Get animation timing based on sacred number
 * 
 * @param {number} harmonic - Harmonic number (6, 7, 8, or 9)
 * @param {string} unit - Time unit ('ms' or 's')
 * @returns {string} - Animation timing with unit
 */
function getAnimationTiming(harmonic, unit = 'ms') {
  let timing;
  
  switch (harmonic) {
    case 6:
      timing = ANIMATION_TIMINGS.quick;
      break;
    case 7:
      timing = ANIMATION_TIMINGS.standard;
      break;
    case 8:
      timing = ANIMATION_TIMINGS.emphasis;
      break;
    case 9:
      timing = ANIMATION_TIMINGS.sequence;
      break;
    default:
      timing = ANIMATION_TIMINGS.standard;
  }
  
  if (unit === 's') {
    return `${timing / 1000}s`;
  }
  
  return `${timing}ms`;
}

/**
 * Get golden ratio easing function
 * 
 * @param {string} type - Easing type ('in', 'out', 'inOut')
 * @returns {string} - CSS cubic-bezier function
 */
function getGoldenEasing(type = 'inOut') {
  switch (type.toLowerCase()) {
    case 'in':
      return EASING_FUNCTIONS.goldenIn;
    case 'out':
      return EASING_FUNCTIONS.goldenOut;
    case 'inout':
    case 'in-out':
      return EASING_FUNCTIONS.goldenInOut;
    default:
      return EASING_FUNCTIONS.goldenInOut;
  }
}

/**
 * Generate a complete transition string with sacred timing and golden easing
 * 
 * @param {number} harmonic - Harmonic number for timing (6, 7, 8, or 9)
 * @param {string} properties - CSS properties to transition
 * @param {string} easingType - Easing type ('in', 'out', 'inOut')
 * @returns {string} - Complete CSS transition value
 */
function generateTransition(harmonic, properties = 'all', easingType = 'inOut') {
  const timing = getAnimationTiming(harmonic, 's');
  const easing = getGoldenEasing(easingType);
  
  return `${properties} ${timing} ${easing}`;
}

/**
 * Map system node to harmonic number
 * 
 * @param {number} node - System node (1, 3, 4, 7, 14, 21)
 * @returns {number} - Corresponding harmonic number
 */
function getHarmonicFromNode(node) {
  switch (node) {
    case 1:
    case 14:
      return 6;
    case 7:
      return 7;
    case 3:
    case 21:
      return 8;
    case 4:
      return 9;
    default:
      return 7; // Default to seven
  }
}

/**
 * Interpolate between two RGB colors
 * 
 * @param {Array|string} color1 - First RGB color
 * @param {Array|string} color2 - Second RGB color
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {string} - Interpolated RGB color as "r,g,b" string
 */
function interpolateColors(color1, color2, factor = 0.5) {
  // Convert string inputs to arrays if needed
  const rgb1 = Array.isArray(color1) 
    ? color1 
    : color1.split(',').map(Number);
  
  const rgb2 = Array.isArray(color2)
    ? color2
    : color2.split(',').map(Number);
  
  // Interpolate each component
  const result = rgb1.map((component, index) => {
    const diff = rgb2[index] - component;
    return Math.round(component + diff * factor);
  });
  
  return result.join(',');
}

/**
 * Convert RGB array to hex color
 * 
 * @param {Array|string} rgb - RGB values as array or comma-separated string
 * @returns {string} - Hex color code
 */
function rgbToHex(rgb) {
  // Convert string input to array if needed
  const rgbArray = Array.isArray(rgb)
    ? rgb
    : rgb.split(',').map(Number);
  
  // Convert each component to hex
  const hexArray = rgbArray.map(component => {
    const hex = component.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  });
  
  return `#${hexArray.join('')}`;
}

// Export all functions and constants
module.exports = {
  // Constants
  PALETTES,
  PHI,
  ANIMATION_TIMINGS,
  EASING_FUNCTIONS,
  
  // Sacred number color functions
  getColorByHarmonic,
  generateGradient,
  getComplementaryColor,
  getTriadicColors,
  applyGoldenRatioTransition,
  
  // Animation and transition functions
  getAnimationTiming,
  getGoldenEasing,
  generateTransition,
  
  // CSS generators
  generateColorSystemVariables,
  generateAnimatedOverlay,
  
  // System mapping functions
  getHarmonicFromNode,
  
  // Color utilities
  interpolateColors,
  rgbToHex,
  hexToRgb,
  clamp,
  
  // Legacy support for original colorMapping.js
  calculatePressure,
  getIntensityFactor,
  getChakraGradient,
  getPrimarySegmentColors,
  getNeonPulseEffect,
  createColorLayeredMotionTracking,
};