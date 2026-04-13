// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TreasuryManager {
    // Constants for Fund Allocation
    uint256 public constant FUND_DONATIONS_BP = 6000; // 60%
    uint256 public constant FUND_EVENT_FEES_BP = 4000; // 40%

    // Bank balances
    uint256 public individualCaseCharityFund;
    uint256 public payrollFund;
    uint256 public charityEventsFund;
    uint256 public longevityFund;

    // Fund balances
    uint256 public donationsFund;
    uint256 public eventAttendanceFund;

    // Events
    event AllocationValidated(uint256 totalBasisPoints);

    // Function to validate the constants
    function validateConstants() public pure returns (bool) {
        uint256 totalBP = FUND_DONATIONS_BP + FUND_EVENT_FEES_BP;
        require(totalBP == 10000, "Total basis points must equal 10000");
        return true;
    }

    // Example of safe arithmetic operation
    function safeAdd(uint256 a, uint256 b) public pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "Addition overflow");
        return c;
    }

    // Example of using validation
    function allocateFunds(uint256 amount) external {
        require(validateConstants(), "Constants validation failed");

        uint256 donationAmount = (amount * FUND_DONATIONS_BP) / 10000;
        uint256 eventAttendanceAmount = (amount * FUND_EVENT_FEES_BP) / 10000;

        // Prevent overflow
        donationsFund = safeAdd(donationsFund, donationAmount);
        eventAttendanceFund = safeAdd(eventAttendanceFund, eventAttendanceAmount);

        // Emit validation event
        emit AllocationValidated(FUND_DONATIONS_BP + FUND_EVENT_FEES_BP);
    }
}