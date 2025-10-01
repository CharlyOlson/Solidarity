// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OrbitalSphere {
    struct SphereState {
        uint256 radius;        // Radius of the sphere
        uint256 latBands;      // Number of latitude bands (horizontal slices)
        uint256 longBands;     // Number of longitude bands (vertical slices)
        uint256 quarterFill;   // Percentage fill for each quarter (0 to 100%)
    }

    SphereState public sphere;

    event SphereUpdated(
        uint256 radius,
        uint256 latBands,
        uint256 longBands,
        uint256 quarterFill
    );

    /**
     * @notice Initializes the sphere with default parameters.
     * @param _radius The initial radius of the sphere.
     * @param _latBands The number of latitude bands (horizontal slices).
     * @param _longBands The number of longitude bands (vertical slices).
     */
    constructor(uint256 _radius, uint256 _latBands, uint256 _longBands) {
        sphere = SphereState({
            radius: _radius,
            latBands: _latBands,
            longBands: _longBands,
            quarterFill: 100 // Default each quarter is fully filled (100%)
        });
    }

    /**
     * @notice Adjusts the radius of the sphere.
     * @param newRadius The new radius value (must be greater than 0).
     */
    function adjustRadius(uint256 newRadius) external {
        require(newRadius > 0, "Radius must be greater than 0");
        sphere.radius = newRadius;

        emit SphereUpdated(
            sphere.radius,
            sphere.latBands,
            sphere.longBands,
            sphere.quarterFill
        );
    }

    /**
     * @notice Adjusts the number of latitude and longitude bands of the sphere.
     * @param newLatBands The new number of latitude bands.
     * @param newLongBands The new number of longitude bands.
     */
    function adjustBands(uint256 newLatBands, uint256 newLongBands) external {
        require(newLatBands > 0, "Latitude bands must be greater than 0");
        require(newLongBands > 0, "Longitude bands must be greater than 0");

        sphere.latBands = newLatBands;
        sphere.longBands = newLongBands;

        emit SphereUpdated(
            sphere.radius,
            sphere.latBands,
            sphere.longBands,
            sphere.quarterFill
        );
    }

    /**
     * @notice Adjusts the fill percentage for each quarter of the sphere.
     * @param newQuarterFill The new quarter fill percentage (0 to 100).
     */
    function adjustQuarterFill(uint256 newQuarterFill) external {
        require(
            newQuarterFill <= 100,
            "Quarter fill percentage must be between 0 and 100"
        );
        sphere.quarterFill = newQuarterFill;

        emit SphereUpdated(
            sphere.radius,
            sphere.latBands,
            sphere.longBands,
            sphere.quarterFill
        );
    }

    /**
     * @notice Returns the current state of the sphere as a string.
     * @return A string representation of the sphere's current state.
     */
    function getSphereState() external view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "Radius: ",
                    uint2str(sphere.radius),
                    ", Latitude Bands: ",
                    uint2str(sphere.latBands),
                    ", Longitude Bands: ",
                    uint2str(sphere.longBands),
                    ", Quarter Fill: ",
                    uint2str(sphere.quarterFill),
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