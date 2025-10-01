// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataToCoilConverter {
    // Base conversion constants
    uint256 private constant BITS_PER_BYTE = 8;
    uint256 private constant BYTES_PER_BITE = 1024;    // 1KB
    uint256 private constant BITES_PER_BLYTE = 1024;   // 1MB equivalent
    uint256 private constant BLYTES_PER_COIL = 1024;   // 1GB equivalent

    // Theoretical data value structure
    struct DataValue {
        uint256 bits;
        uint256 bites;
        uint256 blytes;
        uint256 coils;
    }

    // Calculate the coil value given data in bites
    function calculateCoilValue(uint256 dataBites) public pure returns (DataValue memory) {
        // 1 COIL = 1024 BLYTES = 1,048,576 BITES = 1,073,741,824 BYTES = 8,589,934,592 BITS
        
        uint256 totalBits = dataBites * BITS_PER_BYTE * BYTES_PER_BITE;
        uint256 totalBites = dataBites;
        uint256 totalBlytes = dataBites / BITES_PER_BLYTE;
        uint256 totalCoils = dataBites / (BITES_PER_BLYTE * BLYTES_PER_COIL);

        return DataValue({
            bits: totalBits,
            bites: totalBites,
            blytes: totalBlytes,
            coils: totalCoils
        });
    }

    // Conversion ratios as a reference
    function getConversionTable() public pure returns (string memory) {
        return "1 COIL = 1024 BLYTES = 1,048,576 BITES = 8,589,934,592 BITS";
    }
}

contract DataTransmissionValue {
    struct TransmissionMetrics {
        uint256 dataSize;      // in bites
        uint256 coilValue;     // calculated coil value
        uint256 timestamp;
    }

    mapping(address => TransmissionMetrics[]) private userMetrics;

    event DataProcessed(
        address indexed user,
        uint256 bites,
        uint256 coilValue,
        uint256 timestamp
    );

    // Process data transmission and calculate coil value
    function processDataTransmission(
        uint256 dataBites
    ) external returns (uint256 coilValue) {
        // Calculate coil value using progressive scaling
        coilValue = dataBites / (1024 * 1024); // Coils normalized to base units

        userMetrics[msg.sender].push(TransmissionMetrics({
            dataSize: dataBites,
            coilValue: coilValue,
            timestamp: block.timestamp
        }));

        emit DataProcessed(
            msg.sender,
            dataBites,
            coilValue,
            block.timestamp
        );

        return coilValue;
    }

    // Get user's transmission history
    function getUserMetrics(
        address user
    ) external view returns (TransmissionMetrics[] memory) {
        return userMetrics[user];
    }
}