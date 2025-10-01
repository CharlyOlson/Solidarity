// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TreasuryManager {
    uint256 public constant CHARITY_BP = 500; // 5%
    uint256 public constant PAYROLL_BP = 1000; // 10%
    uint256 public constant RESERVE_BP = 8500; // 85%
    
    uint256 public charityFund;
    uint256 public payrollFund;
    uint256 public operationalReserve;
    
    event RevenueAllocated(uint256 charity, uint256 payroll, uint256 reserve);

    function allocateRevenue(uint256 amount) external {
        uint256 charityAmount = (amount * CHARITY_BP) / 10000;
        uint256 payrollAmount = (amount * PAYROLL_BP) / 10000;
        uint256 reserveAmount = amount - charityAmount - payrollAmount;
        
        charityFund += charityAmount;
        payrollFund += payrollAmount;
        operationalReserve += reserveAmount;
        
        emit RevenueAllocated(charityAmount, payrollAmount, reserveAmount);
    }
    
    function growPayrollFund(uint256 growthPercentage) external {
        uint256 growth = (payrollFund * growthPercentage) / 10000;
        payrollFund += growth;
    }
}