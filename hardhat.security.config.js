/**
 * Hardhat config for the access-control / consent-handshake security suite.
 *
 * Reuses hardhat.config.js unchanged but compiles with the pinned `solc` npm
 * package (solcjs, exact version in package.json) so the suite runs offline.
 * Local in-process EVM only: no RPC, no keys, no network.
 *
 *   npx hardhat --config hardhat.security.config.js test test/security/*.test.js
 */
const path = require("path");
const { subtask } = require("hardhat/config");
const {
  TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
} = require("hardhat/builtin-tasks/task-names");

const base = require("./hardhat.config.js");
const solcPkg = require("solc/package.json");

subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  if (args.solcVersion !== solcPkg.version) {
    return runSuper(args);
  }
  const compilerPath = require.resolve("solc/soljson.js");
  return {
    compilerPath,
    isSolcJs: true,
    version: solcPkg.version,
    longVersion: solcPkg.version,
  };
});

module.exports = {
  ...base,
  solidity: { ...base.solidity, version: solcPkg.version },
  networks: { hardhat: base.networks.hardhat },
  paths: { ...base.paths, cache: "./cache-security", artifacts: "./artifacts-security" },
};
