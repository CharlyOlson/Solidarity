// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RevenueAllocationExample
 * @dev Node 4 of Twelve-Node Self-Correcting System
 * Manages allocation of revenue to charity, payroll, and operational reserves.
 */
contract RevenueAllocationExample {
    uint256 public charityFund;
    uint256 public payrollFund;
    uint256 public operationalReserve;

    bool public alphaLock;
    bool public betaLock;
    bool public omegaLock;

    event RevenueAllocated(uint256 charity, uint256 payroll, uint256 reserve);
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

    function allocateRevenue(uint256 totalRevenue) public {
        require(totalRevenue > 0, "Revenue must be positive");
        require(!omegaLock, "Omega lock active");
        uint256 charity = (totalRevenue * 10) / 100;
        uint256 payroll = (totalRevenue * 20) / 100;
        uint256 reserve = totalRevenue - charity - payroll;
        charityFund += charity;
        payrollFund += payroll;
        operationalReserve += reserve;
        emit RevenueAllocated(charity, payroll, reserve);
    }
}
