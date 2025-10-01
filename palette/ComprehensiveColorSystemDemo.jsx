/**
 * Solidarity Platform - Comprehensive Color System Demo
 * 
 * This file demonstrates the integration of our new chakra-inspired color palette
 * with the existing color utilities and motion tracking system.
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './palette/ThemeProvider';
import { useColorPalette } from './palette/ColorPaletteSystemWithTypes';
import { useIntegratedColorSystem } from './palette/ColorSystemIntegration';
import { GradientCard, ColorPressureIndicator } from './palette/ExampleComponents';

/**
 * Example component showing the integration of the color system with motion tracking
 */
function MotionTrackingDemo() {
  const { applyPaletteToMotionVisualization } = useIntegratedColorSystem();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [motionData, setMotionData] = useState(null);
  
  // Track mouse movement and apply color visualization
  useEffect(() => {
    const handleMouseMove = (event) => {
      const newPosition = { x: event.clientX, y: event.clientY };
      
      // Calculate velocity vector
      const newVelocity = {
        x: newPosition.x - lastPosition.x,
        y: newPosition.y - lastPosition.y
      };
      
      setVelocity(newVelocity);
      setPosition(newPosition);
      setLastPosition(newPosition);
      
      // Generate motion data for color visualization
      const data = {
        x: newPosition.x,
        y: newPosition.y,
        intensity: Math.min(1.0, Math.sqrt(newVelocity.x**2 + newVelocity.y**2) / 50),
        isActive: true
      };
      
      // Apply our color system to the motion data
      const colorizedData = applyPaletteToMotionVisualization(data);
      setMotionData(colorizedData);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [applyPaletteToMotionVisualization, lastPosition]);
  
  // If no motion data yet
  if (!motionData) {
    return <div>Move your mouse to see the motion tracking visualization</div>;
  }
  
  // Style based on motion data
  const cursorStyle = {
    position: 'absolute',
    insetInlineStart: `${position.x - 20}px`,
    insetBlockStart: `${position.y - 20}px`,
    inlineSize: '40px',
    blockSize: '40px',
    borderRadius: '50%',
    backgroundColor: motionData.colors.primary,
    boxShadow: `0 0 10px ${motionData.colors.highlight}`,
    transform: 'translate(-50%, -50%)',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };
  
  const dataPanelStyle = {
    position: 'fixed',
    insetInlineEnd: '20px',
    insetBlockStart: '20px',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: motionData.colors.background,
    color: '#FFF',
    boxShadow: `0 0 15px ${motionData.colors.highlight}88`,
    zIndex: 1000
  };
  
  const dataRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0'
  };
  
  const colorBoxStyle = (color) => ({
    inlineSize: '20px',
    blockSize: '20px',
    backgroundColor: color,
    marginInlineEnd: '8px',
    borderRadius: '4px'
  });
  
  const colorRowStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBlock: '4px'
  };
  
  return (
    <>
      <div style={cursorStyle}>
        <div style={{
          inlineSize: '10px',
          blockSize: '10px',
          borderRadius: '50%',
          backgroundColor: motionData.harmonicPulse
        }}></div>
      </div>
      
      <div style={dataPanelStyle}>
        <h3>Motion Tracking Data</h3>
        
        <div style={dataRowStyle}>
          <span>Position:</span>
          <span>X: {Math.round(position.x)}, Y: {Math.round(position.y)}</span>
        </div>
        
        <div style={dataRowStyle}>
          <span>Velocity:</span>
          <span>X: {Math.round(velocity.x)}, Y: {Math.round(velocity.y)}</span>
        </div>
        
        <div style={dataRowStyle}>
          <span>Intensity:</span>
          <span>{(motionData.intensity * 100).toFixed(1)}%</span>
        </div>
        
        <h4 style={{ marginBlock: '10px' }}>Colors</h4>
        <div style={colorRowStyle}>
          <div style={colorBoxStyle(motionData.colors.primary)}></div>
          <span>Primary</span>
        </div>
        <div style={colorRowStyle}>
          <div style={colorBoxStyle(motionData.colors.secondary)}></div>
          <span>Secondary</span>
        </div>
        <div style={colorRowStyle}>
          <div style={colorBoxStyle(motionData.colors.highlight)}></div>
          <span>Highlight</span>
        </div>
        <div style={colorRowStyle}>
          <div style={colorBoxStyle(motionData.harmonicPulse)}></div>
          <span>Harmonic Pulse</span>
        </div>
      </div>
    </>
  );
}

/**
 * Enhanced gradient system demo showing integration with existing utilities
 */
function EnhancedGradientDemo() {
  const { generateEnhancedPalette, invertColor } = useIntegratedColorSystem();
  const baseColors = [
    { name: "Azure", hex: "#3498db" },
    { name: "Emerald", hex: "#2ecc71" },
    { name: "Amethyst", hex: "#9b59b6" },
    { name: "Gold", hex: "#f1c40f" },
    { name: "Coral", hex: "#e74c3c" }
  ];
  
  const [selectedColor, setSelectedColor] = useState(baseColors[0]);
  const enhancedPalette = generateEnhancedPalette(selectedColor.hex);
  
  const containerStyle = {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    marginBlock: '20px' // Using logical properties
  };
  
  const colorButtonStyle = (color, isActive) => ({
    inlineSize: '40px',
    blockSize: '40px',
    backgroundColor: color,
    border: isActive ? '3px solid black' : '3px solid transparent',
    borderRadius: '50%',
    margin: '5px',
    cursor: 'pointer',
    boxShadow: isActive ? '0 0 10px rgba(0,0,0,0.5)' : 'none'
  });
  
  const paletteContainerStyle = {
    background: enhancedPalette.gradient,
    borderRadius: '8px',
    padding: '20px',
    marginBlock: '15px',
    boxShadow: `0 4px 12px ${enhancedPalette.neon}80`
  };
  
  const colorBlockStyle = {
    display: 'inline-block',
    inlineSize: '100px',
    blockSize: '100px',
    marginInline: '10px',
    borderRadius: '8px',
    textAlign: 'center',
    padding: '10px',
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  };
  
  return (
    <div style={containerStyle}>
      <h3>Enhanced Gradient System</h3>
      <p>
        This demonstration showcases how our new color palette system integrates
        with the existing color utilities. Select a base color to see the generated palette.
      </p>
      
      <div style={{ marginBlock: '15px' }}>
        {baseColors.map(color => (
          <button
            key={color.hex}
            style={colorButtonStyle(color.hex, selectedColor.hex === color.hex)}
            onClick={() => setSelectedColor(color)}
            title={color.name}
          />
        ))}
      </div>
      
      <div style={paletteContainerStyle}>
        <h4 style={{ color: '#fff', marginBlockEnd: '15px' }}>
          {selectedColor.name} Palette
        </h4>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{
            ...colorBlockStyle,
            backgroundColor: enhancedPalette.base
          }}>
            Base
          </div>
          
          <div style={{
            ...colorBlockStyle,
            backgroundColor: enhancedPalette.light
          }}>
            Light
          </div>
          
          <div style={{
            ...colorBlockStyle,
            backgroundColor: enhancedPalette.dark
          }}>
            Dark
          </div>
          
          <div style={{
            ...colorBlockStyle,
            backgroundColor: enhancedPalette.accent,
            color: invertColor(enhancedPalette.accent)
          }}>
            Accent
          </div>
          
          <div style={{
            ...colorBlockStyle,
            backgroundColor: enhancedPalette.neon,
            boxShadow: `0 0 15px ${enhancedPalette.neon}`
          }}>
            Neon
          </div>
          
          <div style={{
            ...colorBlockStyle,
            backgroundColor: '#121212',
            color: enhancedPalette.accessible.onDark
          }}>
            On Dark
          </div>
          
          <div style={{
            ...colorBlockStyle,
            backgroundColor: '#ffffff',
            color: enhancedPalette.accessible.onLight || '#000000'
          }}>
            On Light
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main demo component
 */
export default function ComprehensiveColorSystemDemo() {
  return (
    <ThemeProvider>
      <div style={{ maxInlineSize: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1>Solidarity Platform - Comprehensive Color System</h1>
        <p>
          This demo showcases the integration of our new chakra-inspired gradient system
          with the existing color utilities and motion tracking system.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '20px',
          marginBlockEnd: '30px'
        }}>
          <GradientCard 
            title="Chakra System Base" 
            type="primary"
            pressureSensitive={true}
          >
            <p>
              The base color system uses chakra-inspired gradients that respond to
              pressure, stability, and motion metrics in real-time.
            </p>
          </GradientCard>
          
          <GradientCard 
            title="Golden Ratio Integration" 
            type="governance"
            pressureSensitive={true}
          >
            <p>
              All color transitions are enhanced using the golden ratio (φ ≈ 1.618)
              to create naturally pleasing harmonics that feel balanced.
            </p>
          </GradientCard>
        </div>
        
        <h2>Motion Tracking Integration</h2>
        <p>
          Move your mouse to see how the color system responds to motion and velocity.
          Notice how the colors adapt based on speed and direction.
        </p>
        
        <div style={{ blockSize: '300px', position: 'relative', border: '1px dashed #ccc' }}>
          <MotionTrackingDemo />
        </div>
        
        <h2>Enhanced Gradient System</h2>
        <EnhancedGradientDemo />
      </div>
    </ThemeProvider>
  );
}