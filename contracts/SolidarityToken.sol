// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SolidarityToken (SLDRT)
 * @dev ERC-20 token with coherence-based stability.
 * Off-chain ThreeBodyCoherence engine pushes scores on-chain.
 * Owner: Scott Charles Olson
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */
contract SolidarityToken is ERC20, Ownable, ReentrancyGuard {
    // Three-body coherence score (0-10000 = 0.0000-1.0000, 4 decimals)
    uint256 public coherenceScore;
    // Coherence level thresholds
    uint256 public constant CRITICAL_THRESHOLD = 3820;   // 0.382
    uint256 public constant STABLE_THRESHOLD = 6180;      // 0.618
    uint256 public constant ELEVATED_THRESHOLD = 8090;    // 0.809

    // Treasury link
    address public treasuryManager;

    // Coherence history (last 30 updates)
    struct CoherenceSnapshot {
        uint256 score;
        uint256 safetyScore;
        uint256 harmonyScore;
        uint256 demandScore;
        uint256 timestamp;
    }
    CoherenceSnapshot[] public coherenceHistory;
    uint256 public constant MAX_HISTORY = 30;

    // Transfer gating based on coherence
    bool public coherenceGatingEnabled;

    // Events
    event CoherenceUpdated(uint256 score, uint256 safety, uint256 harmony, uint256 demand, string level);
    event CoherenceGatingToggled(bool enabled);
    event TreasuryLinked(address treasury);

    constructor(
        uint256 initialSupply,
        address _treasuryManager
    ) ERC20("Solidarity Token", "SLDRT") {
        require(_treasuryManager != address(0), "Invalid treasury");
        treasuryManager = _treasuryManager;
        coherenceScore = 6180; // Start at stable baseline (0.618)
        coherenceGatingEnabled = false;
        _mint(msg.sender, initialSupply * 10**decimals());
    }

    /**
     * @dev Push coherence score from off-chain ThreeBodyCoherence engine.
     * Only owner (the deployer running the JS engine) can update.
     */
    function updateCoherence(
        uint256 _score,
        uint256 _safety,
        uint256 _harmony,
        uint256 _demand
    ) external onlyOwner {
        require(_score <= 10000, "Score out of range");
        coherenceScore = _score;

        string memory level;
        if (_score < CRITICAL_THRESHOLD) level = "critical";
        else if (_score < STABLE_THRESHOLD) level = "degraded";
        else if (_score < ELEVATED_THRESHOLD) level = "stable";
        else level = "elevated";

        // Store snapshot
        if (coherenceHistory.length >= MAX_HISTORY) {
            // Shift array (keep last MAX_HISTORY-1 + new one)
            for (uint i = 0; i < coherenceHistory.length - 1; i++) {
                coherenceHistory[i] = coherenceHistory[i + 1];
            }
            coherenceHistory.pop();
        }
        coherenceHistory.push(CoherenceSnapshot({
            score: _score,
            safetyScore: _safety,
            harmonyScore: _harmony,
            demandScore: _demand,
            timestamp: block.timestamp
        }));

        emit CoherenceUpdated(_score, _safety, _harmony, _demand, level);
    }

    /**
     * @dev Get current coherence level as string
     */
    function getCoherenceLevel() external view returns (string memory) {
        if (coherenceScore < CRITICAL_THRESHOLD) return "critical";
        if (coherenceScore < STABLE_THRESHOLD) return "degraded";
        if (coherenceScore < ELEVATED_THRESHOLD) return "stable";
        return "elevated";
    }

    /**
     * @dev Get coherence history length
     */
    function getCoherenceHistoryLength() external view returns (uint256) {
        return coherenceHistory.length;
    }

    /**
     * @dev Toggle transfer gating by coherence
     */
    function setCoherenceGating(bool _enabled) external onlyOwner {
        coherenceGatingEnabled = _enabled;
        emit CoherenceGatingToggled(_enabled);
    }

    /**
     * @dev Link to new treasury manager
     */
    function setTreasuryManager(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasuryManager = _treasury;
        emit TreasuryLinked(_treasury);
    }

    /**
     * @dev Override transfer hook to enforce coherence gating when enabled.
     * Uses OZ v4 _beforeTokenTransfer pattern.
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if (coherenceGatingEnabled && from != address(0) && to != address(0)) {
            require(coherenceScore >= CRITICAL_THRESHOLD, "Transfers paused: coherence critical");
        }
        super._beforeTokenTransfer(from, to, amount);
    }
}
