// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/security/ReentrancyGuard.sol";

/**
 * @title SolidarityToken
 * @dev Main token contract for the Solidarity platform
 * @author Scott Charles Olson (Charly)
 */
contract SolidarityToken is ERC20, Ownable, ReentrancyGuard {
    
    // Treasury allocation percentages
    uint256 public constant COMMUNITY_POOL_PERCENTAGE = 5;
    uint256 public constant PAYROLL_TREASURY_PERCENTAGE = 10;
    
    // Treasury addresses
    address public communityPool;
    address public payrollTreasury;
    address public operationalReserve;
    
    // Stability metrics
    struct StabilityMetrics {
        uint256 price;
        uint256 volume;
        uint256 liquidityDepth;
        uint256 stabilityScore;
        uint256 timestamp;
    }
    
    mapping(uint256 => StabilityMetrics) public dailyMetrics;
    uint256 public currentDay;
    
    // Events
    event MetricsUpdated(uint256 indexed day, uint256 stabilityScore);
    event TreasuryDistribution(uint256 communityAmount, uint256 payrollAmount, uint256 operationalAmount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address _communityPool,
        address _payrollTreasury,
        address _operationalReserve
    ) ERC20(name, symbol) {
        require(_communityPool != address(0), "Invalid community pool address");
        require(_payrollTreasury != address(0), "Invalid payroll treasury address");
        require(_operationalReserve != address(0), "Invalid operational reserve address");
        
        communityPool = _communityPool;
        payrollTreasury = _payrollTreasury;
        operationalReserve = _operationalReserve;
        
        _mint(msg.sender, initialSupply * 10**decimals());
        currentDay = block.timestamp / 1 days;
    }
    
    /**
     * @dev Updates daily stability metrics
     */
    function updateStabilityMetrics(
        uint256 _price,
        uint256 _volume,
        uint256 _liquidityDepth
    ) external onlyOwner {
        uint256 day = block.timestamp / 1 days;
        
        // Calculate stability score using Pythagorean-based error correction
        uint256 stabilityScore = calculateStabilityScore(_price, _volume, _liquidityDepth);
        
        dailyMetrics[day] = StabilityMetrics({
            price: _price,
            volume: _volume,
            liquidityDepth: _liquidityDepth,
            stabilityScore: stabilityScore,
            timestamp: block.timestamp
        });
        
        currentDay = day;
        emit MetricsUpdated(day, stabilityScore);
    }
    
    /**
     * @dev Distributes incoming funds to treasury pools
     */
    function distributeTreasuryFunds() external payable nonReentrant {
        require(msg.value > 0, "No funds to distribute");
        
        uint256 communityAmount = (msg.value * COMMUNITY_POOL_PERCENTAGE) / 100;
        uint256 payrollAmount = (msg.value * PAYROLL_TREASURY_PERCENTAGE) / 100;
        uint256 operationalAmount = msg.value - communityAmount - payrollAmount;
        
        // Transfer funds to respective pools
        payable(communityPool).transfer(communityAmount);
        payable(payrollTreasury).transfer(payrollAmount);
        payable(operationalReserve).transfer(operationalAmount);
        
        emit TreasuryDistribution(communityAmount, payrollAmount, operationalAmount);
    }
    
    /**
     * @dev Calculates stability score using proprietary algorithm
     */
    function calculateStabilityScore(
        uint256 _price,
        uint256 _volume,
        uint256 _liquidityDepth
    ) internal pure returns (uint256) {
        // Pythagorean-based error correction mechanism
        // This is a simplified version - implement full algorithm based on whitepaper
        uint256 normalized = sqrt(_price * _price + _volume * _volume + _liquidityDepth * _liquidityDepth);
        return (normalized * 100) / 1000; // Scale to percentage
    }
    
    /**
     * @dev Square root function for calculations
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
    
    /**
     * @dev Get current stability metrics
     */
    function getCurrentMetrics() external view returns (StabilityMetrics memory) {
        return dailyMetrics[currentDay];
    }
}
