// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GradientLayers is Ownable {
    // Visual Asset Tracking System - First Third Implementation
    // Scott Charles Olson (Charly) - Solidarity Platform
    
    struct GradientLayer {
        string name;
        string coreColor;           // Base color (e.g., "#3366CC")
        string overlayColor;        // Overlay color (pink/green/orange)
        uint256 transparencyFactor; // 50% = 5000 (basis points)
        uint256 gradientFactor;     // Slope intensity
        string assignedShape;       // Square, Triangle, Line
        bool isActive;
    }
    
    struct ThreePointSlope {
        uint256 pointA;            // First coordinate
        uint256 pointB;            // Second coordinate  
        uint256 pointC;            // Third coordinate (eliminates break)
        uint256 slopeFactor;       // Rise over run calculation
        bool chromiumMethod;       // Use chromium base layer
    }
    
    mapping(string => GradientLayer) public gradientLayers;
    mapping(string => ThreePointSlope) public slopeConfigs;
    mapping(string => uint256[2][]) public protectedRanges; // [[10,11], [12,16]]
    
    string[] public layerNames;
    
    // Events for tracking visual changes
    event LayerCreated(string indexed layerName, string coreColor, string overlayColor);
    event SlopeAdjusted(string indexed layerName, uint256 pointA, uint256 pointB, uint256 pointC);
    event TransparencyChanged(string indexed layerName, uint256 newTransparency);
    
    constructor() {
        // Initialize default protected ranges
        protectedRanges["default"].push([10, 11]);
        protectedRanges["default"].push([12, 16]);
    }
    
    function createGradientLayer(
        string memory layerName,
        string memory coreColor,
        string memory overlayColor,
        string memory assignedShape
    ) external onlyOwner {
        require(bytes(gradientLayers[layerName].name).length == 0, "Layer already exists");
        
        gradientLayers[layerName] = GradientLayer({
            name: layerName,
            coreColor: coreColor,
            overlayColor: overlayColor,
            transparencyFactor: 5000, // 50% default
            gradientFactor: 100,
            assignedShape: assignedShape,
            isActive: true
        });
        
        layerNames.push(layerName);
        emit LayerCreated(layerName, coreColor, overlayColor);
    }
    
    function defineThreePointSlope(
        string memory layerName,
        uint256 pointA,
        uint256 pointB, 
        uint256 pointC
    ) external onlyOwner {
        require(gradientLayers[layerName].isActive, "Layer does not exist");
        
        uint256 slope = calculateSlopeFactor(pointA, pointB, pointC);
        
        slopeConfigs[layerName] = ThreePointSlope({
            pointA: pointA,
            pointB: pointB,
            pointC: pointC,
            slopeFactor: slope,
            chromiumMethod: true
        });
        
        emit SlopeAdjusted(layerName, pointA, pointB, pointC);
    }
    
    function calculateSlopeFactor(uint256 pointA, uint256 pointB, uint256 pointC) 
        public pure returns (uint256) {
        // Three-point slope calculation (eliminates break conflicts)
        require(pointB > pointA, "Invalid point sequence");
        return ((pointC - pointA) * 1000) / (pointB - pointA); // *1000 for precision
    }
    
    function adjustTransparency(string memory layerName, uint256 newTransparency) 
        external onlyOwner {
        require(newTransparency <= 10000, "Transparency cannot exceed 100%");
        require(gradientLayers[layerName].isActive, "Layer does not exist");
        
        gradientLayers[layerName].transparencyFactor = newTransparency;
        emit TransparencyChanged(layerName, newTransparency);
    }
    
    function getLayerConfig(string memory layerName) 
        external view returns (GradientLayer memory) {
        return gradientLayers[layerName];
    }
    
    function getSlopeConfig(string memory layerName) 
        external view returns (ThreePointSlope memory) {
        return slopeConfigs[layerName];
    }
    
    function getAllLayers() external view returns (string[] memory) {
        return layerNames;
    }
}
