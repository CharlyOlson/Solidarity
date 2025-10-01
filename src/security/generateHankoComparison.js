/*
MIT License

Copyright (c) 2025 CharlyOlson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * generateHankoComparison.js
 * 
 * Generates a series of visual comparison images showing HankoStampID
 * versus traditional security methods (2FA, Biometric, Blockchain).
 * Creates a step-by-step visual guide that can be used in presentations.
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const EnhancedHankoSystem = require('./src/security/EnhancedHankoSystem');

// Configuration
const outputDir = path.join(__dirname, 'hanko_comparison');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * Creates a comparison image for a single step
 * @param {Number} stepNumber - The step number
 * @param {String} stepTitle - The step title
 * @param {String} hankoDescription - Description of HankoStampID at this step
 * @param {String} twoFADescription - Description of 2FA at this step
 * @param {String} biometricDescription - Description of biometric auth at this step
 * @param {String} blockchainDescription - Description of blockchain ID at this step
 * @param {Object} hankoVisualData - Data for the Hanko visual (if available)
 * @returns {Promise<String>} - Path to the generated image
 */
async function createStepComparisonImage(
    stepNumber,
    stepTitle,
    hankoDescription,
    twoFADescription,
    biometricDescription,
    blockchainDescription,
    hankoVisualData = null
) {
    // Canvas setup - width and height
    const width = 1200;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Step ${stepNumber}: ${stepTitle}`, width / 2, 60);
    
    // Divider line
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 80);
    ctx.lineTo(width - 50, 80);
    ctx.stroke();
    
    // Method headers
    const methods = ['HankoStampID', '2FA/PIN Code', 'Biometric', 'Blockchain ID'];
    const methodColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12'];
    
    const columnWidth = (width - 100) / 4;
    const columnX = [50, 50 + columnWidth, 50 + columnWidth * 2, 50 + columnWidth * 3];
    
    methods.forEach((method, i) => {
        ctx.fillStyle = methodColors[i];
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(method, columnX[i] + columnWidth / 2, 120);
    });
    
    // Draw visual representations for each method
    const visualHeight = 250;
    const visualY = 140;
    const visualWidth = columnWidth - 20;
    
    // HankoStampID visual - special handling based on step
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(columnX[0] + 10, visualY, visualWidth, visualHeight);
    
    if (hankoVisualData) {
        // Draw specific visuals based on the step
        switch (stepNumber) {
            case 1: // User Input
                // Draw form fields
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 1;
                
                for (let i = 0; i < 7; i++) {
                    const fieldY = visualY + 20 + i * 30;
                    ctx.fillRect(columnX[0] + 20, fieldY, visualWidth - 20, 25);
                    ctx.strokeRect(columnX[0] + 20, fieldY, visualWidth - 20, 25);
                    
                    if (hankoVisualData.inputs && hankoVisualData.inputs[i]) {
                        ctx.fillStyle = '#333333';
                        ctx.textAlign = 'left';
                        ctx.font = '16px Arial';
                        ctx.fillText(hankoVisualData.inputs[i], columnX[0] + 25, fieldY + 18);
                        ctx.fillStyle = '#FFFFFF';
                    }
                }
                break;
                
            case 2: // Shape Creation
                if (hankoVisualData.shape) {
                    // Draw shape based on points
                    const points = hankoVisualData.shape.points;
                    const centroid = hankoVisualData.shape.centroid;
                    
                    // Scale points to fit visual area
                    const scale = (visualWidth - 40) / 200;
                    const offsetX = columnX[0] + 10 + visualWidth / 2;
                    const offsetY = visualY + visualHeight / 2;
                    
                    ctx.beginPath();
                    points.forEach((point, i) => {
                        const x = offsetX + (point.x - centroid.x) * scale;
                        const y = offsetY + (point.y - centroid.y) * scale;
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    });
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
                    ctx.fill();
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                break;
                
            case 3: // Labyrinth/Clock Spin
                if (hankoVisualData.path) {
                    // Draw clock with path
                    const centerX = columnX[0] + 10 + visualWidth / 2;
                    const centerY = visualY + visualHeight / 2;
                    const radius = Math.min(visualWidth, visualHeight) / 2 - 20;
                    
                    // Draw clock circle
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Draw clock numbers (hours)
                    ctx.fillStyle = '#333333';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    for (let hour = 1; hour <= 12; hour++) {
                        const angle = (hour - 3) * (Math.PI / 6); // Start at 3 o'clock
                        const x = centerX + radius * 0.85 * Math.cos(angle);
                        const y = centerY + radius * 0.85 * Math.sin(angle);
                        ctx.fillText(hour.toString(), x, y);
                    }
                    
                    // Draw path
                    ctx.beginPath();
                    hankoVisualData.path.forEach((position, i) => {
                        const angle = (position - 3) * (Math.PI / 6); // Start at 3 o'clock
                        const x = centerX + radius * 0.7 * Math.cos(angle);
                        const y = centerY + radius * 0.7 * Math.sin(angle);
                        
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                        
                        // Mark point
                        ctx.fillStyle = i === hankoVisualData.path.length - 1 ? '#e74c3c' : '#3498db';
                        ctx.beginPath();
                        ctx.arc(x, y, 8, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Add number
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = '12px Arial';
                        ctx.fillText((i + 1).toString(), x, y);
                    });
                    
                    // Draw path lines
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                break;
                
            case 4: // Color Landing
                if (hankoVisualData.color) {
                    // Draw color landing result
                    const centerX = columnX[0] + 10 + visualWidth / 2;
                    const centerY = visualY + visualHeight / 2;
                    const radius = Math.min(visualWidth, visualHeight) / 2 - 20;
                    
                    // Draw color circle
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.fillStyle = hankoVisualData.color.rgb || '#3498db';
                    ctx.fill();
                    ctx.strokeStyle = '#333333';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Add color name
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 20px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(hankoVisualData.color.name, centerX, centerY);
                }
                break;
                
            case 5: // Device/QR Sync
                // Draw QR code placeholder
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(columnX[0] + 10 + visualWidth / 4, visualY + 20, visualWidth / 2, visualWidth / 2);
                
                // Draw fake QR pattern
                const qrSize = visualWidth / 2;
                const qrX = columnX[0] + 10 + visualWidth / 4;
                const qrY = visualY + 20;
                const gridSize = 10;
                const cellSize = qrSize / gridSize;
                
                ctx.fillStyle = '#000000';
                for (let x = 0; x < gridSize; x++) {
                    for (let y = 0; y < gridSize; y++) {
                        // Create a fake QR pattern
                        if ((x < 3 && y < 3) || (x > gridSize - 4 && y < 3) || (x < 3 && y > gridSize - 4)) {
                            // Position detection patterns
                            ctx.fillRect(qrX + x * cellSize, qrY + y * cellSize, cellSize, cellSize);
                        } else if (Math.random() > 0.6) {
                            // Random data
                            ctx.fillRect(qrX + x * cellSize, qrY + y * cellSize, cellSize, cellSize);
                        }
                    }
                }
                
                // Add device ID
                if (hankoVisualData.deviceID) {
                    ctx.fillStyle = '#333333';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`Device: ${hankoVisualData.deviceID.slice(0, 8)}`, 
                        columnX[0] + 10 + visualWidth / 2, visualY + 20 + qrSize + 30);
                }
                break;
                
            case 6: // Legal Visual Stamp
                // Draw stamp preview
                ctx.beginPath();
                ctx.arc(columnX[0] + 10 + visualWidth / 2, visualY + visualHeight / 2, 
                    Math.min(visualWidth, visualHeight) / 2 - 20, 0, Math.PI * 2);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                if (hankoVisualData.asciiArt) {
                    // Draw ASCII art representation centered
                    ctx.fillStyle = '#333333';
                    ctx.font = '12px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    const lines = hankoVisualData.asciiArt.split('\n');
                    const lineHeight = 12;
                    const startY = visualY + visualHeight / 2 - (lines.length * lineHeight) / 2;
                    
                    lines.forEach((line, i) => {
                        ctx.fillText(line, columnX[0] + 10 + visualWidth / 2, startY + i * lineHeight);
                    });
                }
                break;
                
            case 7: // Audit/Verify
                // Draw verification elements
                if (hankoVisualData.hash) {
                    const centerX = columnX[0] + 10 + visualWidth / 2;
                    const centerY = visualY + 40;
                    
                    // Draw stamp mini preview
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
                    ctx.strokeStyle = '#3498db';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Draw verification info
                    ctx.fillStyle = '#333333';
                    ctx.font = '14px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    ctx.fillText('Verification Hash:', centerX, centerY + 80);
                    ctx.font = '12px monospace';
                    ctx.fillText(hankoVisualData.hash.slice(0, 20) + '...', centerX, centerY + 100);
                    
                    if (hankoVisualData.colorName) {
                        ctx.font = '14px Arial';
                        ctx.fillText(`Color: ${hankoVisualData.colorName}`, centerX, centerY + 130);
                    }
                    
                    if (hankoVisualData.timestamp) {
                        const date = new Date(hankoVisualData.timestamp);
                        ctx.fillText(`Time: ${date.toISOString().split('T')[0]}`, centerX, centerY + 160);
                    }
                    
                    // Draw check mark
                    ctx.fillStyle = '#2ecc71';
                    ctx.font = 'bold 40px Arial';
                    ctx.fillText('✓', centerX, centerY + 200);
                }
                break;
        }
    }
    
    // 2FA/PIN visualization
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(columnX[1] + 10, visualY, visualWidth, visualHeight);
    
    switch (stepNumber) {
        case 1: // User Input
            // Draw PIN input
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 1;
            
            const pinWidth = visualWidth - 40;
            const pinY = visualY + visualHeight / 2 - 20;
            ctx.fillRect(columnX[1] + 20, pinY, pinWidth, 40);
            ctx.strokeRect(columnX[1] + 20, pinY, pinWidth, 40);
            
            // Draw PIN dots
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("• • • • • •", columnX[1] + 20 + pinWidth / 2, pinY + 20);
            
            // Label
            ctx.fillStyle = '#333333';
            ctx.font = '14px Arial';
            ctx.fillText("Enter PIN", columnX[1] + 20 + pinWidth / 2, pinY - 15);
            break;
            
        case 2: // Shape Creation
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("No visual pattern", columnX[1] + 10 + visualWidth / 2, visualY + visualHeight / 2);
            break;
            
        case 3: // Labyrinth/Clock Spin
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("No interactive elements", columnX[1] + 10 + visualWidth / 2, visualY + visualHeight / 2);
            break;
            
        case 4: // Color Landing
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("No color feedback", columnX[1] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 20);
            
            // Simple checkmark
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 40px Arial';
            ctx.fillText("✓", columnX[1] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 40);
            break;
            
        case 5: // Device/QR Sync
            // SMS code notification
            const messageY = visualY + visualHeight / 2 - 50;
            const messageWidth = visualWidth - 40;
            
            // Draw phone outline
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.strokeRect(columnX[1] + 20, messageY, messageWidth, 100);
            
            // Draw message
            ctx.fillStyle = '#333333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("New message:", columnX[1] + 20 + messageWidth / 2, messageY + 25);
            ctx.font = 'bold 20px Arial';
            ctx.fillText("Your code: 945721", columnX[1] + 20 + messageWidth / 2, messageY + 60);
            break;
            
        case 6: // Legal Visual Stamp
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("No persistent visual artifact", columnX[1] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 20);
            ctx.font = '16px Arial';
            ctx.fillText("Codes expire after use", columnX[1] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 20);
            break;
            
        case 7: // Audit/Verify
            // Draw log entry
            ctx.fillStyle = '#333333';
            ctx.font = '14px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            const logY = visualY + 40;
            ctx.fillText("LOG: Auth attempt", columnX[1] + 20, logY);
            ctx.fillText("TIME: 2023-09-30 14:22:45", columnX[1] + 20, logY + 20);
            ctx.fillText("USER: user123", columnX[1] + 20, logY + 40);
            ctx.fillText("CODE: ******", columnX[1] + 20, logY + 60);
            ctx.fillText("STATUS: Verified", columnX[1] + 20, logY + 80);
            ctx.fillText("IP: 192.168.1.105", columnX[1] + 20, logY + 100);
            
            // Machine only
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText("Machine verification only", columnX[1] + 10 + visualWidth / 2, visualY + visualHeight - 40);
            break;
    }
    
    // Biometric visualization
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(columnX[2] + 10, visualY, visualWidth, visualHeight);
    
    switch (stepNumber) {
        case 1: // User Input
            // Draw fingerprint scan
            const centerX = columnX[2] + 10 + visualWidth / 2;
            const centerY = visualY + visualHeight / 2;
            const radius = Math.min(visualWidth, visualHeight) / 4;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw fingerprint lines (simplified)
            for (let i = -radius + 10; i <= radius - 10; i += 5) {
                ctx.beginPath();
                const arcWidth = Math.sqrt(radius * radius - i * i) * 2;
                ctx.ellipse(centerX, centerY + i, arcWidth / 2, 2, 0, 0, Math.PI * 2);
                ctx.strokeStyle = '#2ecc71';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            // Label
            ctx.fillStyle = '#333333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Place finger on scanner", centerX, centerY - radius - 20);
            break;
            
        case 2: // Shape Creation
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Scans physical traits", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 20);
            ctx.font = '16px Arial';
            ctx.fillText("No user-created pattern", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 20);
            break;
            
        case 3: // Labyrinth/Clock Spin
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Static scan only", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 20);
            ctx.font = '16px Arial';
            ctx.fillText("No user motion interaction", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 20);
            break;
            
        case 4: // Color Landing
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Binary match/no-match", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 20);
            
            // Simple checkmark
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 40px Arial';
            ctx.fillText("✓", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 40);
            break;
            
        case 5: // Device/QR Sync
            // Device limitation
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Typically limited to", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 30);
            ctx.fillText("registered device", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2);
            
            // Device icon
            ctx.font = 'bold 40px Arial';
            ctx.fillText("📱", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 50);
            break;
            
        case 6: // Legal Visual Stamp
            // ID card with photo
            const cardWidth = visualWidth - 40;
            const cardHeight = 120;
            const cardX = columnX[2] + 20;
            const cardY = visualY + (visualHeight - cardHeight) / 2;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 2;
            ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
            
            // Photo area
            ctx.fillStyle = '#f2f2f2';
            ctx.fillRect(cardX + 10, cardY + 10, cardHeight - 20, cardHeight - 20);
            
            // Face outline
            const faceX = cardX + 10 + (cardHeight - 20) / 2;
            const faceY = cardY + 10 + (cardHeight - 20) / 2;
            const faceRadius = (cardHeight - 20) / 3;
            
            ctx.beginPath();
            ctx.arc(faceX, faceY, faceRadius, 0, Math.PI * 2);
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Card text
            ctx.fillStyle = '#333333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText("Name: John Doe", cardX + cardHeight, cardY + 30);
            ctx.fillText("ID#: 123456789", cardX + cardHeight, cardY + 60);
            ctx.fillText("DOB: 01/01/1980", cardX + cardHeight, cardY + 90);
            break;
            
        case 7: // Audit/Verify
            // Draw match screen
            ctx.fillStyle = '#333333';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Fingerprint Comparison", columnX[2] + 10 + visualWidth / 2, visualY + 30);
            
            // Draw comparison result
            const matchY = visualY + 70;
            const matchHeight = 100;
            
            // Left (stored)
            ctx.fillText("Stored", columnX[2] + 20 + visualWidth / 4, matchY - 10);
            ctx.beginPath();
            ctx.arc(columnX[2] + 20 + visualWidth / 4, matchY + matchHeight / 2, matchHeight / 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Right (scanned)
            ctx.fillText("Scanned", columnX[2] + visualWidth - 20 - visualWidth / 4, matchY - 10);
            ctx.beginPath();
            ctx.arc(columnX[2] + visualWidth - 20 - visualWidth / 4, matchY + matchHeight / 2, matchHeight / 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = '#2ecc71';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Match indicator
            ctx.fillStyle = '#2ecc71';
            ctx.font = 'bold 20px Arial';
            ctx.fillText("MATCH: 98.7%", columnX[2] + 10 + visualWidth / 2, matchY + matchHeight + 30);
            
            // Limited transparency note
            ctx.fillStyle = '#e74c3c';
            ctx.font = '14px Arial';
            ctx.fillText("Limited matching transparency", columnX[2] + 10 + visualWidth / 2, visualY + visualHeight - 40);
            break;
    }
    
    // Blockchain visualization
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(columnX[3] + 10, visualY, visualWidth, visualHeight);
    
    switch (stepNumber) {
        case 1: // User Input
            // Draw private key input
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 1;
            
            const keyWidth = visualWidth - 40;
            const keyY = visualY + visualHeight / 2 - 20;
            ctx.fillRect(columnX[3] + 20, keyY, keyWidth, 40);
            ctx.strokeRect(columnX[3] + 20, keyY, keyWidth, 40);
            
            // Draw key text
            ctx.fillStyle = '#333333';
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("0xf29c3a1e5b...", columnX[3] + 20 + keyWidth / 2, keyY + 20);
            
            // Label
            ctx.fillStyle = '#333333';
            ctx.font = '14px Arial';
            ctx.fillText("Enter Private Key", columnX[3] + 20 + keyWidth / 2, keyY - 15);
            break;
            
        case 2: // Shape Creation
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Creates cryptographic hash", columnX[3] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 20);
            ctx.font = '16px Arial';
            ctx.fillText("No visual pattern", columnX[3] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 20);
            break;
            
        case 3: // Labyrinth/Clock Spin
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("No interactive elements", columnX[3] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 20);
            ctx.font = '16px Arial';
            ctx.fillText("Text-based entry only", columnX[3] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 20);
            break;
            
        case 4: // Color Landing
            ctx.fillStyle = '#333333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Text-based hash output", columnX[3] + 10 + visualWidth / 2, visualY + visualHeight / 2 - 20);
            
            // Hash example
            ctx.font = '12px monospace';
            ctx.fillText("0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284", 
                columnX[3] + 10 + visualWidth / 2, visualY + visualHeight / 2 + 20);
            break;
            
        case 5: // Device/QR Sync
            // Wallet address
            ctx.fillStyle = '#333333';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Wallet Address", columnX[3] + 10 + visualWidth / 2, visualY + 40);
            
            // Address display
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(columnX[3] + 20, visualY + 70, visualWidth - 40, 40);
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 1;
            ctx.strokeRect(columnX[3] + 20, visualY + 70, visualWidth - 40, 40);
            
            ctx.fillStyle = '#333333';
            ctx.font = '12px monospace';
            ctx.fillText("0x71C7656EC7ab88b098defB751B7401B5f6d8976F", 
                columnX[3] + 10 + visualWidth / 2, visualY + 90);
            
            // Seed phrase note
            ctx.fillStyle = '#e74c3c';
            ctx.font = '14px Arial';
            ctx.fillText("Requires private key/seed phrase", 
                columnX[3] + 10 + visualWidth / 2, visualY + visualHeight - 40);
            break;
            
        case 6: // Legal Visual Stamp
            ctx.fillStyle = '#333333';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Blockchain Transaction", columnX[3] + 10 + visualWidth / 2, visualY + 40);
            
            // Transaction display
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(columnX[3] + 20, visualY + 70, visualWidth - 40, 140);
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 1;
            ctx.strokeRect(columnX[3] + 20, visualY + 70, visualWidth - 40, 140);
            
            ctx.fillStyle = '#333333';
            ctx.font = '12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText("TX: 0x4a3f...", columnX[3] + 30, visualY + 90);
            ctx.fillText("From: 0x71C7...", columnX[3] + 30, visualY + 110);
            ctx.fillText("To: 0x8901...", columnX[3] + 30, visualY + 130);
            ctx.fillText("Value: 0.5 ETH", columnX[3] + 30, visualY + 150);
            ctx.fillText("Status: Confirmed", columnX[3] + 30, visualY + 170);
            
            // No visual distinctiveness note
            ctx.textAlign = 'center';
            ctx.fillStyle = '#e74c3c';
            ctx.font = '14px Arial';
            ctx.fillText("No visual distinctiveness", 
                columnX[3] + 10 + visualWidth / 2, visualY + visualHeight - 30);
            break;
            
        case 7: // Audit/Verify
            ctx.fillStyle = '#333333';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("Blockchain Explorer", columnX[3] + 10 + visualWidth / 2, visualY + 40);
            
            // Explorer UI mockup
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(columnX[3] + 20, visualY + 70, visualWidth - 40, 140);
            ctx.strokeStyle = '#f39c12';
            ctx.lineWidth = 1;
            ctx.strokeRect(columnX[3] + 20, visualY + 70, visualWidth - 40, 140);
            
            // Search bar
            ctx.fillStyle = '#F8F8F8';
            ctx.fillRect(columnX[3] + 30, visualY + 80, visualWidth - 60, 30);
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1;
            ctx.strokeRect(columnX[3] + 30, visualY + 80, visualWidth - 60, 30);
            
            ctx.fillStyle = '#333333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText("Search: 0x4a3f...", columnX[3] + 40, visualY + 95);
            
            // Results
            ctx.font = '12px monospace';
            ctx.fillText("Hash: 0x4a3f5b...", columnX[3] + 30, visualY + 125);
            ctx.fillText("Block: 14,322,188", columnX[3] + 30, visualY + 145);
            ctx.fillText("Time: 2023-09-30 14:22:45", columnX[3] + 30, visualY + 165);
            ctx.fillText("Gas: 21,000", columnX[3] + 30, visualY + 185);
            
            // Machine only verification note
            ctx.textAlign = 'center';
            ctx.fillStyle = '#e74c3c';
            ctx.font = '14px Arial';
            ctx.fillText("Hash explorer only - no visual comparison", 
                columnX[3] + 10 + visualWidth / 2, visualY + visualHeight - 30);
            break;
    }
    
    // Description text area
    const descY = visualY + visualHeight + 30;
    const descHeight = height - descY - 30;
    
    // Method descriptions
    const descriptions = [hankoDescription, twoFADescription, biometricDescription, blockchainDescription];
    
    descriptions.forEach((desc, i) => {
        const descX = columnX[i] + 10;
        const descWidth = columnWidth - 20;
        
        // Description box
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(descX, descY, descWidth, descHeight);
        ctx.strokeStyle = methodColors[i];
        ctx.lineWidth = 2;
        ctx.strokeRect(descX, descY, descWidth, descHeight);
        
        // Description text
        ctx.fillStyle = '#333333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Simple word wrapping
        const words = desc.split(' ');
        let line = '';
        let y = descY + 10;
        const lineHeight = 20;
        const maxWidth = descWidth - 20;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth) {
                ctx.fillText(line, descX + 10, y);
                line = word + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, descX + 10, y);
    });
    
    // Save the image
    const outputPath = path.join(outputDir, `step_${stepNumber}_${stepTitle.toLowerCase().replace(/\s+/g, '_')}.png`);
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    
    return new Promise((resolve, reject) => {
        out.on('finish', () => resolve(outputPath));
        out.on('error', reject);
    });
}

/**
 * Generates all comparison images for the HankoStampID system
 * @returns {Promise<Array>} - Array of paths to generated images
 */
async function generateAllComparisonImages() {
    // Create an Enhanced Hanko System for visuals
    const hankoSystem = new EnhancedHankoSystem({ outputDir: path.join(__dirname, 'hanko_temp') });
    
    // Example user inputs
    const userInputs = [
        'CharlyOlson', // username
        '2025-09-30', // current date
        'Solidarity', // project name
        'Red',        // favorite color
        '7',          // favorite number
        'Quantum',    // selected theme
        '金'          // chosen character
    ];
    
    // Run authentication to get data for visuals
    await hankoSystem.runCompleteAuthentication(userInputs);
    
    // Generate each step comparison
    const steps = [
        {
            stepNumber: 1,
            title: 'User Entry',
            hankoDesc: 'User enters 7 fields with personal data, preferences, and logic choices.',
            twoFADesc: 'User enters a PIN code or receives a temporary code via email/SMS.',
            biometricDesc: 'User presents fingerprint, face, or other biological traits for scanning.',
            blockchainDesc: 'User enters a long private key or seed phrase.',
            visualData: {
                inputs: userInputs
            }
        },
        {
            stepNumber: 2,
            title: 'Shape Creation',
            hankoDesc: 'System connects user inputs to generate a unique visual geometric pattern.',
            twoFADesc: 'No visual pattern is created - just numeric codes for verification.',
            biometricDesc: 'Scans physical traits but doesn\'t create a user-controllable pattern.',
            blockchainDesc: 'Creates a cryptographic hash with no visual representation.',
            visualData: {
                shape: hankoSystem.shapeCoordinates ? { 
                    points: hankoSystem.shapeCoordinates,
                    centroid: {
                        x: hankoSystem.shapeCoordinates.reduce((sum, pt) => sum + pt.x, 0) / hankoSystem.shapeCoordinates.length,
                        y: hankoSystem.shapeCoordinates.reduce((sum, pt) => sum + pt.y, 0) / hankoSystem.shapeCoordinates.length
                    }
                } : null
            }
        },
        {
            stepNumber: 3,
            title: 'Labyrinth/Clock Spin',
            hankoDesc: 'User spins the shape through a labyrinth path, adding movement and interaction.',
            twoFADesc: 'No interactive elements - purely static code entry.',
            biometricDesc: 'Static scan with no user-driven motion or interaction.',
            blockchainDesc: 'No interactive elements - purely text-based entries.',
            visualData: {
                path: hankoSystem.labyrinthPath
            }
        },
        {
            stepNumber: 4,
            title: 'Color Landing',
            hankoDesc: 'Final position determines a dynamic color code that changes per authentication.',
            twoFADesc: 'May show a simple green checkmark for confirmation only.',
            biometricDesc: 'Shows binary match/no-match result with no color variation.',
            blockchainDesc: 'Displays text-based hash with no visual color coding.',
            visualData: {
                color: hankoSystem.colorEndpoint
            }
        },
        {
            stepNumber: 5,
            title: 'Device/QR Sync',
            hankoDesc: 'QR code synchronizes the session across devices and links to identity.',
            twoFADesc: 'Requires separate verification on each device with new codes.',
            biometricDesc: 'Biometric data typically limited to the device where it was registered.',
            blockchainDesc: 'Can link across devices but requires private key or seed phrase.',
            visualData: {
                deviceID: hankoSystem.deviceID
            }
        },
        {
            stepNumber: 6,
            title: 'Legal Visual Stamp',
            hankoDesc: 'Generates a persistent visual stamp with Japanese characters that can be used for document verification.',
            twoFADesc: 'No persistent visual artifact - codes expire and have no visual representation.',
            biometricDesc: 'May produce a photo ID but not designed for document authentication.',
            blockchainDesc: 'Produces a text hash that can be verified but lacks visual distinctiveness.',
            visualData: {
                asciiArt: hankoSystem.generateHankoAsciiArt()
            }
        },
        {
            stepNumber: 7,
            title: 'Audit/Verify',
            hankoDesc: 'Both visual and cryptographic - humans can compare stamps visually, while systems verify the cryptographic elements.',
            twoFADesc: 'Only machine-verifiable through code matching with no human-visual component.',
            biometricDesc: 'Machine comparison of biometric data with little transparency in the matching process.',
            blockchainDesc: 'Requires blockchain explorer or similar tools to verify transactions/identity.',
            visualData: {
                hash: hankoSystem.verificationHash,
                colorName: hankoSystem.colorEndpoint ? hankoSystem.colorEndpoint.name : null,
                timestamp: hankoSystem.sessionTimestamp
            }
        }
    ];
    
    // Generate all images
    const imagePaths = [];
    for (const step of steps) {
        const imagePath = await createStepComparisonImage(
            step.stepNumber,
            step.title,
            step.hankoDesc,
            step.twoFADesc,
            step.biometricDesc,
            step.blockchainDesc,
            step.visualData
        );
        imagePaths.push(imagePath);
        console.log(`Generated image: ${imagePath}`);
    }
    
    // Generate a summary image
    const summaryPath = await createSummaryImage(steps.map(step => step.title), imagePaths);
    imagePaths.push(summaryPath);
    
    console.log(`All comparison images generated in: ${outputDir}`);
    return imagePaths;
}

/**
 * Creates a summary image with thumbnails of all steps
 * @param {Array} stepTitles - Array of step titles
 * @param {Array} imagePaths - Array of paths to step images
 * @returns {Promise<String>} - Path to the generated summary image
 */
async function createSummaryImage(stepTitles, imagePaths) {
    // Canvas setup
    const width = 1200;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // Title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HankoStampID vs. Traditional Security Methods', width / 2, 60);
    
    // Subtitle
    ctx.fillStyle = '#666666';
    ctx.font = '18px Arial';
    ctx.fillText('Visual Authentication Comparison', width / 2, 90);
    
    // Load and draw thumbnails
    const thumbWidth = width / 4 - 40;
    const thumbHeight = thumbWidth * 0.67; // Maintain aspect ratio
    const startY = 130;
    
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    
    // First row - steps 1-4
    for (let i = 0; i < 4; i++) {
        const x = 20 + i * (thumbWidth + 40);
        const y = startY;
        
        // Placeholder for thumbnail
        ctx.fillStyle = '#F2F2F2';
        ctx.fillRect(x, y, thumbWidth, thumbHeight);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, thumbWidth, thumbHeight);
        
        // Step title
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Step ${i + 1}: ${stepTitles[i]}`, x + thumbWidth / 2, y + thumbHeight + 25);
        
        // Load and draw image if available
        if (imagePaths[i]) {
            try {
                const img = await loadImage(imagePaths[i]);
                ctx.drawImage(img, x, y, thumbWidth, thumbHeight);
            } catch (err) {
                console.error(`Error loading image: ${imagePaths[i]}`, err);
            }
        }
    }
    
    // Second row - steps 5-7 and conclusion
    for (let i = 0; i < 3; i++) {
        const x = 20 + i * (thumbWidth + 40);
        const y = startY + thumbHeight + 60;
        
        // Placeholder for thumbnail
        ctx.fillStyle = '#F2F2F2';
        ctx.fillRect(x, y, thumbWidth, thumbHeight);
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, thumbWidth, thumbHeight);
        
        // Step title
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Step ${i + 5}: ${stepTitles[i + 4]}`, x + thumbWidth / 2, y + thumbHeight + 25);
        
        // Load and draw image if available
        if (imagePaths[i + 4]) {
            try {
                const img = await loadImage(imagePaths[i + 4]);
                ctx.drawImage(img, x, y, thumbWidth, thumbHeight);
            } catch (err) {
                console.error(`Error loading image: ${imagePaths[i + 4]}`, err);
            }
        }
    }
    
    // Conclusion box
    const conclusionX = 20 + 3 * (thumbWidth + 40);
    const conclusionY = startY + thumbHeight + 60;
    
    ctx.fillStyle = '#E8F4FF';
    ctx.fillRect(conclusionX, conclusionY, thumbWidth, thumbHeight);
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.strokeRect(conclusionX, conclusionY, thumbWidth, thumbHeight);
    
    // Conclusion title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Key Advantages', conclusionX + thumbWidth / 2, conclusionY + 30);
    
    // Conclusion points
    const points = [
        'Visual human verification',
        'Dynamic color coding',
        'Geometric patterns',
        'Legal-grade stamps',
        'Cross-device sync'
    ];
    
    ctx.textAlign = 'left';
    ctx.font = '14px Arial';
    
    points.forEach((point, i) => {
        ctx.fillText(`• ${point}`, conclusionX + 15, conclusionY + 60 + i * 25);
    });
    
    // Footer text
    ctx.textAlign = 'center';
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.fillText('© 2025 CharlyOlson - Solidarity Platform - HankoStampID Authentication System', width / 2, height - 30);
    
    // Save the image
    const outputPath = path.join(outputDir, 'hanko_security_comparison_summary.png');
    const out = fs.createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    
    return new Promise((resolve, reject) => {
        out.on('finish', () => resolve(outputPath));
        out.on('error', reject);
    });
}

// Run the generation if this script is executed directly
if (require.main === module) {
    generateAllComparisonImages().catch(err => {
        console.error('Error generating comparison images:', err);
    });
}

module.exports = {
    generateAllComparisonImages,
    createStepComparisonImage,
    createSummaryImage
};