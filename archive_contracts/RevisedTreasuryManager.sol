// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TreasuryManager {
    // Constants for Bank Allocation
    uint256 public constant BANK_INDIVIDUAL_CASE_CHARITY_BP = 6000; // 60%
    uint256 public constant BANK_PAYROLL_BP = 2000; // 20%
    uint256 public constant BANK_CHARITY_EVENTS_BP = 500; // 5%
    uint256 public constant BANK_LONGEVITY_BP = 1500; // 15%

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
    event BankRevenueAllocated(uint256 individualCaseCharity, uint256 payroll, uint256 charityEvents, uint256 longevity);
    event FundRevenueAllocated(uint256 donations, uint256 eventAttendance);
    event FundWithdrawn(address indexed recipient, uint256 amount, string fundType);

    modifier validateAllocation(uint256 total) {
        require(total == (individualCaseCharityFund + payrollFund + charityEventsFund + longevityFund), "Allocation mismatch");
        _;
    }

    // Allocate revenue for Bank category
    function allocateBankRevenue(uint256 amount) external {
        uint256 individualCharityAmount = (amount * BANK_INDIVIDUAL_CASE_CHARITY_BP) / 10000;
        uint256 payrollAmount = (amount * BANK_PAYROLL_BP) / 10000;
        uint256 charityEventsAmount = (amount * BANK_CHARITY_EVENTS_BP) / 10000;
        uint256 longevityAmount = amount - individualCharityAmount - payrollAmount - charityEventsAmount;

        individualCaseCharityFund += individualCharityAmount;
        payrollFund += payrollAmount;
        charityEventsFund += charityEventsAmount;
        longevityFund += longevityAmount;

        emit BankRevenueAllocated(individualCharityAmount, payrollAmount, charityEventsAmount, longevityAmount);
    }

    // Allocate revenue for Fund category
    function allocateFundRevenue(uint256 amount) external {
        uint256 donationAmount = (amount * FUND_DONATIONS_BP) / 10000;
        uint256 eventAttendanceAmount = amount - donationAmount;

        donationsFund += donationAmount;
        eventAttendanceFund += eventAttendanceAmount;

        emit FundRevenueAllocated(donationAmount, eventAttendanceAmount);
    }

    // Withdraw from any fund type
    function withdrawFromFund(
        uint256 amount,
        string memory fundType,
        address recipient
    ) external validateAllocation(individualCaseCharityFund + payrollFund + charityEventsFund + longevityFund) {
        if (keccak256(bytes(fundType)) == keccak256("individualCaseCharity")) {
            require(amount <= individualCaseCharityFund, "Insufficient individual case charity funds");
            individualCaseCharityFund -= amount;
        } else if (keccak256(bytes(fundType)) == keccak256("payroll")) {
            require(amount <= payrollFund, "Insufficient payroll funds");
            payrollFund -= amount;
        } else if (keccak256(bytes(fundType)) == keccak256("charityEvents")) {
            require(amount <= charityEventsFund, "Insufficient charity events funds");
            charityEventsFund -= amount;
        } else if (keccak256(bytes(fundType)) == keccak256("longevity")) {
            require(amount <= longevityFund, "Insufficient longevity funds");
            longevityFund -= amount;
        } else if (keccak256(bytes(fundType)) == keccak256("donations")) {
            require(amount <= donationsFund, "Insufficient donations funds");
            donationsFund -= amount;
        } else if (keccak256(bytes(fundType)) == keccak256("eventAttendance")) {
            require(amount <= eventAttendanceFund, "Insufficient event attendance funds");
            eventAttendanceFund -= amount;
        } else {
            revert("Invalid fund type");
        }

        payable(recipient).transfer(amount);
        emit FundWithdrawn(recipient, amount, fundType);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}