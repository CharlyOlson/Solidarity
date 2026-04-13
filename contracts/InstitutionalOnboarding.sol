// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InstitutionalOnboarding
 * @dev Node 3 of Twelve-Node Self-Correcting System
 * Handles onboarding and management of institutions in the ecosystem.
 */
contract InstitutionalOnboarding {
    struct Institution {
        string name;
        bool isEducational;
        uint256 onboardedAt;
        bool alphaLock;
        bool betaLock;
        bool omegaLock;
    }

    mapping(address => Institution) public institutions;

    event InstitutionAdded(address indexed institutionAddress, string name, bool isEducational);
    event LockStatusChanged(address indexed institutionAddress, string lockType, bool status);

    function addInstitution(address institutionAddress, string memory name, bool isEducational) public {
        institutions[institutionAddress] = Institution(name, isEducational, block.timestamp, false, false, false);
        emit InstitutionAdded(institutionAddress, name, isEducational);
    }

    function setLock(address institutionAddress, string memory lockType, bool status) public {
        if (keccak256(bytes(lockType)) == keccak256(bytes("alpha"))) {
            institutions[institutionAddress].alphaLock = status;
        } else if (keccak256(bytes(lockType)) == keccak256(bytes("beta"))) {
            institutions[institutionAddress].betaLock = status;
        } else if (keccak256(bytes(lockType)) == keccak256(bytes("omega"))) {
            institutions[institutionAddress].omegaLock = status;
        }
        emit LockStatusChanged(institutionAddress, lockType, status);
    }

    function getLockStatus(address institutionAddress) public view returns (bool alpha, bool beta, bool omega) {
        Institution memory i = institutions[institutionAddress];
        return (i.alphaLock, i.betaLock, i.omegaLock);
    }
}
