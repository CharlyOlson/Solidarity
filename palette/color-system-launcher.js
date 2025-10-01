/**
 * Color System Launcher
 * 
 * This file provides a simple way to test and demonstrate the
 * color palette system in the Solidarity Platform.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Generate demo HTML file
const demoHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solidarity Color System Demo</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-inline-size: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      margin-block-end: 30px;
    }
    .demos {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-block-end: 30px;
    }
    .demo-card {
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    .demo-card:hover {
      transform: translateY(-5px);
    }
    .demo-card h3 {
      margin-block-start: 0;
    }
    .demo-card.primary {
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
    }
    .demo-card.secondary {
      background: linear-gradient(135deg, #9b59b6, #8e44ad);
      color: white;
    }
    .demo-card.tertiary {
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      color: white;
    }
    .demo-card.quaternary {
      background: linear-gradient(135deg, #f1c40f, #f39c12);
      color: white;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: white;
      color: #333;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
      margin-block-start: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    footer {
      text-align: center;
      margin-block-start: 50px;
      padding-block-start: 20px;
      border-block-start: 1px solid #eee;
      color: #777;
    }
    #color-motion {
      block-size: 300px;
      border: 1px solid #ddd;
      border-radius: 8px;
      position: relative;
      overflow: hidden;
      margin-block-end: 30px;
    }
    .cursor {
      inline-size: 40px;
      block-size: 40px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(52,152,219,1) 0%, rgba(41,128,185,1) 100%);
      position: absolute;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 15px rgba(52,152,219,0.5);
      z-index: 10;
    }
    .info-panel {
      position: absolute;
      inset-inline-end: 20px;
      inset-block-start: 20px;
      padding: 15px;
      background-color: rgba(0,0,0,0.7);
      color: white;
      border-radius: 8px;
      font-family: monospace;
      font-size: 14px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <h1>Solidarity Platform Color System</h1>
  
  <div class="demos">
    <div class="demo-card primary">
      <h3>Color Palette Demo</h3>
      <p>See the core color palette system in action with real-time pressure sensitivity.</p>
      <a href="/colorPaletteDemo.html" class="btn">View Demo</a>
    </div>
    <div class="demo-card secondary">
      <h3>Comprehensive System Demo</h3>
      <p>Experience the full integration with motion tracking and existing utilities.</p>
      <a href="/comprehensiveDemo.html" class="btn">View Demo</a>
    </div>
    <div class="demo-card tertiary">
      <h3>API Reference</h3>
      <p>Explore the color system API and learn how to integrate it into your components.</p>
      <a href="/apiReference.html" class="btn">View API</a>
    </div>
    <div class="demo-card quaternary">
      <h3>Documentation</h3>
      <p>Read detailed documentation about the color system architecture and implementation.</p>
      <a href="/docs" class="btn">View Docs</a>
    </div>
  </div>
  
  <h2>Interactive Demo</h2>
  <p>Move your mouse in the area below to see the color system respond to motion:</p>
  
  <div id="color-motion">
    <div class="cursor" id="cursor"></div>
    <div class="info-panel" id="info-panel">
      <div>Position: <span id="position">0, 0</span></div>
      <div>Velocity: <span id="velocity">0, 0</span></div>
      <div>Pressure: <span id="pressure">0%</span></div>
    </div>
  </div>
  
  <script>
    // Simple motion tracking demo
    document.addEventListener('DOMContentLoaded', function() {
      const colorMotion = document.getElementById('color-motion');
      const cursor = document.getElementById('cursor');
      const infoPanel = document.getElementById('info-panel');
      const positionDisplay = document.getElementById('position');
      const velocityDisplay = document.getElementById('velocity');
      const pressureDisplay = document.getElementById('pressure');
      
      let lastX = 0;
      let lastY = 0;
      let velocityX = 0;
      let velocityY = 0;
      
      // Golden ratio for color calculations
      const phi = 1.618033988749895;
      
      colorMotion.addEventListener('mousemove', function(e) {
        const rect = colorMotion.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate velocity
        velocityX = x - lastX;
        velocityY = y - lastY;
        
        // Calculate pressure based on velocity magnitude
        const speed = Math.sqrt(velocityX*velocityX + velocityY*velocityY);
        const normalizedSpeed = Math.min(1, speed / 30);
        
        // Apply golden ratio to pressure calculation
        const pressure = normalizedSpeed * (1 / phi) + normalizedSpeed * 0.5;
        
        // Update cursor position and style
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
        
        // Use pressure to adjust colors
        const hue = (Date.now() / 50) % 360;
        const saturation = 70 + pressure * 30;
        const lightness = 50 + pressure * 20;
        
        // Update cursor style
        cursor.style.background = \`radial-gradient(circle, 
          hsl(\${hue}, \${saturation}%, \${lightness}%) 0%, 
          hsl(\${hue}, \${saturation-10}%, \${lightness-20}%) 100%)\`;
        
        cursor.style.boxShadow = \`0 0 \${15 + pressure * 20}px hsl(\${hue}, \${saturation}%, \${lightness}%, 0.5)\`;
        cursor.style.transform = \`translate(-50%, -50%) scale(\${1 + pressure * 0.5})\`;
        
        // Update display
        positionDisplay.textContent = \`\${Math.round(x)}, \${Math.round(y)}\`;
        velocityDisplay.textContent = \`\${Math.round(velocityX)}, \${Math.round(velocityY)}\`;
        pressureDisplay.textContent = \`\${Math.round(pressure * 100)}%\`;
        
        // Remember last position
        lastX = x;
        lastY = y;
      });
      
      colorMotion.addEventListener('mouseleave', function() {
        velocityX = 0;
        velocityY = 0;
      });
    });
  </script>
  
  <h2>Getting Started</h2>
  <p>
    To use the color palette system in your components, import the ThemeProvider and hooks:
  </p>
  
  <pre style="background-color: #f5f5f5; padding-block: 20px; padding-inline: 20px; border-radius: 8px; overflow-x: auto;">
import { ThemeProvider, useColorPalette, useColorShading } from './palette/ColorPaletteSystemWithTypes';
import { useIntegratedColorSystem } from './palette/ColorSystemIntegration';

// Wrap your app with the ThemeProvider
&lt;ThemeProvider>
  &lt;YourApp />
&lt;/ThemeProvider>

// Use the hooks in your components
function YourComponent() {
  const { palette, pressureResult } = useColorPalette();
  const { getDynamicShade } = useColorShading();
  
  // Create dynamic colors based on system pressure
  const buttonColor = getDynamicShade(palette.primary, 50 + pressureResult * 20);
  
  return (
    &lt;button style={{ backgroundColor: buttonColor }}>
      Dynamic Button
    &lt;/button>
  );
}
  </pre>
  
  <footer>
    Solidarity Platform Color System | &copy; 2023
  </footer>
</body>
</html>
`;

// Write demo HTML to public folder
fs.writeFileSync(path.join(publicDir, 'index.html'), demoHtml);

// API endpoints
app.get('/api/colors', (req, res) => {
  // Return example color palette
  const palette = {
    primary: {
      10: '#E3F2FD',
      20: '#BBDEFB',
      30: '#90CAF9',
      40: '#64B5F6',
      50: '#42A5F5',
      60: '#2196F3',
      70: '#1E88E5',
      80: '#1976D2',
      90: '#1565C0',
      100: '#0D47A1'
    },
    trading: {
      10: '#E0F7FA',
      20: '#B2EBF2',
      30: '#80DEEA',
      40: '#4DD0E1',
      50: '#26C6DA',
      60: '#00BCD4',
      70: '#00ACC1',
      80: '#0097A7',
      90: '#00838F',
      100: '#006064'
    },
    governance: {
      10: '#E8F5E9',
      20: '#C8E6C9',
      30: '#A5D6A7',
      40: '#81C784',
      50: '#66BB6A',
      60: '#4CAF50',
      70: '#43A047',
      80: '#388E3C',
      90: '#2E7D32',
      100: '#1B5E20'
    },
    liquidity: {
      10: '#FFF8E1',
      20: '#FFECB3',
      30: '#FFE082',
      40: '#FFD54F',
      50: '#FFCA28',
      60: '#FFC107',
      70: '#FFB300',
      80: '#FFA000',
      90: '#FF8F00',
      100: '#FF6F00'
    },
    neon: {
      10: '#F3E5F5',
      20: '#E1BEE7',
      30: '#CE93D8',
      40: '#BA68C8',
      50: '#AB47BC',
      60: '#9C27B0',
      70: '#8E24AA',
      80: '#7B1FA2',
      90: '#6A1B9A',
      100: '#4A148C'
    },
    chakra: {
      10: '#E8EAF6',
      20: '#C5CAE9',
      30: '#9FA8DA',
      40: '#7986CB',
      50: '#5C6BC0',
      60: '#3F51B5',
      70: '#3949AB',
      80: '#303F9F',
      90: '#283593',
      100: '#1A237E'
    }
  };
  
  res.json(palette);
});

// Dynamic metrics simulation
app.get('/api/metrics', (req, res) => {
  // Simulate changing system metrics
  const now = Date.now();
  
  const metrics = {
    pressure: 0.5 + Math.sin(now * 0.0003) * 0.3,
    stability: 0.3 + Math.cos(now * 0.0007) * 0.3,
    transition: 0.2 + Math.sin(now * 0.001) * 0.2
  };
  
  res.json(metrics);
});

// Start the server
app.listen(PORT, () => {
  console.log(`
=======================================================
🎨 Solidarity Platform Color System Demo
=======================================================

🌐 Server running at http://localhost:${PORT}

Available demos:
- Color Palette Demo: http://localhost:${PORT}/colorPaletteDemo.html
- Comprehensive System Demo: http://localhost:${PORT}/comprehensiveDemo.html
- API Reference: http://localhost:${PORT}/apiReference.html
- Documentation: http://localhost:${PORT}/docs

Press Ctrl+C to stop the server
`);
});