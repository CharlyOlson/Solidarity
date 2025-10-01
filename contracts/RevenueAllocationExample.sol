// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TreasuryManager {
    uint256 public charityFund;
    uint256 public payrollFund;
    uint256 public operationalReserve;

    event RevenueAllocated(uint256 charity, uint256 payroll, uint256 reserve);

    // Function to allocate revenue
    function allocateRevenue(uint256 amount) external {
        uint256 charityAmount = (amount * 500) / 10000; // 5% for charity
        uint256 payrollAmount = (amount * 1000) / 10000; // 10% for payroll
        uint256 reserveAmount = amount - charityAmount - payrollAmount; // Remaining 85%

        // Update fund balances
        charityFund += charityAmount;
        payrollFund += payrollAmount;
        operationalReserve += reserveAmount;

        // Emit the allocation event
        emit RevenueAllocated(charityAmount, payrollAmount, reserveAmount);
    }
}