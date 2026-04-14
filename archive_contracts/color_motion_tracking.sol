// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ColorMotionTracking {
    struct MotionColor {
        string assetSymbol;         // Represents the tracked asset
        string coreColor;           // Chakra-inspired base color for stability
        string neonPulseColor;      // Bright neon for movements
        string pastelTrailColor;    // Pastel projections for historical trails
        uint256 transitionSpeed;    // Speed of transitions
    }

    mapping(string => MotionColor) public motionColors;

    function setMotionColor(
        string memory assetSymbol, 
        string memory coreColor, 
        string memory neonPulseColor, 
        string memory pastelTrailColor, 
        uint256 transitionSpeed
    ) public {
        motionColors[assetSymbol] = MotionColor(
            assetSymbol, 
            coreColor, 
            neonPulseColor, 
            pastelTrailColor, 
            transitionSpeed
        );
    }

    function getMotionColor(string memory assetSymbol) 
        public 
        view 
        returns (string memory coreColor, string memory neonPulseColor) 
    {
        return (
            motionColors[assetSymbol].coreColor, 
            motionColors[assetSymbol].neonPulseColor
        );
    }
}