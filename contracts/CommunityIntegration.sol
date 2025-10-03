// SPDX-License-Identifier: MIT
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CommunityIntegration
 * @dev Node 2 of Twelve-Node Self-Correcting System
 * Manages educational partners and integration points for community growth.
 */
contract CommunityIntegration is Ownable {
    struct Community {
        string name;
        bool isEducational;
        uint256 joinDate;
        bool alphaLock;
        bool betaLock;
        bool omegaLock;
    }

    struct IntegrationPoint {
        string description;
        uint256 timestamp;
    }

    mapping(address => Community) public educationalPartners;
    mapping(address => IntegrationPoint[]) public partnerIntegrations;

    event CommunityAdded(address indexed institution, string name, bool isEducational);
    event IntegrationPointAdded(address indexed institution, string description);
    event LockStatusChanged(address indexed institution, string lockType, bool status);

    function addCommunity(address institution, string memory name, bool isEducational) public onlyOwner {
        educationalPartners[institution] = Community(name, isEducational, block.timestamp, false, false, false);
        emit CommunityAdded(institution, name, isEducational);
    }

    function setLock(address institution, string memory lockType, bool status) public onlyOwner {
        if (keccak256(bytes(lockType)) == keccak256(bytes("alpha"))) {
            educationalPartners[institution].alphaLock = status;
        } else if (keccak256(bytes(lockType)) == keccak256(bytes("beta"))) {
            educationalPartners[institution].betaLock = status;
        } else if (keccak256(bytes(lockType)) == keccak256(bytes("omega"))) {
            educationalPartners[institution].omegaLock = status;
        }
        emit LockStatusChanged(institution, lockType, status);
    }

    function addIntegrationPoint(address institution, string memory description) public onlyOwner {
        require(!educationalPartners[institution].omegaLock, "Omega lock active");
        partnerIntegrations[institution].push(IntegrationPoint(description, block.timestamp));
        emit IntegrationPointAdded(institution, description);
    }

    function getIntegrationPoints(address institution) public view returns (IntegrationPoint[] memory) {
        return partnerIntegrations[institution];
    }

    function getLockStatus(address institution) public view returns (bool alpha, bool beta, bool omega) {
        Community memory c = educationalPartners[institution];
        return (c.alphaLock, c.betaLock, c.omegaLock);
    }
}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
