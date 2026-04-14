// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HabitualCorrection
 * @dev Smart contract for managing habitual correction patterns in the Solidarity Platform
 * @author Scott Charles Olson (CharlyOlson)
 * @notice Part of the Soul.Ed.Xchange.Fi ecosystem
 */
contract HabitualCorrection {
    struct CorrectionPattern {
        uint256 nodeID;
        uint256 habitualOffsetFactor;
        uint256 variabilityShift;
        bool stabilityReinforcement;
        uint256 timestamp;
        address updatedBy;
    }

    mapping(uint256 => CorrectionPattern) public corrections;
    mapping(address => bool) public authorizedUpdaters;
    uint256[] public activeNodes;
    address public deployer;

    event CorrectionPatternSet(
        uint256 indexed nodeID,
        uint256 offsetFactor,
        uint256 shiftValue,
        address indexed updater
    );

    event CorrectionRetrieved(
        uint256 indexed nodeID,
        address indexed requester
    );

    event AuthorizedUpdaterAdded(address indexed updater);

    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender], "Unauthorized access");
        _;
    }

    constructor() {
        deployer = msg.sender;
        authorizedUpdaters[msg.sender] = true;
        emit AuthorizedUpdaterAdded(msg.sender);
    }

    function addAuthorizedUpdater(address updater) public onlyAuthorized {
        require(!authorizedUpdaters[updater], "Updater already authorized");
        authorizedUpdaters[updater] = true;
        emit AuthorizedUpdaterAdded(updater);
    }

    function setCorrectionPattern(
        uint256 nodeID,
        uint256 offsetFactor,
        uint256 shiftValue
    ) public onlyAuthorized {
        require(offsetFactor > 0, "Offset factor must be positive");
        require(shiftValue <= 100, "Shift value cannot exceed 100");

        bool isNewNode = corrections[nodeID].nodeID == 0;

        corrections[nodeID] = CorrectionPattern({
            nodeID: nodeID,
            habitualOffsetFactor: offsetFactor,
            variabilityShift: shiftValue,
            stabilityReinforcement: true,
            timestamp: block.timestamp,
            updatedBy: msg.sender
        });

        if (isNewNode) {
            activeNodes.push(nodeID);
        }

        emit CorrectionPatternSet(nodeID, offsetFactor, shiftValue, msg.sender);
    }

    function retrieveCorrection(uint256 nodeID)
        public
        view
        returns (
            uint256 offsetFactor,
            uint256 shiftValue,
            bool stabilityReinforcement,
            uint256 timestamp
        )
    {
        CorrectionPattern memory pattern = corrections[nodeID];
        require(pattern.nodeID != 0, "Node not found");

        return (
            pattern.habitualOffsetFactor,
            pattern.variabilityShift,
            pattern.stabilityReinforcement,
            pattern.timestamp
        );
    }

    function getAllActiveNodes() public view returns (uint256[] memory) {
        return activeNodes;
    }

    function getCorrectionDetails(uint256 nodeID)
        public
        returns (CorrectionPattern memory)
    {
        require(corrections[nodeID].nodeID != 0, "Node not found");
        emit CorrectionRetrieved(nodeID, msg.sender);
        return corrections[nodeID];
    }

    /**
     * @dev Integration with Solidarity harmonic generation system
     * @param nodeID The harmonic node identifier (1, 3, 4, 7, 14, 21)
     * @return harmonicOffset The offset factor for harmonic generation
     * @return variabilityFactor The variability factor for system stability
     */
    function getHarmonicCorrectionData(uint256 nodeID)
        public
        view
        returns (uint256 harmonicOffset, uint256 variabilityFactor)
    {
        CorrectionPattern memory pattern = corrections[nodeID];
        require(pattern.nodeID != 0, "Node not found");

        return (pattern.habitualOffsetFactor, pattern.variabilityShift);
    }
}