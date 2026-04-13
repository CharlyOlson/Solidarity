// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./StabilityMetrics.sol";
import "./GovernanceModule.sol";

/**
 * @title IntegrationHub
 * @dev Connects stability metrics, governance, and off-chain monitoring.
 * Acts as a coordination point for the Twelve-Node Self-Correcting System.
 */

interface IOffChainMonitor {
    function logMonitorUpdate(string calldata message) external;
}

contract IntegrationHub {
    StabilityMetrics public stabilityMetrics;
    GovernanceModule public governanceModule;
    IOffChainMonitor public monitor;

    constructor(
        address _stability,
        address _governance,
        address _monitor
    ) {
        stabilityMetrics = StabilityMetrics(_stability);
        governanceModule = GovernanceModule(_governance);
        monitor = IOffChainMonitor(_monitor);
    }

    function processMetrics(
        uint256 price,
        uint256 volume,
        uint256 liquidity
    ) external {
        stabilityMetrics.updateMetrics(price, volume, liquidity);
        monitor.logMonitorUpdate("Processed stability metrics update.");
    }
}
