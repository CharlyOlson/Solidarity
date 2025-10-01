/**
 * Example components that demonstrate how to use the color palette system
 * with dynamic chakra-inspired gradient effects.
 */

import React from 'react';
import { useColorPalette } from './ColorPaletteContext';
import { useColorShading } from './useColorShading';

/**
 * GradientCard demonstrates the chakra-gradient system with dynamic pressure sensitivity
 */
export function GradientCard({ 
  title, 
  children, 
  baseLevel = 50, 
  type = 'primary',
  pressureSensitive = true
}) {
  const { pressureResult, updateSystemMetrics } = useColorPalette();
  const { getDynamicShade, getNeonPulse } = useColorShading({
    pressureSensitivity: pressureSensitive ? 0.8 : 0.2,
    transitionAmplification: 1.5
  });
  
  // Determine which color palette to use based on type
  const colorKey = type === 'primary' ? 'primary' : 
                  type === 'trading' ? 'trading' :
                  type === 'liquidity' ? 'liquidity' : 'governance';
                  
  const { palette } = useColorPalette();
  const colors = palette[colorKey];
  
  // Get dynamic shades for the component
  const baseColor = getDynamicShade(colors, baseLevel);
  const accentColor = getDynamicShade(colors, baseLevel + 30);
  const textColor = getDynamicShade(colors, baseLevel > 50 ? 10 : 90);
  
  // Add neon highlight effect
  const highlightColor = getNeonPulse(
    baseColor, 
    palette.neon[baseLevel > 50 ? 30 : 70], 
    pressureResult * 0.8
  );

  // Simulate a pressure change on interaction
  const handleMouseMove = (e) => {
    if (!pressureSensitive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Calculate normalized distance from center (0-1)
    const centerX = 0.5;
    const centerY = 0.5;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const normalizedDistance = Math.min(distance * 2, 1); // 0 at center, 1 at edge
    
    // Update system metrics based on mouse position
    updateSystemMetrics(
      0.5 + (y - 0.5) * 0.5,  // stability based on Y position
      0.2 + normalizedDistance * 0.6,  // transition based on distance from center
      x  // offset based on X position
    );
  };

  const cardStyle = {
    backgroundColor: baseColor,
    color: textColor,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: `0 8px 24px rgba(0, 0, 0, 0.15), 0 0 12px ${highlightColor}80`,
    transition: 'all 0.3s ease',
    border: `1px solid ${accentColor}80`,
    backgroundImage: `linear-gradient(135deg, ${baseColor}, ${accentColor}40)`,
    position: 'relative',
    overflow: 'hidden',
    margin: '20px 0'
  };
  
  const titleStyle = {
    marginBottom: '16px',
    fontSize: '24px',
    fontWeight: '600',
    color: textColor,
    textShadow: `0 0 8px ${highlightColor}60`
  };

  // Add chakra-inspired decorative element
  const chakraDecoratorStyle = {
    position: 'absolute',
    top: '-20px',
    right: '-20px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${highlightColor}40 0%, transparent 70%)`,
    opacity: 0.7,
    transform: `scale(${0.8 + pressureResult * 0.4})`,
    transition: 'transform 0.5s ease, opacity 0.5s ease'
  };

  return (
    <div 
      style={cardStyle} 
      onMouseMove={handleMouseMove}
    >
      <div style={chakraDecoratorStyle} />
      <h3 style={titleStyle}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

/**
 * ColorPressureIndicator visualizes system pressure with gradients and neon accents
 */
export function ColorPressureIndicator({ size = 'medium', vertical = false }) {
  const { pressureResult, stabilityScore, transitionRate } = useColorPalette();
  const { getDynamicShade, getNeonPulse, palette } = useColorShading({
    pressureSensitivity: 1.0,
    transitionAmplification: 2.0
  });
  
  // Size mapping
  const sizeMap = {
    small: { width: vertical ? '30px' : '120px', height: vertical ? '120px' : '30px' },
    medium: { width: vertical ? '40px' : '200px', height: vertical ? '200px' : '40px' },
    large: { width: vertical ? '60px' : '300px', height: vertical ? '300px' : '60px' }
  };
  
  const dimensions = sizeMap[size] || sizeMap.medium;
  
  // Calculate colors based on pressure
  const lowColor = getDynamicShade(palette.primary, 20);
  const midColor = getDynamicShade(palette.primary, 50);
  const highColor = getDynamicShade(palette.primary, 80);
  
  // Add neon accents based on transition rate
  const accentColor = getNeonPulse(
    midColor, 
    palette.neon[60], 
    transitionRate * 0.9
  );
  
  // Calculate fill amount based on pressure (0-100%)
  const fillPercent = Math.round(pressureResult * 100);
  
  const containerStyle = {
    ...dimensions,
    borderRadius: '8px',
    overflow: 'hidden',
    border: `1px solid ${accentColor}80`,
    position: 'relative',
    boxShadow: `0 0 8px ${accentColor}60`,
    background: `linear-gradient(${vertical ? 'to top' : 'to right'}, ${lowColor}, ${midColor}, ${highColor})`,
  };
  
  const fillStyle = {
    position: 'absolute',
    background: `linear-gradient(${vertical ? 'to top' : 'to right'}, ${accentColor}80, ${accentColor})`,
    transition: 'all 0.5s ease',
    ...(vertical 
      ? { 
          bottom: 0, 
          left: 0, 
          width: '100%', 
          height: `${fillPercent}%` 
        } 
      : { 
          left: 0, 
          top: 0, 
          height: '100%', 
          width: `${fillPercent}%` 
        }
    )
  };
  
  const textStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ffffff',
    fontSize: size === 'small' ? '10px' : size === 'large' ? '18px' : '14px',
    fontWeight: 'bold',
    textShadow: '0 0 4px rgba(0,0,0,0.5)',
    zIndex: 10
  };
  
  const stabilityIndicatorStyle = {
    position: 'absolute',
    width: '4px',
    height: '70%',
    background: palette.neon[90],
    opacity: 0.7,
    transition: 'all 0.3s ease',
    top: '15%',
    left: `${stabilityScore * 100}%`,
    transform: 'translateX(-50%)',
    display: vertical ? 'none' : 'block'
  };

  return (
    <div style={containerStyle}>
      <div style={fillStyle}></div>
      <div style={stabilityIndicatorStyle}></div>
      <div style={textStyle}>{fillPercent}%</div>
    </div>
  );
}

export default {
  GradientCard,
  ColorPressureIndicator
};