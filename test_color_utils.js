/**
 * Color Utilities Test Script
 * 
 * This file tests the color utilities functions in isolation to ensure they work properly.
 */

// Import the color utilities
const colorUtils = require('./src/utils/colorUtils');

// Test the lerp function
console.log('\n🌈 Testing Color Interpolation (lerp)');
console.log('------------------------------------');
console.log('Red to Blue (0.0):', colorUtils.lerp('#FF0000', '#0000FF', 0.0));
console.log('Red to Blue (0.5):', colorUtils.lerp('#FF0000', '#0000FF', 0.5));
console.log('Red to Blue (1.0):', colorUtils.lerp('#FF0000', '#0000FF', 1.0));

// Test the invertColor function
console.log('\n🔄 Testing Color Inversion');
console.log('------------------------------------');
console.log('Invert Black (#000000):', colorUtils.invertColor('#000000'));
console.log('Invert White (#FFFFFF):', colorUtils.invertColor('#FFFFFF'));
console.log('Invert Red (#FF0000):', colorUtils.invertColor('#FF0000'));
console.log('Invert Cyan (#00FFFF):', colorUtils.invertColor('#00FFFF'));

// Test the getColorIntensity function
console.log('\n🔍 Testing getColorIntensity');
console.log('------------------------------------');
console.log('Intensity 0.0:', colorUtils.getColorIntensity(0.0));
console.log('Intensity 0.5:', colorUtils.getColorIntensity(0.5));
console.log('Intensity 0.7:', colorUtils.getColorIntensity(0.7));
console.log('Intensity 0.8 (with border):', colorUtils.getColorIntensity(0.8));
console.log('Intensity 1.0 (with border):', colorUtils.getColorIntensity(1.0));

// Test the generateHarmonicPalette function
console.log('\n🎨 Testing Harmonic Palette Generator');
console.log('------------------------------------');
const bluePalette = colorUtils.generateHarmonicPalette(240, 5); // Blue-based palette
console.log('Blue-based palette (5 colors):', bluePalette);

const greenPalette = colorUtils.generateHarmonicPalette(120, 5); // Green-based palette
console.log('Green-based palette (5 colors):', greenPalette);

// Try running the demo from color_motion_tracking.js
console.log('\n🎯 Running Color Motion Tracking Demo');
console.log('------------------------------------');
const { ColorMotionVisualizer } = require('./color_motion_tracking');
const visualizer = new ColorMotionVisualizer();

// Sample motion tracking data
const sampleData = [
    { x: 10, y: 20, intensity: 0.2 },
    { x: 15, y: 25, intensity: 0.5 },
    { x: 20, y: 30, intensity: 0.8 },
    { x: 25, y: 35, intensity: 1.0 }
];

visualizer.visualizeMotionData(sampleData);

console.log('\n✅ Color Utilities Test Complete');