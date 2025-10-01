# Quick Setup Guide: Chakra-Inspired Color Palette System

This guide helps you quickly set up and integrate the new color palette system with your Solidarity Platform application.

## Installation

1. Ensure you have React 19.1.0 or higher and TypeScript support in your project.

2. Install required dependencies if not already present:

```bash
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
```

## Integration Steps

### 1. Add the Color Palette System to Your Application

Copy the following files to your project:

- `palette/colorPalette.ts` - Core types and default values
- `palette/ColorPaletteContext.tsx` - React Context provider
- `palette/useColorShading.ts` - Color utility hooks
- `palette/ThemeProvider.tsx` - Theme integration component

### 2. Wrap Your Application with the ThemeProvider

Modify your application's entry point:

```jsx
// src/index.js or App.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './palette/ThemeProvider';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### 3. Use the Color Palette in Your Components

```jsx
// Example component
import React from 'react';
import { useColorPalette } from './palette/ColorPaletteContext';
import { useColorShading } from './palette/useColorShading';

function MyComponent() {
  const { palette } = useColorPalette();
  const { getDynamicShade } = useColorShading();
  
  const primaryColor = getDynamicShade(palette.primary, 50);
  const secondaryColor = getDynamicShade(palette.governance, 70);
  
  return (
    <div style={{ backgroundColor: primaryColor, padding: '20px' }}>
      <h2 style={{ color: secondaryColor }}>
        Dynamic Color Component
      </h2>
      <p>This component uses the chakra color system.</p>
    </div>
  );
}
```

### 4. Connect with System Metrics

To make the colors respond to system events:

```jsx
import React from 'react';
import { useColorPalette } from './palette/ColorPaletteContext';

function SystemMonitor() {
  const { updateSystemMetrics } = useColorPalette();
  
  // Example function that could be called from your system monitoring logic
  function onSystemMetricsChanged(metrics) {
    updateSystemMetrics(
      metrics.stability,    // 0-1 value
      metrics.transition,   // 0-1 value
      metrics.offset        // 0-1 value
    );
  }
  
  return null; // This component just connects system events to the palette
}
```

### 5. Integrate with Existing Color Utilities

Use the adapter provided in `ColorSystemIntegration.js`:

```jsx
import { useIntegratedColorSystem } from './palette/ColorSystemIntegration';

function VisualizationComponent({ motionData }) {
  const integratedColors = useIntegratedColorSystem();
  
  // This uses both the new palette and existing color utilities
  const visualizer = integratedColors.applyPaletteToMotionVisualization(motionData);
  
  // Rest of your visualization logic...
}
```

## Customizing the Color Palette

To customize the default palette:

```jsx
// Create a custom palette
import { defaultPalette } from './palette/colorPalette';

const customPalette = {
  ...defaultPalette,
  primary: {
    ...defaultPalette.primary,
    50: '#3f51b5', // Custom primary color
    60: '#303f9f'
  },
  // Add other customizations
};

// Use custom palette in the ThemeProvider
<ThemeProvider initialPalette={customPalette}>
  <App />
</ThemeProvider>
```

## Testing the System

Check out `ColorPaletteDemo.jsx` for a complete example that demonstrates:

1. Dynamic color responses to system metrics
2. Interactive controls for pressure, stability, and transitions
3. Different color schemes and base levels
4. Pressure visualization components

Run the demo component to see the chakra-inspired gradient system in action.

## Next Steps

- Explore the `ExampleComponents.jsx` file for more usage patterns
- Read the full `README.md` for detailed documentation
- Check `ColorSystemIntegration.js` for integrating with existing utilities