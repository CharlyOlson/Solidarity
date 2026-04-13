// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title StabilityMetrics
 * @dev Node 5 of Twelve-Node Self-Correcting System
 * Implements stability scoring using key metrics and Pythagorean-based error correction logic.
 */
contract StabilityMetrics {
    struct Metrics {
        uint256 price;
        uint256 volume;
        uint256 liquidity;
        uint256 stabilityScore;
        uint256 timestamp;
    }

    mapping(uint256 => Metrics) public dailyMetrics;
    uint256 public currentDay;

    bool public alphaLock;
    bool public betaLock;
    bool public omegaLock;

    event MetricsUpdated(uint256 indexed day, uint256 stabilityScore);
    event LockStatusChanged(string lockType, bool status);

    function setLock(string memory lockType, bool status) public {
        if (keccak256(bytes(lockType)) == keccak256(bytes("alpha"))) {
            alphaLock = status;
        } else if (keccak256(bytes(lockType)) == keccak256(bytes("beta"))) {
            betaLock = status;
        } else if (keccak256(bytes(lockType)) == keccak256(bytes("omega"))) {
            omegaLock = status;
        }
        emit LockStatusChanged(lockType, status);
    }

    function updateMetrics(uint256 price, uint256 volume, uint256 liquidity) public {
        require(!omegaLock, "Omega lock active");
        uint256 day = block.timestamp / 1 days;
        uint256 stabilityScore = calculateStabilityScore(price, volume, liquidity);
        dailyMetrics[day] = Metrics(price, volume, liquidity, stabilityScore, block.timestamp);
        currentDay = day;
        emit MetricsUpdated(day, stabilityScore);
    }

    function calculateStabilityScore(uint256 price, uint256 volume, uint256 liquidity) internal pure returns (uint256) {
        // Pythagorean-based error correction
        uint256 normalized = sqrt(price * price + volume * volume + liquidity * liquidity);
        return (normalized * 100) / 1000;
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function getCurrentMetrics() public view returns (Metrics memory) {
        return dailyMetrics[currentDay];
    }
}
