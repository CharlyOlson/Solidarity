// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CommunityIntegration is Ownable {
    struct Community {
        string name;
        address treasury;
        uint256 participationLevel;
        bool isEducationalPartner;
    }

    struct IntegrationPoint {
        uint256 id;
        string purpose;
        uint256 securityLevel;
        bool isActive;
    }

    mapping(address => Community) public educationalPartners;
    mapping(uint256 => IntegrationPoint) public integrationPoints;

    event CommunityAdded(string name, address treasury, uint256 participationLevel);
    event IntegrationPointActivated(uint256 id, string purpose, uint256 securityLevel);

    constructor() {
        setupEducationalPartner("Full Sail University", address(0x123));
        setupEducationalPartner("Cairo American College", address(0x456));
        setupEducationalPartner("Johnson County Community College", address(0x789));
    }

    function setupEducationalPartner(string memory name, address treasury) private {
        require(treasury != address(0), "Treasury address cannot be zero");
        educationalPartners[treasury] = Community({
            name: name,
            treasury: treasury,
            participationLevel: 0,
            isEducationalPartner: true
        });
        emit CommunityAdded(name, treasury, 0);
    }

    function addCommunityPoint(
        string memory name,
        address treasury,
        uint256 participationLevel
    ) external onlyOwner {
        require(treasury != address(0), "Treasury address cannot be zero");
        Community memory newCommunity = Community({
            name: name,
            treasury: treasury,
            participationLevel: participationLevel,
            isEducationalPartner: false
        });
        
        educationalPartners[treasury] = newCommunity;
        emit CommunityAdded(name, treasury, participationLevel);
    }

    function createIntegrationPoint(
        string memory purpose,
        uint256 securityLevel
    ) external onlyOwner returns (uint256) {
        uint256 pointId = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            purpose,
            securityLevel
        )));

        integrationPoints[pointId] = IntegrationPoint({
            id: pointId,
            purpose: purpose,
            securityLevel: securityLevel,
            isActive: true
        });

        emit IntegrationPointActivated(pointId, purpose, securityLevel);
        return pointId;
    }
}