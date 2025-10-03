// SPDX-License-Identifier: MIT
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
pragma solidity ^0.8.0;

=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
pragma solidity ^0.8.20;

/**
 * @title InstitutionalOnboarding
 * @dev Node 3 of Twelve-Node Self-Correcting System
 * Handles onboarding and management of institutions in the ecosystem.
 */
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
contract InstitutionalOnboarding {
    struct Institution {
        string name;
        bool isEducational;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        bool isVerified;
        uint256 joinDate;
    }

    // Mapping to store institutions
    mapping(address => Institution) public institutions;

    // Events
    event InstitutionAdded(address indexed institutionAddress, string name, bool isEducational);
    event InstitutionVerified(address indexed institutionAddress, string name);

    // Function to add an institution
    function addInstitution(
        address institutionAddress,
        string memory name,
        bool isEducational
    ) external {
        require(institutions[institutionAddress].joinDate == 0, "Institution already exists");

        institutions[institutionAddress] = Institution({
            name: name,
            isEducational: isEducational,
            isVerified: false,
            joinDate: block.timestamp
        });

        emit InstitutionAdded(institutionAddress, name, isEducational);
    }

    // Function to verify an institution
    function verifyInstitution(address institutionAddress) external {
        require(institutions[institutionAddress].joinDate != 0, "Institution not found");
        require(!institutions[institutionAddress].isVerified, "Institution already verified");

        institutions[institutionAddress].isVerified = true;

        emit InstitutionVerified(institutionAddress, institutions[institutionAddress].name);
    }

    // Function to get institution details
    function getInstitution(address institutionAddress) external view returns (Institution memory) {
        require(institutions[institutionAddress].joinDate != 0, "Institution not found");
        return institutions[institutionAddress];
    }
}
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
