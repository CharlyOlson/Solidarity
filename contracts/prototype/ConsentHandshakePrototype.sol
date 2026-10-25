// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

/**
 * @title ConsentHandshakePrototype
 * @notice NON-PRODUCTION LOCAL PROTOTYPE. Not deployed by any script, not wired
 *         to StabilityMetrics, TreasuryManager or any fund flow.
 *
 * A protected personal write needs BOTH
 *   (1) a user approval signed by the signer the USER enrolled for that scope, and
 *   (2) a system permit signed by the distinct system policy authority,
 * over the same canonical payload (user, scope, action, key, value, nonce,
 * deadline, enrollment epoch, policy epoch, context commitment), bound to this
 * chain and this contract by the EIP-712 domain. Signatures are verified with
 * OpenZeppelin EIP-712 + SignatureChecker (ECDSA for EOAs, ERC-1271 for smart
 * contract wallets); there is no bespoke cryptography.
 *
 * Deliberately absent: administrative signer replacement, recovery bypass,
 * delegation, upgrades, pause, funds, external calls, arbitrary-call execution.
 * A system permit is an authority ATTESTATION, not verified objective policy.
 */
contract ConsentHandshakePrototype is EIP712 {
    bytes32 public constant ACTION_SET_ENTRY = keccak256("SET_ENTRY");
    bytes32 public constant ACTION_CLEAR_ENTRY = keccak256("CLEAR_ENTRY");

    struct Operation {
        address user;
        bytes32 scope;
        bytes32 action;
        bytes32 key;
        bytes32 valueHash;
        uint256 nonce;
        uint64 deadline;
        uint64 enrollmentEpoch;
        uint64 policyEpoch;
        bytes32 contextCommitment; // commitment only; raw personal context stays off-chain
    }

    // Distinct type names give user/system signatures domain separation from each other.
    bytes32 public constant USER_APPROVAL_TYPEHASH = keccak256(
        "UserApproval(address user,bytes32 scope,bytes32 action,bytes32 key,bytes32 valueHash,uint256 nonce,uint64 deadline,uint64 enrollmentEpoch,uint64 policyEpoch,bytes32 contextCommitment)"
    );
    bytes32 public constant SYSTEM_PERMIT_TYPEHASH = keccak256(
        "SystemPermit(address user,bytes32 scope,bytes32 action,bytes32 key,bytes32 valueHash,uint256 nonce,uint64 deadline,uint64 enrollmentEpoch,uint64 policyEpoch,bytes32 contextCommitment)"
    );

    /// @notice System policy authority; fixed at construction, never able to sign for a user.
    address public immutable policyAuthority;
    uint64 public policyEpoch = 1;

    // user => scope => enrolled signer / epoch / next nonce
    mapping(address => mapping(bytes32 => address)) public userSigner;
    mapping(address => mapping(bytes32 => uint64)) public enrollmentEpoch;
    mapping(address => mapping(bytes32 => uint256)) public nonces;

    // user => scope => key => value commitment (the only state the handshake protects)
    mapping(address => mapping(bytes32 => mapping(bytes32 => bytes32))) public entries;

    event SignerEnrolled(address indexed user, bytes32 indexed scope, address signer, uint64 epoch);
    event SignerRevoked(address indexed user, bytes32 indexed scope, uint64 epoch);
    event PolicyEpochAdvanced(uint64 newEpoch);
    event OperationExecuted(
        address indexed user,
        bytes32 indexed scope,
        bytes32 indexed action,
        bytes32 key,
        bytes32 valueHash,
        uint256 nonce,
        bytes32 contextCommitment,
        address submitter
    );

    constructor(address _policyAuthority) EIP712("SolidarityConsentHandshakePrototype", "1") {
        require(_policyAuthority != address(0), "Authority is zero address");
        policyAuthority = _policyAuthority;
    }

    /// @notice The caller enrolls (or rotates) its OWN signer for a scope. Nobody can do this for a user.
    function enrollSigner(bytes32 scope, address signer) external {
        require(signer != address(0), "Signer is zero address");
        require(signer != policyAuthority, "Signer is system authority");
        uint64 epoch = ++enrollmentEpoch[msg.sender][scope];
        userSigner[msg.sender][scope] = signer;
        emit SignerEnrolled(msg.sender, scope, signer, epoch);
    }

    /// @notice The caller revokes its own signer for a scope; outstanding approvals become unusable.
    function revokeSigner(bytes32 scope) external {
        require(userSigner[msg.sender][scope] != address(0), "No signer enrolled");
        uint64 epoch = ++enrollmentEpoch[msg.sender][scope];
        delete userSigner[msg.sender][scope];
        emit SignerRevoked(msg.sender, scope, epoch);
    }

    /// @notice Only the system authority can advance the policy epoch, invalidating all outstanding permits.
    function advancePolicyEpoch() external {
        require(msg.sender == policyAuthority, "Not system authority");
        emit PolicyEpochAdvanced(++policyEpoch);
    }

    function userApprovalDigest(Operation calldata op) public view returns (bytes32) {
        return _hashTypedDataV4(_structHash(USER_APPROVAL_TYPEHASH, op));
    }

    function systemPermitDigest(Operation calldata op) public view returns (bytes32) {
        return _hashTypedDataV4(_structHash(SYSTEM_PERMIT_TYPEHASH, op));
    }

    /**
     * @notice Anyone (user, relayer, AI) may submit; submission confers no authority.
     * Every state write below happens only after both signatures verify.
     */
    function execute(Operation calldata op, bytes calldata userSignature, bytes calldata systemSignature) external {
        require(op.action == ACTION_SET_ENTRY || op.action == ACTION_CLEAR_ENTRY, "Unknown action");
        require(op.action == ACTION_SET_ENTRY ? op.valueHash != bytes32(0) : op.valueHash == bytes32(0), "Invalid value for action");
        require(block.timestamp <= op.deadline, "Expired");
        require(op.policyEpoch == policyEpoch, "Stale policy epoch");

        address signer = userSigner[op.user][op.scope];
        require(signer != address(0), "No enrolled signer");
        require(signer != policyAuthority, "Same authority on both sides");
        require(op.enrollmentEpoch == enrollmentEpoch[op.user][op.scope], "Stale enrollment epoch");
        require(op.nonce == nonces[op.user][op.scope], "Bad nonce");

        require(
            SignatureChecker.isValidSignatureNow(signer, userApprovalDigest(op), userSignature),
            "Invalid user approval"
        );
        require(
            SignatureChecker.isValidSignatureNow(policyAuthority, systemPermitDigest(op), systemSignature),
            "Invalid system permit"
        );

        nonces[op.user][op.scope] = op.nonce + 1;

        if (op.action == ACTION_SET_ENTRY) {
            entries[op.user][op.scope][op.key] = op.valueHash;
        } else {
            delete entries[op.user][op.scope][op.key];
        }

        emit OperationExecuted(op.user, op.scope, op.action, op.key, op.valueHash, op.nonce, op.contextCommitment, msg.sender);
    }

    function _structHash(bytes32 typeHash, Operation calldata op) private pure returns (bytes32) {
        return keccak256(
            abi.encode(
                typeHash,
                op.user,
                op.scope,
                op.action,
                op.key,
                op.valueHash,
                op.nonce,
                op.deadline,
                op.enrollmentEpoch,
                op.policyEpoch,
                op.contextCommitment
            )
        );
    }
}
