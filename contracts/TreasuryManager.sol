// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TreasuryManager
 * @dev Canonical distribution contract for the Solidarity platform.
 *
 * Encodes the distribution structure defined in SOLIDARITY_CHARTER.md v1.0.
 * Distribution logic is in the contract layer FIRST - not added later.
 *
 * Charter principle: "A system worth building is worth building correctly."
 *
 * @author Scott Charles Olson (Charly) - Soul.Ed.Xchange / Solidarity Platform
 * @author Hank - Charles H. Dykes (founding partner)
 */
contract TreasuryManager is Ownable, ReentrancyGuard {

    // ─────────────────────────────────────────────────────────────────────────
    // BASIS POINTS: 1% = 100 BP, 100% = 10000 BP
    // ─────────────────────────────────────────────────────────────────────────

    uint256 public constant BP_DENOMINATOR = 10000;

    // Named personal slots - 1% each (100 BP)
    uint256 public constant BP_SCOTT           = 100; // Scott Charles Olson - founder
    uint256 public constant BP_HANK            = 100; // Charles H. Dykes - founding partner
    uint256 public constant BP_HANK_CHOICE_1   = 100; // Hank names the person
    uint256 public constant BP_HANK_CHOICE_2   = 100;
    uint256 public constant BP_HANK_CHOICE_3   = 100;
    uint256 public constant BP_HANK_CHOICE_4   = 100;
    uint256 public constant BP_HANK_CAUSE_1    = 100; // Hank names the cause
    uint256 public constant BP_HANK_CAUSE_2    = 100;
    uint256 public constant BP_HANK_CAUSE_3    = 100;
    uint256 public constant BP_SCOTTS_MOTHER   = 100; // Scott's mother - named
    uint256 public constant BP_SOPHIE_JONES    = 100; // Sophie Jones - named
    uint256 public constant BP_MARIAH          = 100; // Mariah - named
    uint256 public constant BP_COLOMBIA        = 100; // Colombia Community Fund
    uint256 public constant BP_OPEN_SLOT_A     = 100; // Governance-nominated
    uint256 public constant BP_OPEN_SLOT_B     = 100; // Governance-nominated

    // Total named: 15% (1500 BP)
    // Founder Infrastructure Reserve: sized at first distribution (set by owner once)
    // Class Equity & Rebuild Fund: remainder - the large amount

    uint256 public infrastructureReserveBP; // Set once by owner at first distribution
    bool    public infrastructureReserveSet;

    // ─────────────────────────────────────────────────────────────────────────
    // RECIPIENT ADDRESSES
    // ─────────────────────────────────────────────────────────────────────────

    address payable public scott;
    address payable public hank;
    address payable public hankChoice1;
    address payable public hankChoice2;
    address payable public hankChoice3;
    address payable public hankChoice4;
    address payable public hankCause1;
    address payable public hankCause2;
    address payable public hankCause3;
    address payable public scottsMotherAddr;
    address payable public sophieJones;
    address payable public mariah;
    address payable public colombiaFund;
    address payable public openSlotA;
    address payable public openSlotB;
    address payable public infrastructureReserve;
    address payable public classEquityRebuildFund;

    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────

    uint256 public totalDistributed;
    uint256 public distributionCount;

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTS
    // ─────────────────────────────────────────────────────────────────────────

    event RevenueDistributed(
        uint256 indexed distributionId,
        uint256 totalAmount,
        uint256 classEquityAmount,
        uint256 timestamp
    );

    event SlotAddressUpdated(string slotName, address newAddress);
    event InfrastructureReserveSized(uint256 basisPoints);

    // ─────────────────────────────────────────────────────────────────────────
    // CONSTRUCTOR
    // ─────────────────────────────────────────────────────────────────────────

    constructor(
        address payable _scott,
        address payable _hank,
        address payable _classEquityRebuildFund,
        address payable _infrastructureReserve
    ) {
        require(_scott              != address(0), "Scott address required");
        require(_hank               != address(0), "Hank address required");
        require(_classEquityRebuildFund != address(0), "Class equity fund address required");
        require(_infrastructureReserve  != address(0), "Infrastructure reserve address required");

        scott                  = _scott;
        hank                   = _hank;
        classEquityRebuildFund = _classEquityRebuildFund;
        infrastructureReserve  = _infrastructureReserve;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SETUP - Owner sets remaining slots before first distribution
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @dev Set infrastructure reserve basis points. Can only be called once.
     * Charter: "Founder Infrastructure Reserve: sized at first distribution."
     */
    function setInfrastructureReserveBP(uint256 _bp) external onlyOwner {
        require(!infrastructureReserveSet, "Already set - cannot change");
        require(_bp <= 1000, "Cannot exceed 10% of gross revenue");
        infrastructureReserveBP = _bp;
        infrastructureReserveSet = true;
        emit InfrastructureReserveSized(_bp);
    }

    function setHankChoices(
        address payable _c1,
        address payable _c2,
        address payable _c3,
        address payable _c4
    ) external onlyOwner {
        hankChoice1 = _c1;
        hankChoice2 = _c2;
        hankChoice3 = _c3;
        hankChoice4 = _c4;
        emit SlotAddressUpdated("hankChoice1-4", _c1);
    }

    function setHankCauses(
        address payable _cause1,
        address payable _cause2,
        address payable _cause3
    ) external onlyOwner {
        hankCause1 = _cause1;
        hankCause2 = _cause2;
        hankCause3 = _cause3;
        emit SlotAddressUpdated("hankCauses1-3", _cause1);
    }

    function setNamedSlots(
        address payable _scottsMother,
        address payable _sophieJones,
        address payable _mariah,
        address payable _colombia
    ) external onlyOwner {
        scottsMotherAddr = _scottsMother;
        sophieJones      = _sophieJones;
        mariah           = _mariah;
        colombiaFund     = _colombia;
        emit SlotAddressUpdated("scotts-mother", _scottsMother);
        emit SlotAddressUpdated("sophie-jones",  _sophieJones);
        emit SlotAddressUpdated("mariah",        _mariah);
        emit SlotAddressUpdated("colombia",      _colombia);
    }

    function setOpenSlots(
        address payable _slotA,
        address payable _slotB
    ) external onlyOwner {
        // Open slots require governance nomination + three-body balance test
        // Enforced off-chain; on-chain owner is the elected governance address
        openSlotA = _slotA;
        openSlotB = _slotB;
        emit SlotAddressUpdated("openSlotA", _slotA);
        emit SlotAddressUpdated("openSlotB", _slotB);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DISTRIBUTION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * @dev Distribute incoming revenue according to charter.
     * All named slots receive 1% each. Remainder goes to Class Equity & Rebuild Fund.
     *
     * Slots with zero address are held in contract until address is set.
     * Nothing is lost - unclaimed amounts accumulate and are distributed
     * on the next call once addresses are set.
     */
    function distribute() external payable nonReentrant {
        require(msg.value > 0, "No revenue to distribute");
        require(infrastructureReserveSet, "Infrastructure reserve BP not set yet");

        uint256 total = msg.value;

        // Infra reserve first (sized at first distribution)
        uint256 infraAmount = (total * infrastructureReserveBP) / BP_DENOMINATOR;

        // Named 1% slots
        uint256 scottAmt        = _bp(total, BP_SCOTT);
        uint256 hankAmt         = _bp(total, BP_HANK);
        uint256 hc1Amt          = _bp(total, BP_HANK_CHOICE_1);
        uint256 hc2Amt          = _bp(total, BP_HANK_CHOICE_2);
        uint256 hc3Amt          = _bp(total, BP_HANK_CHOICE_3);
        uint256 hc4Amt          = _bp(total, BP_HANK_CHOICE_4);
        uint256 cause1Amt       = _bp(total, BP_HANK_CAUSE_1);
        uint256 cause2Amt       = _bp(total, BP_HANK_CAUSE_2);
        uint256 cause3Amt       = _bp(total, BP_HANK_CAUSE_3);
        uint256 motherAmt       = _bp(total, BP_SCOTTS_MOTHER);
        uint256 sophieAmt       = _bp(total, BP_SOPHIE_JONES);
        uint256 mariahAmt       = _bp(total, BP_MARIAH);
        uint256 colombiaAmt     = _bp(total, BP_COLOMBIA);
        uint256 openAmt         = _bp(total, BP_OPEN_SLOT_A);
        uint256 openBAmt        = _bp(total, BP_OPEN_SLOT_B);

        uint256 named = infraAmount + scottAmt + hankAmt +
            hc1Amt + hc2Amt + hc3Amt + hc4Amt +
            cause1Amt + cause2Amt + cause3Amt +
            motherAmt + sophieAmt + mariahAmt +
            colombiaAmt + openAmt + openBAmt;

        // Class Equity & Rebuild Fund gets the remainder - the large amount
        uint256 classEquityAmt = total - named;

        // Transfers - zero addresses accumulate in contract
        _send(infrastructureReserve, infraAmount);
        _send(scott,           scottAmt);
        _send(hank,            hankAmt);
        _send(hankChoice1,     hc1Amt);
        _send(hankChoice2,     hc2Amt);
        _send(hankChoice3,     hc3Amt);
        _send(hankChoice4,     hc4Amt);
        _send(hankCause1,      cause1Amt);
        _send(hankCause2,      cause2Amt);
        _send(hankCause3,      cause3Amt);
        _send(scottsMotherAddr, motherAmt);
        _send(sophieJones,     sophieAmt);
        _send(mariah,          mariahAmt);
        _send(colombiaFund,    colombiaAmt);
        _send(openSlotA,       openAmt);
        _send(openSlotB,       openBAmt);
        _send(classEquityRebuildFund, classEquityAmt);

        totalDistributed += total;
        distributionCount++;

        emit RevenueDistributed(distributionCount, total, classEquityAmt, block.timestamp);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERNAL HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    function _bp(uint256 amount, uint256 basisPoints) internal pure returns (uint256) {
        return (amount * basisPoints) / BP_DENOMINATOR;
    }

    /**
     * @dev Send ETH to address. If address is zero, funds stay in contract
     * (accumulated for future distribution once address is set).
     */
    function _send(address payable recipient, uint256 amount) internal {
        if (recipient != address(0) && amount > 0) {
            (bool ok, ) = recipient.call{value: amount}("");
            require(ok, "Transfer failed");
        }
    }

    /**
     * @dev Owner can flush accumulated undistributed funds to a slot
     * once its address has been set.
     */
    function flushAccumulated(address payable recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "Zero address");
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to flush");
        (bool ok, ) = recipient.call{value: balance}("");
        require(ok, "Flush failed");
    }

    receive() external payable {}
}
