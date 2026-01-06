// SPDX-License-Identifier: MIT
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
        require(educationalPartners[institution].joinDate != 0, "Institution not registered");
        partnerIntegrations[institution].push(IntegrationPoint(description, block.timestamp));
        emit IntegrationPointAdded(institution, description);
    }

    function getIntegrationPoints(address institution) external view returns (IntegrationPoint[] memory) {
        return partnerIntegrations[institution];
    }
}
