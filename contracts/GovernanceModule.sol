// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GovernanceModule {
    address public admin;
    
    event PayrollAdjusted(uint256 newPayrollAmount);
    event AllocationUpdated(uint256 charityBP, uint256 payrollBP, uint256 reserveBP);
    
    constructor() {
        admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }
    
    function adjustPayroll(uint256 newAmount) external onlyAdmin {
        emit PayrollAdjusted(newAmount);
    }
    
    function updateAllocations(uint256 charityBP, uint256 payrollBP, uint256 reserveBP) external onlyAdmin {
        require(charityBP + payrollBP + reserveBP == 10000, "Total must equal 10000 BP");
        emit AllocationUpdated(charityBP, payrollBP, reserveBP);
    }
}