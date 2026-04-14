const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const TREASURY = "0x362DC26b4b084778DB9525DF5A1d4A344C9E0C64";
    const INITIAL_SUPPLY = 1_000_000; // 1M SLDRT

    console.log("Deploying SolidarityToken (SLDRT) to Sepolia...");
    console.log("Treasury:", TREASURY);
    console.log("Initial supply:", INITIAL_SUPPLY.toLocaleString(), "SLDRT");

    const SolidarityToken = await hre.ethers.getContractFactory("SolidarityToken");
    const token = await SolidarityToken.deploy(INITIAL_SUPPLY, TREASURY);
    await token.waitForDeployment();

    const address = await token.getAddress();
    console.log("SolidarityToken deployed to:", address);

    // Push initial coherence score (0.618 = stable baseline)
    const tx = await token.updateCoherence(6180, 6180, 6180, 6180);
    await tx.wait();
    console.log("Initial coherence set: 0.6180 (stable)");

    // Verify state
    const score = await token.coherenceScore();
    const level = await token.getCoherenceLevel();
    const supply = await token.totalSupply();
    console.log("Verified - Score:", score.toString(), "Level:", level);
    console.log("Total supply:", hre.ethers.formatUnits(supply, 18), "SLDRT");

    // Save deployment info
    const deploymentInfo = {
        contract: "SolidarityToken",
        symbol: "SLDRT",
        address: address,
        network: "sepolia",
        chainId: 11155111,
        treasuryManager: TREASURY,
        initialSupply: INITIAL_SUPPLY,
        coherenceScore: score.toString(),
        coherenceLevel: level,
        deployer: (await hre.ethers.getSigners())[0].address,
        deployedAt: new Date().toISOString(),
        blockNumber: (await hre.ethers.provider.getBlockNumber()).toString()
    };

    const outputPath = "/home/user/workspace/sldrt_deployment.json";
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("Deployment info saved to:", outputPath);

    return address;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
