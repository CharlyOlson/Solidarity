// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SolidarityCore
 * @dev Core smart contract for the Solidarity platform
 * @author Scott Charles Olson (Charly) and team
 */
contract SolidarityCore {
    
    string public constant NAME = "Solidarity Platform";
    string public constant VERSION = "0.1.0";
    address public owner;
    
    struct User {
        address walletAddress;
        bool isVerified;
        uint256 joinedAt;
        uint256 lastActivity;
    }
    
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        string transactionType;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(address => User) public users;
    mapping(bytes32 => Transaction) public transactions;
    
    event UserRegistered(address indexed user, uint256 timestamp);
    event TransactionCreated(bytes32 indexed txId, address indexed from, address indexed to, uint256 amount);
    event TransactionCompleted(bytes32 indexed txId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVerifiedUser() {
        require(users[msg.sender].isVerified, "User must be verified");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register a new user on the platform
     */
    function registerUser() external {
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            isVerified: false,
            joinedAt: block.timestamp,
            lastActivity: block.timestamp
        });
        
        emit UserRegistered(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify a user (only owner can verify)
     */
    function verifyUser(address userAddress) external onlyOwner {
        require(users[userAddress].walletAddress != address(0), "User not registered");
        users[userAddress].isVerified = true;
    }
    
    /**
     * @dev Create a new transaction
     */
    function createTransaction(
        address to,
        uint256 amount,
        string memory transactionType
    ) external onlyVerifiedUser returns (bytes32) {
        bytes32 txId = keccak256(abi.encodePacked(msg.sender, to, amount, block.timestamp));
        
        transactions[txId] = Transaction({
            from: msg.sender,
            to: to,
            amount: amount,
            transactionType: transactionType,
            timestamp: block.timestamp,
            completed: false
        });
        
        users[msg.sender].lastActivity = block.timestamp;
        
        emit TransactionCreated(txId, msg.sender, to, amount);
        return txId;
    }
    
    /**
     * @dev Get platform information
     */
    function getPlatformInfo() external pure returns (string memory, string memory) {
        return (NAME, VERSION);
    }
}