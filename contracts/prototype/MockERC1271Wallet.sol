// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

/// @notice NON-PRODUCTION test double: a minimal ERC-1271 wallet validated by one ephemeral EOA owner.
contract MockERC1271Wallet is IERC1271 {
    address public immutable owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function isValidSignature(bytes32 hash, bytes memory signature) external view returns (bytes4) {
        (address recovered, ECDSA.RecoverError err) = ECDSA.tryRecover(hash, signature);
        return (err == ECDSA.RecoverError.NoError && recovered == owner) ? IERC1271.isValidSignature.selector : bytes4(0xffffffff);
    }
}

/// @notice NON-PRODUCTION test double standing in for IOffChainMonitor in IntegrationHub tests.
contract MockMonitor {
    function logMonitorUpdate(string calldata) external {}
}
