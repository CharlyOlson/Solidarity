// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title HashCollisionDemo
 * @dev Demonstrates the hash collision vulnerability with abi.encodePacked
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 * 
 * This contract is for educational purposes only - it shows both vulnerable 
 * and secure methods of hash generation to illustrate the security issue.
 */
contract HashCollisionDemo {
    
    event HashGenerated(string method, bytes32 hash, string input1, string input2);
    
    /**
     * @dev VULNERABLE: Demonstrates hash collision with abi.encodePacked
     * This function shows how different inputs can produce the same hash
     * when using abi.encodePacked with dynamic types.
     * 
     * Example collision:
     * - vulnerableHash("a", "bc") 
     * - vulnerableHash("ab", "c")
     * Both will produce the same hash because abi.encodePacked("a", "bc") 
     * and abi.encodePacked("ab", "c") both result in "abc"
     */
    function vulnerableHash(string memory str1, string memory str2) 
        external 
        returns (bytes32) 
    {
        // VULNERABLE: Using abi.encodePacked with dynamic types
        bytes32 hash = keccak256(abi.encodePacked(str1, str2));
        
        emit HashGenerated("VULNERABLE_encodePacked", hash, str1, str2);
        return hash;
    }
    
    /**
     * @dev SECURE: Safe hash generation using abi.encode
     * This function prevents hash collisions by using abi.encode which
     * pads each parameter to 32 bytes, making collisions impossible.
     */
    function secureHash(string memory str1, string memory str2) 
        external 
        returns (bytes32) 
    {
        // SECURE: Using abi.encode prevents collisions
        bytes32 hash = keccak256(abi.encode(str1, str2));
        
        emit HashGenerated("SECURE_encode", hash, str1, str2);
        return hash;
    }
    
    /**
     * @dev SECURE ALTERNATIVE: Using a delimiter with abi.encodePacked
     * This is another way to prevent collisions when you must use packed encoding
     * by ensuring all values have fixed lengths or clear separators.
     */
    function securePackedHash(string memory str1, string memory str2) 
        external 
        returns (bytes32) 
    {
        // SECURE: Using a unique delimiter to prevent collisions
        bytes32 hash = keccak256(abi.encodePacked(str1, "|DELIMITER|", str2));
        
        emit HashGenerated("SECURE_encodePacked_with_delimiter", hash, str1, str2);
        return hash;
    }
    
    /**
     * @dev SECURE: For fixed-length types, abi.encodePacked is safe
     * This demonstrates that abi.encodePacked is safe when used with fixed-size types
     */
    function safePackedHashWithFixedTypes(
        address addr, 
        uint256 amount, 
        uint256 timestamp
    ) external returns (bytes32) {
        // SAFE: abi.encodePacked with fixed-size types doesn't cause collisions
        bytes32 hash = keccak256(abi.encodePacked(addr, amount, timestamp));
        
        return hash;
    }
    
    /**
     * @dev Batch demonstration function to show collision examples
     */
    function demonstrateCollision() external {
        // These will produce the same hash with vulnerable method
        bytes32 hash1 = this.vulnerableHash("a", "bc");
        bytes32 hash2 = this.vulnerableHash("ab", "c");
        
        // These will produce different hashes with secure method
        bytes32 hash3 = this.secureHash("a", "bc");
        bytes32 hash4 = this.secureHash("ab", "c");
        
        // Verify collision exists in vulnerable version
        assert(hash1 == hash2); // This will pass - demonstrates the vulnerability
        
        // Verify no collision in secure version
        assert(hash3 != hash4); // This will pass - demonstrates the fix
    }
}