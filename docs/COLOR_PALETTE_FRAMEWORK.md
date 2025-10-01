# Dynamic Color Palette Framework

## Overview

The Dynamic Color Palette Framework provides a consistent, mathematically-derived color system for the Solidarity platform. The system generates harmonious color relationships based on the sacred numeric sequence (6-7-8-9) and golden ratio (φ) principles.

## Core Color System

### Primary Palette

| Color Name | Hex Code | RGB Values | Sacred Number |
|------------|----------|------------|---------------|
| Solidarity Blue | #3366CC | rgb(51, 102, 204) | 6 |
| Quantum Purple | #9933CC | rgb(153, 51, 204) | 7 |
| Harmonic Green | #33CC99 | rgb(51, 204, 153) | 8 |
| Golden Amber | #FFCC33 | rgb(255, 204, 51) | 9 |

### Secondary Palette (Derived via Golden Ratio)

| Color Name | Hex Code | RGB Values | Derivation |
|------------|----------|------------|------------|
| Deep Ocean | #1A3366 | rgb(26, 51, 102) | Blue × φ⁻¹ |
| Lavender Mist | #CC99FF | rgb(204, 153, 255) | Purple × φ |
| Emerald Light | #66FFCC | rgb(102, 255, 204) | Green × φ |
| Sunset Gold | #FFAA00 | rgb(255, 170, 0) | Amber × φ⁻¹ |

## Implementation

The color system is implemented through the following components:

1. **Color Mapping Utility**: `src/utils/colorMapping.js`
2. **SCSS Variables**: `styles/variables/_colors.scss`
3. **Gradient Generation**: `src/utils/gradientGenerator.js`

### Example Usage

```javascript
// Import the color mapping utility
const { getColorByHarmonic, generateGradient } = require('../utils/colorMapping');

// Get a specific color from the system
const primaryBlue = getColorByHarmonic(6); // Returns #3366CC

// Generate a gradient between two harmonic colors
const blueToGreenGradient = generateGradient(6, 8, 5); // 5-step gradient from blue to green
```

## Harmonic Color Relationships

### Complementary Pairs

- Solidarity Blue (#3366CC) ↔ Harmonic Green (#33CC99)
- Quantum Purple (#9933CC) ↔ Golden Amber (#FFCC33)

### Triadic Relationships

- Set 1: Blue (#3366CC) → Purple (#9933CC) → Green (#33CC99)
- Set 2: Purple (#9933CC) → Green (#33CC99) → Amber (#FFCC33)

### Golden Mean Transitions

Each color can be transitioned to another using the golden ratio (φ ≈ 1.618) as the transition factor, ensuring mathematical harmony in all color blends.

## Motion & Animation Guidelines

### Timing Constants

Animation timings follow the sacred number sequence:

- Quick transition: 600ms (6)
- Standard transition: 700ms (7)
- Emphasis transition: 800ms (8)
- Full sequence transition: 900ms (9)

### Easing Functions

Custom easing functions derived from the golden ratio:

```scss
// SCSS implementation
$ease-golden-in: cubic-bezier(0, 0.618, 0.382, 1);
$ease-golden-out: cubic-bezier(0.618, 0, 1, 0.382);
$ease-golden-inout: cubic-bezier(0.618, 0, 0.382, 1);
```

## Accessibility Considerations

All color combinations meet WCAG 2.1 AA standards for contrast. Alternative color modes are available for:

- Deuteranopia (green-blind)
- Protanopia (red-blind)
- Tritanopia (blue-blind)
- High contrast mode

## Dynamic Adaptation

The color system dynamically adapts based on:

1. User preferences
2. Time of day
3. Geographic location
4. Current system node (1, 3, 4, 7, 14, 21)
5. Active ZIP phrase context

Colors subtly shift while maintaining mathematical relationships to enhance user experience without disruption.