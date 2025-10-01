// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CommunityIntegration
 * @dev Node 2 of twelve-node self-correcting system
 * Manages educational partners and integration points with alpha, beta, omega locks
 * @author Scott Charles Olson (Charly)
 */
contract CommunityIntegration {
    // Lock mechanism states
    enum LockState { ALPHA, BETA, OMEGA }
    
    struct Partner {
        address partnerAddress;
        string name;
        string integrationType;
        uint256 establishedAt;
        bool active;
        LockState lockState;
    }
    
    struct IntegrationPoint {
        uint256 partnerId;
        string endpoint;
        uint256 accessLevel;
        bool enabled;
    }
    
    mapping(uint256 => Partner) public partners;
    mapping(uint256 => IntegrationPoint[]) public integrationPoints;
    uint256 public partnerCount;
    
    address public owner;
    LockState public systemLockState;
    
    event PartnerRegistered(uint256 indexed partnerId, address indexed partnerAddress, string name);
    event IntegrationPointAdded(uint256 indexed partnerId, string endpoint);
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
        partnerCount = 0;
    }
    
    /**
     * @dev Register a new educational partner
     * @param _partnerAddress Address of the partner
     * @param _name Partner name
     * @param _integrationType Type of integration (e.g., "education", "research")
     */
    function registerPartner(
        address _partnerAddress,
        string memory _name,
        string memory _integrationType
    ) public onlyOwner onlyAlpha returns (uint256) {
        partnerCount++;
        partners[partnerCount] = Partner({
            partnerAddress: _partnerAddress,
            name: _name,
            integrationType: _integrationType,
            establishedAt: block.timestamp,
            active: true,
            lockState: LockState.ALPHA
        });
        
        emit PartnerRegistered(partnerCount, _partnerAddress, _name);
        return partnerCount;
    }
    
    /**
     * @dev Add integration point for a partner
     * @param _partnerId ID of the partner
     * @param _endpoint Integration endpoint
     * @param _accessLevel Access level (0-100)
     */
    function addIntegrationPoint(
        uint256 _partnerId,
        string memory _endpoint,
        uint256 _accessLevel
    ) public onlyOwner onlyBeta {
        require(_partnerId > 0 && _partnerId <= partnerCount, "Invalid partner ID");
        require(partners[_partnerId].active, "Partner is not active");
        
        integrationPoints[_partnerId].push(IntegrationPoint({
            partnerId: _partnerId,
            endpoint: _endpoint,
            accessLevel: _accessLevel,
            enabled: true
        }));
        
        emit IntegrationPointAdded(_partnerId, _endpoint);
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
     * @dev Get partner details
     * @param _partnerId ID of the partner
     */
    function getPartner(uint256 _partnerId) public view returns (
        address partnerAddress,
        string memory name,
        string memory integrationType,
        uint256 establishedAt,
        bool active
    ) {
        require(_partnerId > 0 && _partnerId <= partnerCount, "Invalid partner ID");
        Partner memory p = partners[_partnerId];
        return (p.partnerAddress, p.name, p.integrationType, p.establishedAt, p.active);
    }
    
    /**
     * @dev Get integration points for a partner
     * @param _partnerId ID of the partner
     */
    function getIntegrationPoints(uint256 _partnerId) public view returns (IntegrationPoint[] memory) {
        require(_partnerId > 0 && _partnerId <= partnerCount, "Invalid partner ID");
        return integrationPoints[_partnerId];
    }
}
