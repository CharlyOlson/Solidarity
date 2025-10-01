// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StabilityMetrics {
    struct MetricPoint {
        uint256 timestamp;       // Timestamp when the metric was recorded
        uint256 price;           // Price value of the metric
        uint256 volume;          // Volume value of the metric
        uint256 liquidityDepth;  // Liquidity depth value of the metric
    }
    
    MetricPoint[] public metrics;  // Array to store all recorded metrics
    
    event MetricRecorded(uint256 timestamp, uint256 price, uint256 volume, uint256 liquidityDepth);
    
    /**
     * @notice Records a new metric point with the given parameters.
     * @param price The price value of the metric.
     * @param volume The volume value of the metric.
     * @param liquidityDepth The liquidity depth value of the metric.
     */
    function recordMetric(uint256 price, uint256 volume, uint256 liquidityDepth) external {
        metrics.push(MetricPoint({
            timestamp: block.timestamp,
            price: price,
            volume: volume,
            liquidityDepth: liquidityDepth
        }));
        emit MetricRecorded(block.timestamp, price, volume, liquidityDepth);
    }
    
    /**
     * @notice Calculates a stability score based on current price, baseline price, and volatility threshold.
     * @param currentPrice The current price value.
     * @param baselinePrice The baseline price value.
     * @param volatilityThreshold The volatility threshold value.
     * @return The calculated stability score.
     */
    function calculateStabilityScore(
        uint256 currentPrice,
        uint256 baselinePrice,
        uint256 volatilityThreshold
    ) public pure returns (uint256) {
        uint256 priceDiff = currentPrice > baselinePrice 
            ? currentPrice - baselinePrice 
            : baselinePrice - currentPrice;
        uint256 combinedError = sqrt((priceDiff * priceDiff) + (volatilityThreshold * volatilityThreshold));
        uint256 softenedError = combinedError / 2;
        return softenedError;
    }
    
    /**
     * @notice Calculates the square root of a given number using the Babylonian method.
     * @param x The number to calculate the square root of.
     * @return The square root of the input number.
     */
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
}