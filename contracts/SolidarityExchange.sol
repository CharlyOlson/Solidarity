// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SolidarityExchange
 * @dev Exchange contract for the Solidarity platform implementing secure hash generation
 * @author Scott Charles Olson (Charly) & Charles H. Dykes (Hank)
 * 
 * This contract demonstrates the security fix for hash collision vulnerability
 * when using abi.encodePacked with dynamic types.
 */
contract SolidarityExchange {
    
    struct Exchange {
        address participant;
        address counterparty;
        uint256 amount;
        uint256 timestamp;
        uint256 blockNumber;
        bytes32 txId;
        bool completed;
    }
    
    mapping(bytes32 => Exchange) public exchanges;
    mapping(address => bytes32[]) public userExchanges;
    
    event ExchangeCreated(bytes32 indexed txId, address indexed participant, address indexed counterparty, uint256 amount);
    event ExchangeCompleted(bytes32 indexed txId);
    
    /**
     * @dev Create a new exchange with secure hash generation
     * SECURITY FIX: Using abi.encode instead of abi.encodePacked to prevent hash collisions
     * 
     * The original vulnerable code would be:
     * bytes32 txId = keccak256(abi.encodePacked(msg.sender, to, amount, block.timestamp, block.number));
     * 
     * This is vulnerable because abi.encodePacked can create collisions with dynamic types.
     * For example, if we had string parameters, these could produce the same hash:
     * - abi.encodePacked("a", "bc") 
     * - abi.encodePacked("ab", "c")
     * Both would encode to "abc" and produce identical hashes.
     */
    function createExchange(address to, uint256 amount) external returns (bytes32) {
        require(to != address(0), "Invalid counterparty address");
        require(amount > 0, "Amount must be greater than zero");
        require(to != msg.sender, "Cannot create exchange with yourself");
        
        // SECURE: Using abi.encode instead of abi.encodePacked for hash generation
        // abi.encode pads each parameter to 32 bytes, preventing collision attacks
        bytes32 txId = keccak256(abi.encode(msg.sender, to, amount, block.timestamp, block.number));
        
        // Ensure unique transaction ID
        require(exchanges[txId].participant == address(0), "Transaction ID collision detected");
        
        Exchange memory newExchange = Exchange({
            participant: msg.sender,
            counterparty: to,
            amount: amount,
            timestamp: block.timestamp,
            blockNumber: block.number,
            txId: txId,
            completed: false
        });
        
        exchanges[txId] = newExchange;
        userExchanges[msg.sender].push(txId);
        userExchanges[to].push(txId);
        
        emit ExchangeCreated(txId, msg.sender, to, amount);
        
        return txId;
    }
    
    /**
     * @dev Complete an exchange
     */
    function completeExchange(bytes32 txId) external {
        Exchange storage exchange = exchanges[txId];
        require(exchange.participant != address(0), "Exchange does not exist");
        require(!exchange.completed, "Exchange already completed");
        require(
            msg.sender == exchange.participant || msg.sender == exchange.counterparty,
            "Not authorized to complete this exchange"
        );
        
        exchange.completed = true;
        emit ExchangeCompleted(txId);
    }
    
    /**
     * @dev Get exchange details
     */
    function getExchange(bytes32 txId) external view returns (Exchange memory) {
        require(exchanges[txId].participant != address(0), "Exchange does not exist");
        return exchanges[txId];
    }
    
    /**
     * @dev Get user's exchange count
     */
    function getUserExchangeCount(address user) external view returns (uint256) {
        return userExchanges[user].length;
    }
    
    /**
     * @dev Get user's exchange ID by index
     */
    function getUserExchangeId(address user, uint256 index) external view returns (bytes32) {
        require(index < userExchanges[user].length, "Index out of bounds");
        return userExchanges[user][index];
    }
}