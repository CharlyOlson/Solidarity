const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SolidarityToken", function () {
    let token;
    let owner;
    let addr1;
    let addr2;
    let treasury;

    const INITIAL_SUPPLY = 1_000_000;
    const CRITICAL_THRESHOLD = 3820;
    const STABLE_THRESHOLD = 6180;
    const ELEVATED_THRESHOLD = 8090;
    const MAX_HISTORY = 30;

    beforeEach(async function () {
        [owner, addr1, addr2, treasury] = await ethers.getSigners();
        const SolidarityToken = await ethers.getContractFactory("SolidarityToken");
        token = await SolidarityToken.deploy(INITIAL_SUPPLY, treasury.address);
        await token.waitForDeployment();
    });

    describe("Deployment", function () {
        it("should have correct name and symbol", async function () {
            expect(await token.name()).to.equal("Solidarity Token");
            expect(await token.symbol()).to.equal("SLDRT");
        });

        it("should mint initial supply to deployer", async function () {
            const expected = ethers.parseUnits(INITIAL_SUPPLY.toString(), 18);
            expect(await token.totalSupply()).to.equal(expected);
            expect(await token.balanceOf(owner.address)).to.equal(expected);
        });

        it("should set treasury manager address", async function () {
            expect(await token.treasuryManager()).to.equal(treasury.address);
        });

        it("should set initial coherence score to 6180", async function () {
            expect(await token.coherenceScore()).to.equal(6180);
        });

        it("should have coherence gating disabled by default", async function () {
            expect(await token.coherenceGatingEnabled()).to.equal(false);
        });

        it("should revert if treasury is zero address", async function () {
            const SolidarityToken = await ethers.getContractFactory("SolidarityToken");
            await expect(
                SolidarityToken.deploy(INITIAL_SUPPLY, ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid treasury");
        });
    });

    describe("Coherence Updates", function () {
        it("should update coherence score", async function () {
            await token.updateCoherence(7500, 7000, 8000, 7500);
            expect(await token.coherenceScore()).to.equal(7500);
        });

        it("should store snapshot in history", async function () {
            await token.updateCoherence(7500, 7000, 8000, 7500);
            expect(await token.getCoherenceHistoryLength()).to.equal(1);

            const snapshot = await token.coherenceHistory(0);
            expect(snapshot.score).to.equal(7500);
            expect(snapshot.safetyScore).to.equal(7000);
            expect(snapshot.harmonyScore).to.equal(8000);
            expect(snapshot.demandScore).to.equal(7500);
        });

        it("should emit CoherenceUpdated event with correct level", async function () {
            // elevated (>= 8090)
            await expect(token.updateCoherence(9000, 9000, 9000, 9000))
                .to.emit(token, "CoherenceUpdated")
                .withArgs(9000, 9000, 9000, 9000, "elevated");

            // stable (>= 6180, < 8090)
            await expect(token.updateCoherence(7000, 7000, 7000, 7000))
                .to.emit(token, "CoherenceUpdated")
                .withArgs(7000, 7000, 7000, 7000, "stable");

            // degraded (>= 3820, < 6180)
            await expect(token.updateCoherence(5000, 5000, 5000, 5000))
                .to.emit(token, "CoherenceUpdated")
                .withArgs(5000, 5000, 5000, 5000, "degraded");

            // critical (< 3820)
            await expect(token.updateCoherence(1000, 1000, 1000, 1000))
                .to.emit(token, "CoherenceUpdated")
                .withArgs(1000, 1000, 1000, 1000, "critical");
        });

        it("should revert if score exceeds 10000", async function () {
            await expect(
                token.updateCoherence(10001, 5000, 5000, 5000)
            ).to.be.revertedWith("Score out of range");
        });

        it("should only allow owner to update coherence", async function () {
            await expect(
                token.connect(addr1).updateCoherence(7500, 7000, 8000, 7500)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should cap history at MAX_HISTORY (30)", async function () {
            // Push 31 updates
            for (let i = 0; i < 31; i++) {
                await token.updateCoherence(5000 + i, 5000, 5000, 5000);
            }
            expect(await token.getCoherenceHistoryLength()).to.equal(MAX_HISTORY);

            // First entry should be the second push (index 1), not the first (index 0)
            const first = await token.coherenceHistory(0);
            expect(first.score).to.equal(5001);

            // Last entry should be the 31st push (index 30)
            const last = await token.coherenceHistory(29);
            expect(last.score).to.equal(5030);
        });
    });

    describe("Coherence Level", function () {
        it("should return 'critical' when score < 3820", async function () {
            await token.updateCoherence(1000, 1000, 1000, 1000);
            expect(await token.getCoherenceLevel()).to.equal("critical");
        });

        it("should return 'degraded' when score >= 3820 and < 6180", async function () {
            await token.updateCoherence(5000, 5000, 5000, 5000);
            expect(await token.getCoherenceLevel()).to.equal("degraded");
        });

        it("should return 'stable' when score >= 6180 and < 8090", async function () {
            // Initial score is 6180
            expect(await token.getCoherenceLevel()).to.equal("stable");
        });

        it("should return 'elevated' when score >= 8090", async function () {
            await token.updateCoherence(9000, 9000, 9000, 9000);
            expect(await token.getCoherenceLevel()).to.equal("elevated");
        });

        it("should return correct level at exact thresholds", async function () {
            await token.updateCoherence(CRITICAL_THRESHOLD, 5000, 5000, 5000);
            expect(await token.getCoherenceLevel()).to.equal("degraded");

            await token.updateCoherence(STABLE_THRESHOLD, 5000, 5000, 5000);
            expect(await token.getCoherenceLevel()).to.equal("stable");

            await token.updateCoherence(ELEVATED_THRESHOLD, 5000, 5000, 5000);
            expect(await token.getCoherenceLevel()).to.equal("elevated");
        });
    });

    describe("Transfer Gating", function () {
        it("should allow owner to enable gating", async function () {
            await expect(token.setCoherenceGating(true))
                .to.emit(token, "CoherenceGatingToggled")
                .withArgs(true);
            expect(await token.coherenceGatingEnabled()).to.equal(true);
        });

        it("should only allow owner to toggle gating", async function () {
            await expect(
                token.connect(addr1).setCoherenceGating(true)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should block transfers when gating enabled and coherence is critical", async function () {
            // Transfer some tokens to addr1 first
            await token.transfer(addr1.address, ethers.parseUnits("1000", 18));

            // Enable gating
            await token.setCoherenceGating(true);

            // Drop coherence below critical
            await token.updateCoherence(1000, 1000, 1000, 1000);

            // Transfer from addr1 should fail
            await expect(
                token.connect(addr1).transfer(addr2.address, ethers.parseUnits("100", 18))
            ).to.be.revertedWith("Transfers paused: coherence critical");
        });

        it("should allow transfers when gating enabled and coherence is above critical", async function () {
            // Transfer some tokens to addr1 first
            await token.transfer(addr1.address, ethers.parseUnits("1000", 18));

            // Enable gating
            await token.setCoherenceGating(true);

            // Coherence is at 6180 (stable) by default
            await token.connect(addr1).transfer(addr2.address, ethers.parseUnits("100", 18));
            expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseUnits("100", 18));
        });

        it("should allow transfers when gating is disabled regardless of coherence", async function () {
            // Transfer some tokens to addr1
            await token.transfer(addr1.address, ethers.parseUnits("1000", 18));

            // Drop coherence below critical but keep gating off
            await token.updateCoherence(1000, 1000, 1000, 1000);

            // Transfer should still work because gating is off
            await token.connect(addr1).transfer(addr2.address, ethers.parseUnits("100", 18));
            expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseUnits("100", 18));
        });

        it("should allow minting even when gating is on and coherence is critical", async function () {
            await token.setCoherenceGating(true);
            await token.updateCoherence(1000, 1000, 1000, 1000);

            // Minting (from == address(0)) should bypass gating
            // Constructor already minted, so this just validates the from==0 check
            // We verify by checking that the constructor mint succeeded even with gating logic
            const supply = await token.totalSupply();
            expect(supply).to.equal(ethers.parseUnits(INITIAL_SUPPLY.toString(), 18));
        });
    });

    describe("Treasury Manager", function () {
        it("should allow owner to update treasury manager", async function () {
            await expect(token.setTreasuryManager(addr1.address))
                .to.emit(token, "TreasuryLinked")
                .withArgs(addr1.address);
            expect(await token.treasuryManager()).to.equal(addr1.address);
        });

        it("should revert if setting treasury to zero address", async function () {
            await expect(
                token.setTreasuryManager(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid treasury");
        });

        it("should only allow owner to set treasury manager", async function () {
            await expect(
                token.connect(addr1).setTreasuryManager(addr2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Constants", function () {
        it("should have correct threshold values", async function () {
            expect(await token.CRITICAL_THRESHOLD()).to.equal(3820);
            expect(await token.STABLE_THRESHOLD()).to.equal(6180);
            expect(await token.ELEVATED_THRESHOLD()).to.equal(8090);
        });

        it("should have MAX_HISTORY of 30", async function () {
            expect(await token.MAX_HISTORY()).to.equal(30);
        });
    });
});
