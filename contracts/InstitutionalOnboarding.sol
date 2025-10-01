// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title InstitutionalOnboarding
 * @dev Node 3 of twelve-node self-correcting system
 * Handles onboarding and management of institutions with alpha, beta, omega locks
 * @author Scott Charles Olson (Charly)
 */
contract InstitutionalOnboarding {
    // Lock mechanism states
    enum LockState { ALPHA, BETA, OMEGA }
    
    struct Institution {
        address institutionAddress;
        string name;
        string institutionType;
        uint256 onboardedAt;
        uint256 verificationLevel;
        bool active;
        LockState lockState;
    }
    
    struct OnboardingStep {
        string stepName;
        bool completed;
        uint256 completedAt;
    }
    
    mapping(uint256 => Institution) public institutions;
    mapping(uint256 => OnboardingStep[]) public onboardingSteps;
    uint256 public institutionCount;
    
    address public owner;
    LockState public systemLockState;
    
    // Henry 7 Step 14 Shoe Waltz alignment
    uint256 public constant BASE_STEPS = 7;
    uint256 public constant DOUBLE_STEPS = 14;
    uint256 public constant COMPLETION_THRESHOLD = 49;
    
    event InstitutionRegistered(uint256 indexed institutionId, address indexed institutionAddress, string name);
    event OnboardingStepCompleted(uint256 indexed institutionId, string stepName);
    event OnboardingCompleted(uint256 indexed institutionId);
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
        institutionCount = 0;
    }
    
    /**
     * @dev Register a new institution
     * @param _institutionAddress Address of the institution
     * @param _name Institution name
     * @param _institutionType Type of institution
     */
    function registerInstitution(
        address _institutionAddress,
        string memory _name,
        string memory _institutionType
    ) public onlyOwner onlyAlpha returns (uint256) {
        institutionCount++;
        institutions[institutionCount] = Institution({
            institutionAddress: _institutionAddress,
            name: _name,
            institutionType: _institutionType,
            onboardedAt: block.timestamp,
            verificationLevel: 0,
            active: true,
            lockState: LockState.ALPHA
        });
        
        // Initialize BASE_STEPS (7) onboarding steps
        _initializeOnboardingSteps(institutionCount);
        
        emit InstitutionRegistered(institutionCount, _institutionAddress, _name);
        return institutionCount;
    }
    
    /**
     * @dev Initialize onboarding steps aligned with Henry 7 Step framework
     * @param _institutionId ID of the institution
     */
    function _initializeOnboardingSteps(uint256 _institutionId) private {
        string[7] memory stepNames = [
            "Initial Verification",
            "Document Submission",
            "Compliance Review",
            "Technical Integration",
            "Security Audit",
            "Testing Phase",
            "Final Approval"
        ];
        
        for (uint256 i = 0; i < BASE_STEPS; i++) {
            onboardingSteps[_institutionId].push(OnboardingStep({
                stepName: stepNames[i],
                completed: false,
                completedAt: 0
            }));
        }
    }
    
    /**
     * @dev Complete an onboarding step
     * @param _institutionId ID of the institution
     * @param _stepIndex Index of the step to complete
     */
    function completeOnboardingStep(
        uint256 _institutionId,
        uint256 _stepIndex
    ) public onlyOwner onlyBeta {
        require(_institutionId > 0 && _institutionId <= institutionCount, "Invalid institution ID");
        require(_stepIndex < onboardingSteps[_institutionId].length, "Invalid step index");
        require(!onboardingSteps[_institutionId][_stepIndex].completed, "Step already completed");
        
        onboardingSteps[_institutionId][_stepIndex].completed = true;
        onboardingSteps[_institutionId][_stepIndex].completedAt = block.timestamp;
        
        emit OnboardingStepCompleted(_institutionId, onboardingSteps[_institutionId][_stepIndex].stepName);
        
        // Check if all steps completed
        if (_checkOnboardingComplete(_institutionId)) {
            institutions[_institutionId].verificationLevel = COMPLETION_THRESHOLD;
            emit OnboardingCompleted(_institutionId);
        }
    }
    
    /**
     * @dev Check if onboarding is complete
     * @param _institutionId ID of the institution
     */
    function _checkOnboardingComplete(uint256 _institutionId) private view returns (bool) {
        for (uint256 i = 0; i < onboardingSteps[_institutionId].length; i++) {
            if (!onboardingSteps[_institutionId][i].completed) {
                return false;
            }
        }
        return true;
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
     * @dev Get institution details
     * @param _institutionId ID of the institution
     */
    function getInstitution(uint256 _institutionId) public view returns (
        address institutionAddress,
        string memory name,
        string memory institutionType,
        uint256 onboardedAt,
        uint256 verificationLevel,
        bool active
    ) {
        require(_institutionId > 0 && _institutionId <= institutionCount, "Invalid institution ID");
        Institution memory inst = institutions[_institutionId];
        return (
            inst.institutionAddress,
            inst.name,
            inst.institutionType,
            inst.onboardedAt,
            inst.verificationLevel,
            inst.active
        );
    }
    
    /**
     * @dev Get onboarding progress
     * @param _institutionId ID of the institution
     */
    function getOnboardingProgress(uint256 _institutionId) public view returns (
        uint256 completedSteps,
        uint256 totalSteps,
        uint256 progressPercentage
    ) {
        require(_institutionId > 0 && _institutionId <= institutionCount, "Invalid institution ID");
        
        uint256 completed = 0;
        uint256 total = onboardingSteps[_institutionId].length;
        
        for (uint256 i = 0; i < total; i++) {
            if (onboardingSteps[_institutionId][i].completed) {
                completed++;
            }
        }
        
        uint256 percentage = total > 0 ? (completed * 100) / total : 0;
        return (completed, total, percentage);
    }
}
