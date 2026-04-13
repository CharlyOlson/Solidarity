/**
 * Solidarity — TreasuryManager Sepolia Deployment Script
 *
 * Prerequisites:
 *   1. .env file with SEPOLIA_RPC_URL, PRIVATE_KEY, and 4 ADDR_* addresses
 *   2. npm install complete
 *   3. npx hardhat compile passes
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network sepolia
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Solidarity — TreasuryManager Deployment        ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Validate environment
  const required = ["ADDR_SCOTT", "ADDR_HANK", "ADDR_CLASS_EQUITY", "ADDR_INFRA_RESERVE"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error("Missing required environment variables:", missing.join(", "));
    console.error("Add them to your .env file. See .env.example for reference.");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("Network:", hre.network.name, "\n");

  if (balance === 0n) {
    console.error("Deployer has 0 ETH. Get Sepolia ETH from a faucet first.");
    process.exit(1);
  }

  // Constructor args — 4 addresses from charter
  const scott = process.env.ADDR_SCOTT;
  const hank = process.env.ADDR_HANK;
  const classEquity = process.env.ADDR_CLASS_EQUITY;
  const infraReserve = process.env.ADDR_INFRA_RESERVE;

  console.log("Constructor addresses:");
  console.log("  Scott:                 ", scott);
  console.log("  Hank:                  ", hank);
  console.log("  Class Equity Fund:     ", classEquity);
  console.log("  Infrastructure Reserve:", infraReserve, "\n");

  // Deploy
  console.log("Deploying TreasuryManager...");
  const Treasury = await hre.ethers.getContractFactory("TreasuryManager");
  const treasury = await Treasury.deploy(scott, hank, classEquity, infraReserve);
  await treasury.waitForDeployment();

  const address = await treasury.getAddress();
  console.log("\n✓ TreasuryManager deployed to:", address);

  // Save deployment info
  const deploymentInfo = {
    contract: "TreasuryManager",
    address: address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    constructorArgs: [scott, hank, classEquity, infraReserve],
    timestamp: new Date().toISOString(),
    blockNumber: (await hre.ethers.provider.getBlockNumber()).toString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

  const filename = `${hre.network.name}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment info saved to deployments/${filename}`);

  // Verify on Etherscan (if not localhost/hardhat)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting 30s for block confirmations before verification...");
    await new Promise((r) => setTimeout(r, 30000));

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [scott, hank, classEquity, infraReserve],
      });
      console.log("✓ Contract verified on Etherscan");
    } catch (err) {
      if (err.message.includes("Already Verified")) {
        console.log("✓ Contract already verified");
      } else {
        console.log("Verification failed (can retry manually):", err.message);
      }
    }
  }

  console.log("\n══════════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("  Contract: TreasuryManager");
  console.log("  Address: ", address);
  console.log("  Network: ", hre.network.name);
  console.log("══════════════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
