// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title StabilityMetrics
 * @dev Node 5 of twelve-node self-correcting system
 * Implements stability scoring with Pythagorean error correction and alpha, beta, omega locks
 * Based on Henry 7 Step 14 Shoe Waltz framework: 7²+24²=25²
 * @author Scott Charles Olson (Charly)
 */
contract StabilityMetrics {
    // Lock mechanism states
    enum LockState { ALPHA, BETA, OMEGA }
    
    struct MetricSnapshot {
        uint256 timestamp;
        uint256 harmonicScore;
        uint256 stabilityScore;
        uint256 pythagoreanError;
        bool valid;
    }
    
    mapping(uint256 => MetricSnapshot) public snapshots;
    uint256 public snapshotCount;
    
    address public owner;
    LockState public systemLockState;
    
    // Henry 7 Step 14 Shoe Waltz constants
    uint256 public constant BASE = 7;
    uint256 public constant DOUBLE = 14;
    uint256 public constant SQUARE = 49;
    
    // Pythagorean triple: 7²+24²=25²
    uint256 public constant PYTHAGOREAN_A = 7;
    uint256 public constant PYTHAGOREAN_B = 24;
    uint256 public constant PYTHAGOREAN_C = 25;
    
    uint256 public currentHarmonicScore;
    uint256 public currentStabilityScore;
    
    event MetricRecorded(uint256 indexed snapshotId, uint256 harmonicScore, uint256 stabilityScore);
    event ErrorCorrectionApplied(uint256 indexed snapshotId, uint256 error);
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
        snapshotCount = 0;
        currentHarmonicScore = 0;
        currentStabilityScore = 0;
    }
    
    /**
     * @dev Record a stability metric snapshot
     * @param _harmonicScore Harmonic alignment score (0-100)
     * @param _stabilityScore Overall stability score (0-100)
     */
    function recordMetric(
        uint256 _harmonicScore,
        uint256 _stabilityScore
    ) public onlyOwner onlyBeta returns (uint256) {
        require(_harmonicScore <= 100, "Harmonic score must be 0-100");
        require(_stabilityScore <= 100, "Stability score must be 0-100");
        
        snapshotCount++;
        
        // Calculate Pythagorean error
        uint256 pythagoreanError = _calculatePythagoreanError(_harmonicScore, _stabilityScore);
        
        // Apply error correction if needed
        if (pythagoreanError > 10) {
            (_harmonicScore, _stabilityScore) = _applyErrorCorrection(_harmonicScore, _stabilityScore);
            emit ErrorCorrectionApplied(snapshotCount, pythagoreanError);
        }
        
        snapshots[snapshotCount] = MetricSnapshot({
            timestamp: block.timestamp,
            harmonicScore: _harmonicScore,
            stabilityScore: _stabilityScore,
            pythagoreanError: pythagoreanError,
            valid: true
        });
        
        currentHarmonicScore = _harmonicScore;
        currentStabilityScore = _stabilityScore;
        
        emit MetricRecorded(snapshotCount, _harmonicScore, _stabilityScore);
        return snapshotCount;
    }
    
    /**
     * @dev Calculate Pythagorean error using 7²+24²=25² relationship
     * @param _harmonicScore Harmonic score
     * @param _stabilityScore Stability score
     */
    function _calculatePythagoreanError(
        uint256 _harmonicScore,
        uint256 _stabilityScore
    ) private pure returns (uint256) {
        // Scale scores to fit Pythagorean triple proportions
        // harmonicScore represents the base (7), stabilityScore represents the height (24)
        uint256 scaledHarmonic = (_harmonicScore * PYTHAGOREAN_A) / 100;
        uint256 scaledStability = (_stabilityScore * PYTHAGOREAN_B) / 100;
        
        // Calculate hypotenuse: sqrt(a² + b²)
        uint256 aSquared = scaledHarmonic * scaledHarmonic;
        uint256 bSquared = scaledStability * scaledStability;
        uint256 cSquared = aSquared + bSquared;
        
        // Expected hypotenuse based on perfect Pythagorean triple
        uint256 expectedC = PYTHAGOREAN_C;
        uint256 expectedCSquared = expectedC * expectedC;
        
        // Calculate error as percentage deviation
        if (cSquared > expectedCSquared) {
            return ((cSquared - expectedCSquared) * 100) / expectedCSquared;
        } else {
            return ((expectedCSquared - cSquared) * 100) / expectedCSquared;
        }
    }
    
    /**
     * @dev Apply Pythagorean error correction
     * @param _harmonicScore Original harmonic score
     * @param _stabilityScore Original stability score
     */
    function _applyErrorCorrection(
        uint256 _harmonicScore,
        uint256 _stabilityScore
    ) private pure returns (uint256 correctedHarmonic, uint256 correctedStability) {
        // Apply correction to maintain 7:24 ratio
        uint256 ratio = (PYTHAGOREAN_A * 100) / PYTHAGOREAN_B;
        
        // Adjust harmonic score to match stability using the ratio
        correctedHarmonic = (_stabilityScore * ratio) / 100;
        
        // If corrected harmonic exceeds 100, scale both down proportionally
        if (correctedHarmonic > 100) {
            correctedHarmonic = 100;
            correctedStability = (100 * 100) / ratio;
        } else {
            correctedStability = _stabilityScore;
        }
        
        return (correctedHarmonic, correctedStability);
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
     * @dev Get snapshot details
     * @param _snapshotId ID of the snapshot
     */
    function getSnapshot(uint256 _snapshotId) public view returns (
        uint256 timestamp,
        uint256 harmonicScore,
        uint256 stabilityScore,
        uint256 pythagoreanError,
        bool valid
    ) {
        require(_snapshotId > 0 && _snapshotId <= snapshotCount, "Invalid snapshot ID");
        MetricSnapshot memory snapshot = snapshots[_snapshotId];
        return (
            snapshot.timestamp,
            snapshot.harmonicScore,
            snapshot.stabilityScore,
            snapshot.pythagoreanError,
            snapshot.valid
        );
    }
    
    /**
     * @dev Get current system stability metrics
     */
    function getCurrentMetrics() public view returns (
        uint256 harmonicScore,
        uint256 stabilityScore,
        uint256 snapshotCount_,
        bool systemStable
    ) {
        bool stable = currentHarmonicScore >= 70 && currentStabilityScore >= 70;
        return (
            currentHarmonicScore,
            currentStabilityScore,
            snapshotCount,
            stable
        );
    }
    
    /**
     * @dev Verify Pythagorean triple relationship
     */
    function verifyPythagoreanTriple() public pure returns (bool) {
        uint256 aSquared = PYTHAGOREAN_A * PYTHAGOREAN_A;
        uint256 bSquared = PYTHAGOREAN_B * PYTHAGOREAN_B;
        uint256 cSquared = PYTHAGOREAN_C * PYTHAGOREAN_C;
        
        return (aSquared + bSquared) == cSquared;
    }
}
