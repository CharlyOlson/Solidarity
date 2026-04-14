// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LattosphereCircle {
    struct CircleState {
        uint256 radius; // Radius of the circle
        uint256 latDensity; // Number of horizontal bands (latitude lines)
        uint256 longDensity; // Number of vertical bands (longitude lines)
        uint256 fullness; // Defines how "full" the circle is (0 to 100%)
    }

    CircleState public circle;

    event CircleUpdated(
        uint256 radius,
        uint256 latDensity,
        uint256 longDensity,
        uint256 fullness
    );

    /**
     * @notice Initializes the circle with default parameters.
     * @param _radius The initial radius of the circle.
     * @param _latDensity The number of horizontal bands (latitude lines).
     * @param _longDensity The number of vertical bands (longitude lines).
     */
    constructor(uint256 _radius, uint256 _latDensity, uint256 _longDensity) {
        circle = CircleState({
            radius: _radius,
            latDensity: _latDensity,
            longDensity: _longDensity,
            fullness: 50 // Default fullness is 50%
        });
    }

    /**
     * @notice Adjusts the radius of the circle.
     * @param newRadius The new radius value.
     */
    function adjustRadius(uint256 newRadius) external {
        require(newRadius > 0, "Radius must be greater than 0");
        circle.radius = newRadius;

        emit CircleUpdated(
            circle.radius,
            circle.latDensity,
            circle.longDensity,
            circle.fullness
        );
    }

    /**
     * @notice Adjusts the density of the latitude and longitude bands.
     * @param newLatDensity The new density for latitude bands.
     * @param newLongDensity The new density for longitude bands.
     */
    function adjustDensity(uint256 newLatDensity, uint256 newLongDensity)
        external
    {
        require(newLatDensity > 0, "Latitude density must be greater than 0");
        require(newLongDensity > 0, "Longitude density must be greater than 0");

        circle.latDensity = newLatDensity;
        circle.longDensity = newLongDensity;

        emit CircleUpdated(
            circle.radius,
            circle.latDensity,
            circle.longDensity,
            circle.fullness
        );
    }

    /**
     * @notice Adjusts the fullness of the circle.
     * @param newFullness The new fullness value (0 to 100).
     */
    function adjustFullness(uint256 newFullness) external {
        require(newFullness <= 100, "Fullness must be between 0 and 100");
        circle.fullness = newFullness;

        emit CircleUpdated(
            circle.radius,
            circle.latDensity,
            circle.longDensity,
            circle.fullness
        );
    }

    /**
     * @notice Returns the current state of the circle as a descriptive string.
     * @return A string representation of the circle's current state.
     */
    function getCircleState() external view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "Radius: ",
                    uint2str(circle.radius),
                    ", Latitude Density: ",
                    uint2str(circle.latDensity),
                    ", Longitude Density: ",
                    uint2str(circle.longDensity),
                    ", Fullness: ",
                    uint2str(circle.fullness),
                    "%"
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