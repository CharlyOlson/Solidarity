// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title RevenueAllocationExample
 * @dev Node 4 of twelve-node self-correcting system
 * Manages allocation of revenue to charity, payroll, and reserves with alpha, beta, omega locks
 * Implements Henry 7 Step 14 Shoe Waltz allocation ratios
 * @author Scott Charles Olson (Charly)
 */
contract RevenueAllocationExample {
    // Lock mechanism states
    enum LockState { ALPHA, BETA, OMEGA }
    
    struct AllocationBucket {
        string name;
        uint256 percentage;
        uint256 totalAllocated;
        address destinationAddress;
        bool active;
    }
    
    mapping(uint256 => AllocationBucket) public buckets;
    uint256 public bucketCount;
    
    address public owner;
    LockState public systemLockState;
    
    // Henry 7 Step 14 Shoe Waltz alignment
    uint256 public constant BASE_RATIO = 7;
    uint256 public constant DOUBLE_RATIO = 14;
    uint256 public constant COMPLETION_RATIO = 49;
    uint256 public constant CONTROL_RATIO_NUMERATOR = 35; // 3.5 * 10
    uint256 public constant CONTROL_RATIO_DENOMINATOR = 10;
    
    uint256 public totalRevenue;
    uint256 public totalAllocated;
    
    event BucketCreated(uint256 indexed bucketId, string name, uint256 percentage);
    event RevenueAllocated(uint256 indexed bucketId, uint256 amount);
    event LockStateChanged(LockState newState);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAlpha() {
        require(systemLockState == LockState.ALPHA, "System must be in ALPHA state");
        _;
    }
    
    modifier onlyBeta() {
        require(systemLockState == LockState.BETA, "System must be in BETA state");
        _;
    }
    
    modifier onlyOmega() {
        require(systemLockState == LockState.OMEGA, "System must be in OMEGA state");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        systemLockState = LockState.ALPHA;
        bucketCount = 0;
        totalRevenue = 0;
        totalAllocated = 0;
    }
    
    /**
     * @dev Create allocation bucket
     * @param _name Bucket name (e.g., "Charity", "Payroll", "Reserves")
     * @param _percentage Allocation percentage (must sum to 100 across all buckets)
     * @param _destinationAddress Address to receive allocations
     */
    function createBucket(
        string memory _name,
        uint256 _percentage,
        address _destinationAddress
    ) public onlyOwner onlyAlpha returns (uint256) {
        require(_percentage > 0 && _percentage <= 100, "Invalid percentage");
        require(_destinationAddress != address(0), "Invalid destination address");
        
        bucketCount++;
        buckets[bucketCount] = AllocationBucket({
            name: _name,
            percentage: _percentage,
            totalAllocated: 0,
            destinationAddress: _destinationAddress,
            active: true
        });
        
        emit BucketCreated(bucketCount, _name, _percentage);
        return bucketCount;
    }
    
    /**
     * @dev Allocate revenue to buckets
     * @param _amount Amount to allocate
     */
    function allocateRevenue(uint256 _amount) public payable onlyOwner onlyBeta {
        require(_amount > 0, "Amount must be greater than 0");
        require(msg.value >= _amount, "Insufficient funds sent");
        require(_validateAllocationPercentages(), "Bucket percentages must sum to 100");
        
        totalRevenue += _amount;
        
        for (uint256 i = 1; i <= bucketCount; i++) {
            if (buckets[i].active) {
                uint256 allocation = (_amount * buckets[i].percentage) / 100;
                buckets[i].totalAllocated += allocation;
                totalAllocated += allocation;
                
                // Transfer to destination
                payable(buckets[i].destinationAddress).transfer(allocation);
                
                emit RevenueAllocated(i, allocation);
            }
        }
    }
    
    /**
     * @dev Validate that all bucket percentages sum to 100
     */
    function _validateAllocationPercentages() private view returns (bool) {
        uint256 totalPercentage = 0;
        
        for (uint256 i = 1; i <= bucketCount; i++) {
            if (buckets[i].active) {
                totalPercentage += buckets[i].percentage;
            }
        }
        
        return totalPercentage == 100;
    }
    
    /**
     * @dev Change system lock state
     * @param _newState New lock state
     */
    function setLockState(LockState _newState) public onlyOwner {
        systemLockState = _newState;
        emit LockStateChanged(_newState);
    }
    
    /**
     * @dev Get bucket details
     * @param _bucketId ID of the bucket
     */
    function getBucket(uint256 _bucketId) public view returns (
        string memory name,
        uint256 percentage,
        uint256 totalAllocated_,
        address destinationAddress,
        bool active
    ) {
        require(_bucketId > 0 && _bucketId <= bucketCount, "Invalid bucket ID");
        AllocationBucket memory bucket = buckets[_bucketId];
        return (
            bucket.name,
            bucket.percentage,
            bucket.totalAllocated,
            bucket.destinationAddress,
            bucket.active
        );
    }
    
    /**
     * @dev Get allocation statistics
     */
    function getAllocationStats() public view returns (
        uint256 totalRevenue_,
        uint256 totalAllocated_,
        uint256 bucketCount_,
        uint256 harmonicRatio
    ) {
        // Calculate harmonic ratio based on 7→14→49 progression
        uint256 ratio = totalAllocated > 0 ? (totalRevenue * BASE_RATIO) / totalAllocated : 0;
        
        return (
            totalRevenue,
            totalAllocated,
            bucketCount,
            ratio
        );
    }
    
    /**
     * @dev Update bucket percentage
     * @param _bucketId ID of the bucket
     * @param _newPercentage New percentage
     */
    function updateBucketPercentage(uint256 _bucketId, uint256 _newPercentage) public onlyOwner onlyAlpha {
        require(_bucketId > 0 && _bucketId <= bucketCount, "Invalid bucket ID");
        require(_newPercentage > 0 && _newPercentage <= 100, "Invalid percentage");
        
        buckets[_bucketId].percentage = _newPercentage;
    }
    
    /**
     * @dev Deactivate bucket
     * @param _bucketId ID of the bucket
     */
    function deactivateBucket(uint256 _bucketId) public onlyOwner onlyOmega {
        require(_bucketId > 0 && _bucketId <= bucketCount, "Invalid bucket ID");
        buckets[_bucketId].active = false;
    }
}
