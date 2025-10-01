# Solidarity Platform - Chakra-Inspired Color Palette System

This system implements a dynamic, chakra-inspired gradient color palette for the Solidarity Platform. The palette responds in real-time to system pressure, stability, and movement metrics, creating an immersive visual language for the application.

## Key Features

- **Chakra-Inspired Gradients**: Soft pastels for new shifts and deep tones for core layers
- **Functional Color Segments**: Primary colors for different functional pillars (Trading, Liquidity, Governance)
- **Neon Plasma Highlights**: Dynamic neon accents that respond to movement and transitions
- **Dynamic Intensity Scaling**: Colors that adapt to system pressure and stability
- **Layer-Based Motion Tracking**: Visual feedback based on user interaction and system state

## System Architecture

The color palette system is built using React Context for state management and consists of several key components:

1. **Color Palette Types** (`colorPalette.ts`):
   - TypeScript interfaces for color shades and palette structure
   - Default palette values with chakra-inspired colors
   - Utility functions for calculating intensity and pressure

2. **Color Context** (`ColorPaletteContext.tsx`):
   - React Context for sharing palette state across components
   - Provider component with state management
   - Utility functions for updating colors and system metrics

3. **Color Shading Hook** (`useColorShading.ts`):
   - Custom hook for accessing dynamic color shades
   - Utility functions for creating transition effects and neon pulses
   - Color blending and mathematical formulas for visual effects

4. **Theme Provider** (`ThemeProvider.tsx`):
   - Integration component that connects system metrics to the color palette
   - Optional system data source subscription for real-time updates

## Usage Examples

### Basic Setup

```jsx
import React from 'react';
import { ThemeProvider } from './palette/ThemeProvider';
import App from './App';

function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default Root;
```

### Using Color Palette in Components

```jsx
import React from 'react';
import { useColorPalette } from './palette/ColorPaletteContext';
import { useColorShading } from './palette/useColorShading';

function MyComponent() {
  const { palette, pressureResult } = useColorPalette();
  const { getDynamicShade, getNeonPulse } = useColorShading();
  
  // Get a dynamic color shade based on system pressure
  const backgroundColor = getDynamicShade(palette.primary, 50);
  
  // Create a neon highlight effect
  const highlightColor = getNeonPulse(backgroundColor, palette.neon[60], pressureResult);
  
  return (
    <div style={{ 
      backgroundColor, 
      boxShadow: `0 0 12px ${highlightColor}` 
    }}>
      <h2>Dynamic Color Component</h2>
      <p>This component uses dynamic colors from the palette.</p>
    </div>
  );
}
```

### Updating System Metrics

```jsx
import React from 'react';
import { useColorPalette } from './palette/ColorPaletteContext';

function MetricsControl() {
  const { updateSystemMetrics } = useColorPalette();
  
  const handleUserInteraction = (e) => {
    const x = e.clientX / window.innerWidth; // 0-1 value
    
    updateSystemMetrics(
      0.5,  // stability (0-1)
      0.3,  // transition rate (0-1)
      x     // pressure offset (0-1)
    );
  };
  
  return (
    <div 
      onMouseMove={handleUserInteraction}
      style={{ height: '200px', border: '1px solid #ccc' }}
    >
      Move mouse to update system metrics
    </div>
  );
}
```

## Integration with System Metrics

The color palette system can connect to real-time system metrics by providing a data source to the ThemeProvider:

```jsx
import React from 'react';
import { ThemeProvider } from './palette/ThemeProvider';
import App from './App';
import { systemMetricsMonitor } from './services/systemMonitoring';

function Root() {
  return (
    <ThemeProvider systemDataSource={systemMetricsMonitor}>
      <App />
    </ThemeProvider>
  );
}
```

## Example Components

The system includes example components to demonstrate the color palette in action:

1. **GradientCard**: A card component that showcases dynamic chakra gradients
2. **ColorPressureIndicator**: A visual indicator that displays system pressure and stability

See `ExampleComponents.jsx` and `ColorPaletteDemo.jsx` for implementation details and usage examples.

## Mathematical Formulas

The system uses several key formulas for color calculations:

### Intensity Factor

```javascript
function calculateIntensityFactor(offset) {
  // Golden Ratio-based calculation (φ = 1.618033988749895)
  const phi = 1.618033988749895;
  const normalizedOffset = offset * 2 - 1; // Convert 0-1 to -1 to 1
  return 0.5 + 0.5 * Math.sin(normalizedOffset * phi * Math.PI);
}
```

### Pressure Computation

```javascript
function computePressure(stability, transition, offset) {
  // Mathematical formula combining stability and transition rate
  const normalizedStability = Math.max(0, Math.min(1, stability));
  const normalizedTransition = Math.max(0, Math.min(1, transition));
  
  // Phi-weighted formula (φ = 1.618033988749895)
  const phi = 1.618033988749895;
  const pressureBase = normalizedStability * (1 - normalizedTransition * 0.5);
  const pressureModulator = Math.sin(phi * Math.PI * offset) * 0.2;
  
  return Math.max(0, Math.min(1, pressureBase + pressureModulator));
}
```

## Extending the System

To extend the color palette with new colors or functionality:

1. Update the `Palette` interface in `colorPalette.ts`
2. Add new color sets to the `defaultPalette` object
3. Create custom hooks or components that use the `useColorPalette` hook

## TypeScript Support

The system is built with TypeScript for type safety. Key types include:

- `ColorShades`: A record of color shade values (0-100)
- `Palette`: The full color palette structure with all color categories
- `ColorPaletteContextType`: The React Context type with palette state and functions

## Performance Considerations

- The system uses React's `useCallback` and `useState` for efficient updates
- Color calculations are optimized for runtime performance
- For large applications, consider memoizing components that use the color palette