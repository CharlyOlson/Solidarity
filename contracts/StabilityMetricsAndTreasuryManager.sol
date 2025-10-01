// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
==============================================
Module A: Stability Metrics
----------------------------------------------
Records asset metrics (price, volume, liquidity) and computes 
a stability score using a Pythagorean-based error correction method.
*/
contract StabilityMetrics {
    struct MetricPoint {
        uint256 timestamp;
        uint256 price;
        uint256 volume;
        uint256 liquidityDepth;
    }

    MetricPoint[] public metrics;

    event MetricRecorded(uint256 timestamp, uint256 price, uint256 volume, uint256 liquidityDepth);

    // Record an asset metric point.
    function recordMetric(uint256 price, uint256 volume, uint256 liquidityDepth) external {
        metrics.push(MetricPoint({
            timestamp: block.timestamp,
            price: price,
            volume: volume,
            liquidityDepth: liquidityDepth
        }));
        emit MetricRecorded(block.timestamp, price, volume, liquidityDepth);
    }

    // Compute a stability score via a Pythagorean-based measure.
    function calculateStabilityScore(
        uint256 currentPrice,
        uint256 baselinePrice,
        uint256 volatilityThreshold
    ) public pure returns (uint256) {
        uint256 priceDiff = currentPrice > baselinePrice ? currentPrice - baselinePrice : baselinePrice - currentPrice;
        uint256 combinedError = sqrt((priceDiff * priceDiff) + (volatilityThreshold * volatilityThreshold));
        uint256 softenedError = combinedError / 2; // Gradient softening factor.
        return softenedError; // Lower score indicates higher stability.
    }

    // Newton's method for square root approximation.
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

/*
==============================================
Module B: Stable Treasury & Payroll
----------------------------------------------
Manages incoming revenue by splitting it into:
- Community/Charity Pool (e.g., 5%)
- Stable Payroll Treasury (e.g., 10%, growing algorithmically)
- Operational Reserve (remainder)
*/
contract TreasuryManager {
    // Allocation percentages in basis points (1% = 100 BP).
    uint256 public constant CHARITY_BP = 500; // 5%
    uint256 public constant PAYROLL_BP = 1000; // 10%
    uint256 public constant RESERVE_BP = 8500; // 85% = remaining funds.

    uint256 public charityFund;
    uint256 public payrollFund;
    uint256 public operationalReserve;

    event RevenueAllocated(uint256 charity, uint256 payroll, uint256 reserve);

    // Allocate revenue from incoming funds.
    function allocateRevenue(uint256 amount) external {
        uint256 charityAmount = (amount * CHARITY_BP) / 10000;
        uint256 payrollAmount = (amount * PAYROLL_BP) / 10000;
        uint256 reserveAmount = amount - charityAmount - payrollAmount;

        charityFund += charityAmount;
        payrollFund += payrollAmount;
        operationalReserve += reserveAmount;

        emit RevenueAllocated(charityAmount, payrollAmount, reserveAmount);
    }
}