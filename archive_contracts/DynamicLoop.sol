// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DynamicLoop {
    struct LoopState {
        uint256 fullness; // Represents how full the loop is (0 to 100%)
        uint256 tension; // Represents the tension or elasticity of the loop (scaled 0 to 100)
        uint256 frameWidth; // Maximum allowable width for the loop
        uint256 currentWidth; // Current width of the loop
    }

    LoopState public loop;

    event LoopAdjusted(uint256 fullness, uint256 tension, uint256 currentWidth);

    /**
     * @notice Initializes the loop with default parameters.
     * @param _frameWidth The maximum allowable width for the loop.
     */
    constructor(uint256 _frameWidth) {
        loop = LoopState({
            fullness: 50, // Default fullness is 50% (neutral state)
            tension: 50, // Default tension is 50% (elastic but stable)
            frameWidth: _frameWidth,
            currentWidth: _frameWidth / 2 // Start at half of the frame width
        });
    }

    /**
     * @notice Adjusts the loop's fullness and dynamically recalculates its width.
     * @param newFullness The new fullness value (0 to 100).
     */
    function adjustFullness(uint256 newFullness) external {
        require(newFullness <= 100, "Fullness must be between 0 and 100");
        loop.fullness = newFullness;

        // Calculate the new width based on fullness
        loop.currentWidth = (loop.frameWidth * loop.fullness) / 100;

        // Emit an event to log the adjustment
        emit LoopAdjusted(loop.fullness, loop.tension, loop.currentWidth);
    }

    /**
     * @notice Adjusts the loop's tension and dynamically recalculates its behavior.
     * @param newTension The new tension value (0 to 100).
     */
    function adjustTension(uint256 newTension) external {
        require(newTension <= 100, "Tension must be between 0 and 100");
        loop.tension = newTension;

        // Recalculate the current width to simulate tension (more tension = narrower loop)
        loop.currentWidth = (loop.frameWidth * (100 - loop.tension)) / 100;

        // Emit an event to log the adjustment
        emit LoopAdjusted(loop.fullness, loop.tension, loop.currentWidth);
    }

    /**
     * @notice Resets the loop to its default state.
     */
    function resetLoop() external {
        loop.fullness = 50;
        loop.tension = 50;
        loop.currentWidth = loop.frameWidth / 2;

        emit LoopAdjusted(loop.fullness, loop.tension, loop.currentWidth);
    }

    /**
     * @notice Returns the current state of the loop.
     * @return A descriptive string of the loop's current state.
     */
    function getLoopState() external view returns (string memory) {
        return string(
            abi.encodePacked(
                "Fullness: ", uint2str(loop.fullness),
                "%, Tension: ", uint2str(loop.tension),
                "%, Current Width: ", uint2str(loop.currentWidth)
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