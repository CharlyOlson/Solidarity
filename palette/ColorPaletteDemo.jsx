/**
 * Example usage of the Solidarity Platform Color Palette System
 * 
 * This file demonstrates how to integrate the chakra-inspired gradient system
 * into a React application with dynamic color responses.
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './palette/ThemeProvider';
import { useColorPalette } from './palette/ColorPaletteContext';
import { useColorShading } from './palette/useColorShading';
import { GradientCard, ColorPressureIndicator } from './palette/ExampleComponents';

/**
 * Example component that simulates system metric changes
 */
function SystemMetricsSimulator() {
  const { updateSystemMetrics, pressureResult, stabilityScore, transitionRate } = useColorPalette();
  const [isAutoMode, setIsAutoMode] = useState(false);
  
  // Simulate changing metrics in auto mode
  useEffect(() => {
    if (!isAutoMode) return;
    
    const interval = setInterval(() => {
      // Generate slightly changing values to simulate real system metrics
      const newStability = 0.3 + Math.sin(Date.now() * 0.0003) * 0.3;
      const newTransition = 0.2 + Math.cos(Date.now() * 0.0005) * 0.2;
      const newOffset = 0.5 + Math.sin(Date.now() * 0.0007) * 0.5;
      
      updateSystemMetrics(newStability, newTransition, newOffset);
    }, 50); // Update frequently for smooth transitions
    
    return () => clearInterval(interval);
  }, [isAutoMode, updateSystemMetrics]);
  
  // Style based on current metrics
  const { getDynamicShade } = useColorShading();
  const { palette } = useColorPalette();
  
  const buttonStyle = {
    backgroundColor: getDynamicShade(palette.primary, 60),
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '10px',
    fontWeight: 'bold'
  };
  
  const containerStyle = {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: getDynamicShade(palette.primary, 10),
    margin: '20px 0'
  };
  
  const sliderContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    margin: '15px 0'
  };
  
  const sliderLabelStyle = {
    width: '100px',
    fontWeight: 'bold'
  };
  
  const sliderStyle = {
    flex: 1,
    marginLeft: '10px'
  };
  
  const valueStyle = {
    width: '50px',
    textAlign: 'right',
    marginLeft: '10px'
  };

  const handleSliderChange = (e, metricType) => {
    const value = parseFloat(e.target.value);
    
    switch(metricType) {
      case 'stability':
        updateSystemMetrics(value, transitionRate, pressureResult);
        break;
      case 'transition':
        updateSystemMetrics(stabilityScore, value, pressureResult);
        break;
      case 'pressure':
        updateSystemMetrics(stabilityScore, transitionRate, value);
        break;
      default:
        break;
    }
  };

  return (
    <div style={containerStyle}>
      <h3>System Metrics Controls</h3>
      
      <button 
        style={buttonStyle}
        onClick={() => setIsAutoMode(!isAutoMode)}
      >
        {isAutoMode ? 'Disable Auto Mode' : 'Enable Auto Mode'}
      </button>
      
      <fieldset disabled={isAutoMode}>
        <legend>Manual Controls</legend>
        
        <div style={sliderContainerStyle}>
          <div style={sliderLabelStyle}>Stability:</div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={stabilityScore}
            onChange={(e) => handleSliderChange(e, 'stability')}
            style={sliderStyle}
          />
          <div style={valueStyle}>{stabilityScore.toFixed(2)}</div>
        </div>
        
        <div style={sliderContainerStyle}>
          <div style={sliderLabelStyle}>Transition:</div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={transitionRate}
            onChange={(e) => handleSliderChange(e, 'transition')}
            style={sliderStyle}
          />
          <div style={valueStyle}>{transitionRate.toFixed(2)}</div>
        </div>
        
        <div style={sliderContainerStyle}>
          <div style={sliderLabelStyle}>Pressure:</div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={pressureResult}
            onChange={(e) => handleSliderChange(e, 'pressure')}
            style={sliderStyle}
          />
          <div style={valueStyle}>{pressureResult.toFixed(2)}</div>
        </div>
      </fieldset>
      
      <div style={{ marginTop: '20px' }}>
        <h4>Pressure Visualization</h4>
        <ColorPressureIndicator size="large" />
        <div style={{ height: '20px' }} />
        <ColorPressureIndicator size="medium" vertical={true} />
      </div>
    </div>
  );
}

/**
 * Main app demonstrating the color palette system
 */
export default function ColorPaletteDemo() {
  return (
    <ThemeProvider>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <h1>Solidarity Platform - Chakra Gradient System</h1>
        <p>
          This demo showcases the dynamic color palette system with chakra-inspired
          gradients responding to system pressure, stability, and transition metrics.
        </p>
        
        <SystemMetricsSimulator />
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <GradientCard title="Primary System" type="primary">
              <p>
                Demonstrates the primary chakra gradient system with dynamic
                pressure sensitivity. Move your cursor over the card to see
                how colors respond to position and movement.
              </p>
            </GradientCard>
          </div>
          
          <div style={{ flex: '1 1 400px' }}>
            <GradientCard title="Trading Functions" type="trading">
              <p>
                This card uses the trading color scheme from the palette.
                The neon highlights intensify with increased system pressure
                and movement transitions.
              </p>
            </GradientCard>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <GradientCard title="Liquidity Pool" type="liquidity" baseLevel={30}>
              <p>
                Using a darker base level (30) for the liquidity color scheme.
                Demonstrates how the chakra gradient system adapts to different
                base levels while maintaining visual harmony.
              </p>
            </GradientCard>
          </div>
          
          <div style={{ flex: '1 1 400px' }}>
            <GradientCard 
              title="Governance Layer" 
              type="governance" 
              baseLevel={70} 
              pressureSensitive={false}
            >
              <p>
                This card uses a lighter base level (70) with pressure sensitivity
                disabled. It shows how components can opt-out of dynamic pressure
                effects while still benefiting from the color system.
              </p>
            </GradientCard>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}