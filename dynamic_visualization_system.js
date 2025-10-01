/**
 * Dynamic Color Palette and Animated Motion Overlay System
 * 
 * This file demonstrates the chakra-inspired gradient palette with motion
 * tracking visualization using HTML5 Canvas.
 */

const chakraSystem = require('../src/utils/chakraColorSystem');
const colorUtils = require('../src/utils/colorUtils');
const fs = require('fs');
const path = require('path');

// Class to manage the visualization system
class DynamicVisualizationSystem {
  constructor() {
    this.trendPoints = [];
    this.transitions = [];
    this.currentState = {
      x: 200,
      y: 200,
      intensity: 0.5,
      color: 'blue',
      pressureResult: 0,
      stabilityScore: 0
    };
    this.animationFrame = null;
    this.cssVariables = chakraSystem.generateCSSVariables();
  }

  /**
   * Generate HTML for visualization demo
   * @returns {string} - HTML content
   */
  generateHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solidarity - Dynamic Color Palette & Motion Overlay</title>
    <style>
        ${this.cssVariables}
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
            color: #f0f0f0;
        }
        
        .container {
            display: flex;
            flex-direction: column;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            margin-bottom: 20px;
            padding: 10px;
            background: linear-gradient(90deg, var(--core-purple), var(--core-indigo));
            border-radius: 5px;
        }
        
        h1 {
            margin: 0;
            color: white;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
        
        .visualization-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .visualization-panel {
            flex: 1;
            min-width: 300px;
            background-color: #222;
            border-radius: 5px;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .panel-title {
            margin-top: 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #444;
            color: #ddd;
        }
        
        .canvas-container {
            position: relative;
            margin-top: 15px;
            background-color: #111;
            border-radius: 5px;
            overflow: hidden;
        }
        
        canvas {
            display: block;
            width: 100%;
        }
        
        .controls {
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        button {
            background-color: var(--core-indigo);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: var(--core-purple);
        }
        
        .color-sample {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .color-chip {
            width: 50px;
            height: 50px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .color-chip span {
            font-size: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 2px 5px;
            border-radius: 3px;
        }
        
        .metrics {
            margin-top: 15px;
            font-family: monospace;
            background-color: #333;
            padding: 10px;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .metrics-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #ddd;
        }
        
        .metric-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            border-bottom: 1px solid #444;
        }
        
        .tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            z-index: 100;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Solidarity - Dynamic Color Palette & Motion Overlay</h1>
        </header>
        
        <div class="visualization-container">
            <div class="visualization-panel">
                <h2 class="panel-title">Core Application Blocks</h2>
                <div class="canvas-container">
                    <canvas id="blocksCanvas" width="400" height="300"></canvas>
                </div>
                <div class="controls">
                    <button id="animateBlocksBtn">Animate Blocks</button>
                </div>
            </div>
            
            <div class="visualization-panel">
                <h2 class="panel-title">Chakra Growth Transition</h2>
                <div class="canvas-container">
                    <canvas id="chakraCanvas" width="400" height="300"></canvas>
                </div>
                <div class="controls">
                    <button id="transitionBtn">Trigger Transition</button>
                    <button id="correctionBtn">Trigger Correction</button>
                </div>
                <div class="metrics">
                    <div class="metrics-title">Transition Metrics</div>
                    <div class="metric-row">
                        <span>Pressure Result:</span>
                        <span id="pressureValue">0.00</span>
                    </div>
                    <div class="metric-row">
                        <span>Stability Score:</span>
                        <span id="stabilityValue">0.00</span>
                    </div>
                    <div class="metric-row">
                        <span>Offset Strength:</span>
                        <span id="offsetValue">0.50</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="visualization-panel">
            <h2 class="panel-title">Trend Analysis & Movement Points</h2>
            <div class="canvas-container">
                <canvas id="trendCanvas" width="800" height="200"></canvas>
                <div id="tooltip" class="tooltip"></div>
            </div>
            <div class="controls">
                <button id="addTrendBtn">Add Trend Point</button>
                <button id="clearTrendBtn">Clear Trends</button>
            </div>
        </div>
        
        <div class="visualization-panel">
            <h2 class="panel-title">Color Palette Reference</h2>
            <h3>Pastel Growth Hues</h3>
            <div class="color-sample" id="pastelColors"></div>
            
            <h3>Deep Core Tones</h3>
            <div class="color-sample" id="coreColors"></div>
            
            <h3>Dark Anti-Color Edges</h3>
            <div class="color-sample" id="antiColors"></div>
            
            <h3>Neon Pulse Colors</h3>
            <div class="color-sample" id="neonColors"></div>
        </div>
    </div>
    
    <script>
        // Chakra color definitions
        const CHAKRA_COLORS = ${JSON.stringify(chakraSystem.CHAKRA_COLORS, null, 2)};
        
        // Animation utilities
        ${chakraSystem.generateNeonPulseAnimationCode()}
        
        // Initialize visualization
        document.addEventListener('DOMContentLoaded', function() {
            // Set up color palette reference
            function setupColorPalette() {
                const pastelContainer = document.getElementById('pastelColors');
                const coreContainer = document.getElementById('coreColors');
                const antiContainer = document.getElementById('antiColors');
                const neonContainer = document.getElementById('neonColors');
                
                function createColorChip(color, name, container) {
                    const chip = document.createElement('div');
                    chip.className = 'color-chip';
                    chip.style.backgroundColor = color;
                    
                    const label = document.createElement('span');
                    label.textContent = name;
                    chip.appendChild(label);
                    
                    container.appendChild(chip);
                }
                
                // Add pastel colors
                Object.entries(CHAKRA_COLORS.pastel).forEach(([name, color]) => {
                    createColorChip(color, name, pastelContainer);
                });
                
                // Add core colors
                Object.entries(CHAKRA_COLORS.core).forEach(([name, color]) => {
                    createColorChip(color, name, coreContainer);
                });
                
                // Add anti colors
                Object.entries(CHAKRA_COLORS.antiColor).forEach(([name, color]) => {
                    createColorChip(color, name, antiContainer);
                });
                
                // Add neon colors
                Object.entries(CHAKRA_COLORS.neon).forEach(([name, color]) => {
                    createColorChip(color, name, neonContainer);
                });
            }
            
            // Set up blocks canvas
            function setupBlocksCanvas() {
                const canvas = document.getElementById('blocksCanvas');
                const ctx = canvas.getContext('2d');
                
                // Draw the three core blocks
                function drawBlocks() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    const blockWidth = 100;
                    const blockHeight = 80;
                    const margin = 20;
                    
                    // Red block
                    ctx.fillStyle = CHAKRA_COLORS.blocks.red;
                    ctx.fillRect(margin, margin, blockWidth, blockHeight);
                    
                    // Yellow block
                    ctx.fillStyle = CHAKRA_COLORS.blocks.yellow;
                    ctx.fillRect(margin + blockWidth + margin, margin, blockWidth, blockHeight);
                    
                    // Blue block
                    ctx.fillStyle = CHAKRA_COLORS.blocks.blue;
                    ctx.fillRect(margin + (blockWidth + margin) * 2, margin, blockWidth, blockHeight);
                    
                    // Watermark projections (30% opacity)
                    ctx.globalAlpha = 0.3;
                    ctx.fillStyle = CHAKRA_COLORS.pastel.pink;
                    ctx.beginPath();
                    ctx.arc(margin + blockWidth/2, margin + blockHeight + 40, 30, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    ctx.fillStyle = CHAKRA_COLORS.pastel.yellow;
                    ctx.beginPath();
                    ctx.arc(margin + blockWidth + margin + blockWidth/2, margin + blockHeight + 40, 30, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    ctx.fillStyle = CHAKRA_COLORS.pastel.blue;
                    ctx.beginPath();
                    ctx.arc(margin + (blockWidth + margin) * 2 + blockWidth/2, margin + blockHeight + 40, 30, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    ctx.globalAlpha = 1.0;
                    
                    // Block labels
                    ctx.fillStyle = 'white';
                    ctx.font = '14px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('RED', margin + blockWidth/2, margin + blockHeight + 15);
                    ctx.fillText('YELLOW', margin + blockWidth + margin + blockWidth/2, margin + blockHeight + 15);
                    ctx.fillText('BLUE', margin + (blockWidth + margin) * 2 + blockWidth/2, margin + blockHeight + 15);
                }
                
                // Animate blocks with neon pulse
                document.getElementById('animateBlocksBtn').addEventListener('click', function() {
                    drawBlocks();
                    
                    // Animate neon pulse for each block
                    setTimeout(() => {
                        animateNeonPulse(ctx, margin + blockWidth/2, margin + blockHeight/2, CHAKRA_COLORS.neon.pink);
                    }, 200);
                    
                    setTimeout(() => {
                        animateNeonPulse(ctx, margin + blockWidth + margin + blockWidth/2, margin + blockHeight/2, CHAKRA_COLORS.neon.yellow);
                    }, 700);
                    
                    setTimeout(() => {
                        animateNeonPulse(ctx, margin + (blockWidth + margin) * 2 + blockWidth/2, margin + blockHeight/2, CHAKRA_COLORS.neon.blue);
                    }, 1200);
                });
                
                // Initial draw
                drawBlocks();
            }
            
            // Set up chakra transition canvas
            function setupChakraCanvas() {
                const canvas = document.getElementById('chakraCanvas');
                const ctx = canvas.getContext('2d');
                
                let intensity = 0.5;
                let pressureResult = 0;
                let stabilityScore = 0;
                let animating = false;
                
                function updateMetrics() {
                    document.getElementById('pressureValue').textContent = pressureResult.toFixed(2);
                    document.getElementById('stabilityValue').textContent = stabilityScore.toFixed(2);
                    document.getElementById('offsetValue').textContent = intensity.toFixed(2);
                }
                
                // Draw the chakra growth visualization
                function drawChakraViz() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const maxRadius = 100;
                    
                    // Outer circle - pastel
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = CHAKRA_COLORS.pastel.blue;
                    ctx.fill();
                    
                    // Middle circle - interpolated
                    const middleRadius = maxRadius * 0.75;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, middleRadius, 0, 2 * Math.PI);
                    // Interpolate between pastel and core based on intensity
                    const middleColor = intensity < 0.5 
                        ? CHAKRA_COLORS.pastel.blue
                        : CHAKRA_COLORS.core.indigo;
                    ctx.fillStyle = middleColor;
                    ctx.fill();
                    
                    // Inner circle - core
                    const innerRadius = maxRadius * 0.5 * intensity;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = CHAKRA_COLORS.core.indigo;
                    ctx.fill();
                    
                    // Draw anti-color border if intensity > 0.75
                    if (intensity > 0.75) {
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, maxRadius, 0, 2 * Math.PI);
                        ctx.strokeStyle = CHAKRA_COLORS.antiColor.blue;
                        ctx.lineWidth = 4;
                        ctx.stroke();
                    }
                    
                    // Draw metrics
                    ctx.fillStyle = 'white';
                    ctx.font = '14px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(\`Intensity: \${intensity.toFixed(2)}\`, centerX, centerY - 15);
                    ctx.fillText(\`Pressure: \${pressureResult.toFixed(2)}\`, centerX, centerY + 5);
                    ctx.fillText(\`Stability: \${stabilityScore.toFixed(2)}\`, centerX, centerY + 25);
                }
                
                // Trigger a transition animation
                document.getElementById('transitionBtn').addEventListener('click', function() {
                    if (animating) return;
                    
                    animating = true;
                    const startIntensity = intensity;
                    const targetIntensity = Math.min(1, intensity + 0.2);
                    const animationDuration = 1000; // ms
                    const startTime = performance.now();
                    
                    // Update pressure and stability randomly
                    pressureResult = Math.min(1, Math.max(0, pressureResult + (Math.random() * 0.4 - 0.2)));
                    stabilityScore = Math.min(1, Math.max(0, stabilityScore + (Math.random() * 0.3 - 0.15)));
                    updateMetrics();
                    
                    function animate(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(1, elapsed / animationDuration);
                        
                        // Easing function
                        const easedProgress = 1 - Math.pow(1 - progress, 3);
                        
                        intensity = startIntensity + (targetIntensity - startIntensity) * easedProgress;
                        
                        drawChakraViz();
                        
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            // Trigger neon pulse at end of transition
                            animateNeonPulse(ctx, canvas.width/2, canvas.height/2, CHAKRA_COLORS.neon.blue);
                            animating = false;
                            
                            // Add a trend point
                            addTrendPoint({
                                x: Math.random() * trendCanvas.width * 0.8 + trendCanvas.width * 0.1,
                                y: Math.random() * trendCanvas.height * 0.6 + trendCanvas.height * 0.2,
                                intensity: intensity,
                                pressureResult: pressureResult,
                                stabilityScore: stabilityScore,
                                timestamp: new Date()
                            });
                        }
                    }
                    
                    requestAnimationFrame(animate);
                });
                
                // Trigger a correction pulse
                document.getElementById('correctionBtn').addEventListener('click', function() {
                    // Small correction to intensity
                    intensity = Math.max(0, Math.min(1, intensity - 0.1));
                    drawChakraViz();
                    
                    // Draw correction pulse
                    drawCorrectionPulse(ctx, canvas.width/2, canvas.height/2, CHAKRA_COLORS.neon.green);
                    
                    // Update metrics
                    pressureResult = Math.max(0, pressureResult - 0.15);
                    stabilityScore = Math.min(1, stabilityScore + 0.1);
                    updateMetrics();
                });
                
                // Initial draw
                drawChakraViz();
                updateMetrics();
            }
            
            // Set up trend canvas
            const trendCanvas = document.getElementById('trendCanvas');
            const trendCtx = trendCanvas.getContext('2d');
            const tooltip = document.getElementById('tooltip');
            let trendPoints = [];
            
            function drawTrendVisualization() {
                trendCtx.clearRect(0, 0, trendCanvas.width, trendCanvas.height);
                
                // Draw grid
                trendCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                trendCtx.lineWidth = 1;
                
                // Vertical grid lines
                for (let x = 0; x <= trendCanvas.width; x += 50) {
                    trendCtx.beginPath();
                    trendCtx.moveTo(x, 0);
                    trendCtx.lineTo(x, trendCanvas.height);
                    trendCtx.stroke();
                }
                
                // Horizontal grid lines
                for (let y = 0; y <= trendCanvas.height; y += 50) {
                    trendCtx.beginPath();
                    trendCtx.moveTo(0, y);
                    trendCtx.lineTo(trendCanvas.width, y);
                    trendCtx.stroke();
                }
                
                // Connect trend points with dashed lines
                if (trendPoints.length >= 2) {
                    connectTrendPoints(trendCtx, trendPoints);
                }
                
                // Draw trend points
                trendPoints.forEach((point, index) => {
                    // Calculate color based on pressure and stability
                    let pointColor;
                    if (point.pressureResult > 0.7) {
                        pointColor = CHAKRA_COLORS.neon.pink;
                    } else if (point.stabilityScore > 0.7) {
                        pointColor = CHAKRA_COLORS.neon.green;
                    } else {
                        pointColor = CHAKRA_COLORS.trend.gray;
                    }
                    
                    // Draw the trend point
                    drawTrendPoint(trendCtx, point.x, point.y, pointColor);
                    
                    // Draw index number
                    trendCtx.fillStyle = 'white';
                    trendCtx.font = '10px sans-serif';
                    trendCtx.textAlign = 'center';
                    trendCtx.fillText(index + 1, point.x, point.y - 10);
                });
            }
            
            function addTrendPoint(point) {
                trendPoints.push(point);
                drawTrendVisualization();
            }
            
            // Add a random trend point
            document.getElementById('addTrendBtn').addEventListener('click', function() {
                const newPoint = {
                    x: Math.random() * trendCanvas.width * 0.8 + trendCanvas.width * 0.1,
                    y: Math.random() * trendCanvas.height * 0.6 + trendCanvas.height * 0.2,
                    intensity: Math.random(),
                    pressureResult: Math.random(),
                    stabilityScore: Math.random(),
                    timestamp: new Date()
                };
                
                addTrendPoint(newPoint);
                
                // Add a neon pulse at the new point
                const pulseColor = newPoint.pressureResult > 0.5 ? CHAKRA_COLORS.neon.pink : CHAKRA_COLORS.neon.green;
                animateNeonPulse(trendCtx, newPoint.x, newPoint.y, pulseColor);
            });
            
            // Clear trend points
            document.getElementById('clearTrendBtn').addEventListener('click', function() {
                trendPoints = [];
                drawTrendVisualization();
            });
            
            // Show tooltip on hover over trend points
            trendCanvas.addEventListener('mousemove', function(event) {
                const rect = trendCanvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                // Check if mouse is over a trend point
                let hoveredPoint = null;
                for (const point of trendPoints) {
                    const dx = x - point.x;
                    const dy = y - point.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= 10) {
                        hoveredPoint = point;
                        break;
                    }
                }
                
                if (hoveredPoint) {
                    const time = hoveredPoint.timestamp ? 
                        hoveredPoint.timestamp.toLocaleTimeString() : 
                        'Unknown time';
                    
                    tooltip.style.left = (event.clientX + 10) + 'px';
                    tooltip.style.top = (event.clientY + 10) + 'px';
                    tooltip.innerHTML = \`
                        <div>Pressure: \${hoveredPoint.pressureResult.toFixed(2)}</div>
                        <div>Stability: \${hoveredPoint.stabilityScore.toFixed(2)}</div>
                        <div>Intensity: \${hoveredPoint.intensity.toFixed(2)}</div>
                        <div>Time: \${time}</div>
                    \`;
                    tooltip.style.opacity = 1;
                } else {
                    tooltip.style.opacity = 0;
                }
            });
            
            trendCanvas.addEventListener('mouseleave', function() {
                tooltip.style.opacity = 0;
            });
            
            // Initial setup
            setupColorPalette();
            setupBlocksCanvas();
            setupChakraCanvas();
            drawTrendVisualization();
        });
    </script>
</body>
</html>
    `;
  }

  /**
   * Save the HTML demo to a file
   * @param {string} outputPath - Path to save the HTML file
   */
  saveToFile(outputPath) {
    const html = this.generateHTML();
    fs.writeFileSync(outputPath, html);
    console.log(`Visualization demo saved to ${outputPath}`);
  }
}

// Create visualization and save to file
const visualizer = new DynamicVisualizationSystem();
const outputPath = path.join(__dirname, 'chakra_visualization_demo.html');
visualizer.saveToFile(outputPath);

console.log('\n🎨 Dynamic Color Palette and Motion Visualization System');
console.log('='.repeat(60));
console.log('The visualization demo has been created.');
console.log(`You can open the file in your browser: ${outputPath}`);
console.log('\nThis demo showcases:');
console.log('1. Chakra-inspired gradient palette with pastel→core transitions');
console.log('2. Neon pulse animated overlays for transition events');
console.log('3. Historical trend points with offset markers');
console.log('4. Interactive correction pulses and transition animations');

module.exports = {
  DynamicVisualizationSystem,
  chakraSystem,
  colorUtils
};