// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title StabilityMetrics
 * @dev Node 5 of Twelve-Node Self-Correcting System
 * Implements stability scoring using key metrics and Pythagorean-based error correction logic.
 *
 * Access control (shared metrics feed + global emergency policy ONLY):
 * this contract holds no per-user resources and no personal consent. Roles
 * below authorize operators of the shared feed; they never represent a user.
 *  - DEFAULT_ADMIN_ROLE   grants/revokes roles; holds no lock or write power itself.
 *  - METRICS_WRITER_ROLE  may call updateMetrics.
 *  - LOCK_MANAGER_ROLE    may set/clear the "alpha" and "beta" locks.
 *  - OMEGA_GUARDIAN_ROLE  may set/clear the "omega" lock (global write veto).
 * Role grants/revocations are audited by OpenZeppelin's RoleGranted/RoleRevoked events.
 * Who holds these roles in production is an open governance decision.
 */
contract StabilityMetrics is AccessControl {
    bytes32 public constant METRICS_WRITER_ROLE = keccak256("METRICS_WRITER_ROLE");
    bytes32 public constant LOCK_MANAGER_ROLE = keccak256("LOCK_MANAGER_ROLE");
    bytes32 public constant OMEGA_GUARDIAN_ROLE = keccak256("OMEGA_GUARDIAN_ROLE");

    struct Metrics {
        uint256 price;
        uint256 volume;
        uint256 liquidity;
        uint256 stabilityScore;
        uint256 timestamp;
    }

    mapping(uint256 => Metrics) public dailyMetrics;
    uint256 public currentDay;

    bool public alphaLock;
    bool public betaLock;
    bool public omegaLock;

    event MetricsUpdated(uint256 indexed day, uint256 stabilityScore);
    event LockStatusChanged(string lockType, bool status);

    /// @param initialAdmin receives DEFAULT_ADMIN_ROLE only (no lock/write power); must be non-zero.
    constructor(address initialAdmin) {
        require(initialAdmin != address(0), "Admin is zero address");
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
    }

    function setLock(string memory lockType, bool status) public {
        bytes32 lockHash = keccak256(bytes(lockType));
        if (lockHash == keccak256(bytes("alpha"))) {
            _checkRole(LOCK_MANAGER_ROLE);
            alphaLock = status;
        } else if (lockHash == keccak256(bytes("beta"))) {
            _checkRole(LOCK_MANAGER_ROLE);
            betaLock = status;
        } else if (lockHash == keccak256(bytes("omega"))) {
            _checkRole(OMEGA_GUARDIAN_ROLE);
            omegaLock = status;
        } else {
            revert("Unknown lock type");
        }
        emit LockStatusChanged(lockType, status);
    }

    function updateMetrics(uint256 price, uint256 volume, uint256 liquidity) public onlyRole(METRICS_WRITER_ROLE) {
        require(!omegaLock, "Omega lock active");
        uint256 day = block.timestamp / 1 days;
        uint256 stabilityScore = calculateStabilityScore(price, volume, liquidity);
        dailyMetrics[day] = Metrics(price, volume, liquidity, stabilityScore, block.timestamp);
        currentDay = day;
        emit MetricsUpdated(day, stabilityScore);
    }

    function calculateStabilityScore(uint256 price, uint256 volume, uint256 liquidity) internal pure returns (uint256) {
        // Pythagorean-based error correction
        uint256 normalized = sqrt(price * price + volume * volume + liquidity * liquidity);
        return (normalized * 100) / 1000;
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function getCurrentMetrics() public view returns (Metrics memory) {
        return dailyMetrics[currentDay];
    }
}
