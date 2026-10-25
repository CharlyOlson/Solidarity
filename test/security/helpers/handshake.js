const { ethers } = require("hardhat");

const FIELDS = [
  ["user", "address"], ["scope", "bytes32"], ["action", "bytes32"], ["key", "bytes32"],
  ["valueHash", "bytes32"], ["nonce", "uint256"], ["deadline", "uint64"],
  ["enrollmentEpoch", "uint64"], ["policyEpoch", "uint64"], ["contextCommitment", "bytes32"],
];
const types = (name) => ({ [name]: FIELDS.map(([n, t]) => ({ name: n, type: t })) });

const id = (s) => ethers.keccak256(ethers.toUtf8Bytes(s));

async function domainFor(contract, overrides = {}) {
  return {
    name: "SolidarityConsentHandshakePrototype",
    version: "1",
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await contract.getAddress(),
    ...overrides,
  };
}

const signUser = (signer, domain, op) => signer.signTypedData(domain, types("UserApproval"), op);
const signSystem = (signer, domain, op) => signer.signTypedData(domain, types("SystemPermit"), op);

module.exports = { id, domainFor, signUser, signSystem, types };
