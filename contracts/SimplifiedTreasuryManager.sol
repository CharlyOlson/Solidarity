// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TreasuryManager {
    uint256 public constant CHARITY_BP = 3333; // 33.33%
    uint256 public constant PAYROLL_BP = 3333; // 33.33%
    uint256 public constant RESERVE_BP = 3334; // 33.34% (to account for rounding)

    uint256 public charityFund;
    uint256 public payrollFund;
    uint256 public reserveFund;

    event RevenueAllocated(uint256 charity, uint256 payroll, uint256 reserve);
    event FundWithdrawn(address indexed recipient, uint256 amount, string fundType);

    modifier validateAllocation(uint256 total) {
        require(total == (charityFund + payrollFund + reserveFund), "Allocation mismatch");
        _;
    }

    function allocateRevenue(uint256 amount) external {
        uint256 charityAmount = (amount * CHARITY_BP) / 10000;
        uint256 payrollAmount = (amount * PAYROLL_BP) / 10000;
        uint256 reserveAmount = amount - charityAmount - payrollAmount;

        charityFund += charityAmount;
        payrollFund += payrollAmount;
        reserveFund += reserveAmount;

        emit RevenueAllocated(charityAmount, payrollAmount, reserveAmount);
    }

    function withdrawFromFund(
        uint256 amount, 
        string memory fundType, 
        address recipient
    ) external validateAllocation(charityFund + payrollFund + reserveFund) {
        if (keccak256(bytes(fundType)) == keccak256("charity")) {
            require(amount <= charityFund, "Insufficient charity funds");
            charityFund -= amount;
        } else if (keccak256(bytes(fundType)) == keccak256("payroll")) {
            require(amount <= payrollFund, "Insufficient payroll funds");
            payrollFund -= amount;
        } else if (keccak256(bytes(fundType)) == keccak256("reserve")) {
            require(amount <= reserveFund, "Insufficient reserve funds");
            reserveFund -= amount;
        } else {
            revert("Invalid fund type");
        }

        payable(recipient).transfer(amount);
        emit FundWithdrawn(recipient, amount, fundType);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}