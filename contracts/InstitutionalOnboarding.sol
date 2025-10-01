// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InstitutionalOnboarding {
    struct Institution {
        string name;
        bool isEducational;
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