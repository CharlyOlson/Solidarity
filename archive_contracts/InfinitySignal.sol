// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InfinitySignal {
    // Represents the center point of the loop
    struct CenterPoint {
        uint256 x;
        uint256 y;
    }

    // Represents the dynamics of the movable loop
    struct MovableLoop {
        uint256 maxWidth; // Maximum width of the figure-eight or loop
        uint256 currentWidth; // Current width of the loop
        uint256 position; // Position relative to the center
    }

    // State variables
    CenterPoint public center;
    MovableLoop public loop;

    // Event for tracking loop changes
    event LoopUpdated(uint256 maxWidth, uint256 currentWidth, uint256 position);

    // Initialize the center point and the loop
    constructor(uint256 _x, uint256 _y, uint256 _maxWidth) {
        center = CenterPoint({x: _x, y: _y});
        loop = MovableLoop({maxWidth: _maxWidth, currentWidth: _maxWidth / 2, position: 0});
    }

    /**
     * @notice Updates the position and width of the loop dynamically.
     * @param newPosition The new position of the loop.
     * @param newWidth The new width of the loop. Must not exceed maxWidth.
     */
    function updateLoop(uint256 newPosition, uint256 newWidth) external {
        require(newWidth <= loop.maxWidth, "Width exceeds maximum limit");
        loop.position = newPosition;
        loop.currentWidth = newWidth;

        emit LoopUpdated(loop.maxWidth, loop.currentWidth, loop.position);
    }

    /**
     * @notice Resets the loop to its maximum width and center position.
     */
    function resetLoop() external {
        loop.currentWidth = loop.maxWidth / 2;
        loop.position = 0;

        emit LoopUpdated(loop.maxWidth, loop.currentWidth, loop.position);
    }

    /**
     * @return The current state of the loop as a string representation.
     */
    function getLoopState() external view returns (string memory) {
        return string(
            abi.encodePacked(
                "Center: (", 
                uint2str(center.x), 
                ", ", 
                uint2str(center.y), 
                "), Current Width: ", 
                uint2str(loop.currentWidth), 
                ", Position: ", 
                uint2str(loop.position)
            )
        );
    }

    // Utility function to convert uint256 to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            bstr[k] = bytes1(uint8(48 + uint256(_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }
}