/**
 * TreasuryManager — Hardhat Tests
 * 
 * Tests the charter-defined distribution logic:
 * - 15 named 1% slots
 * - Infrastructure reserve (max 10%, set once)
 * - Class Equity & Rebuild Fund (remainder)
 * - Zero-address accumulation
 * - Flush mechanism
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TreasuryManager", function () {
  let treasury;
  let owner, scott, hank, classEquity, infraReserve;
  let hc1, hc2, hc3, hc4, cause1, cause2, cause3;
  let mother, sophie, mariah, colombia, slotA, slotB;

  const BP_DENOMINATOR = 10000n;

  beforeEach(async function () {
    [owner, scott, hank, classEquity, infraReserve,
     hc1, hc2, hc3, hc4, cause1, cause2, cause3,
     mother, sophie, mariah, colombia, slotA, slotB] = await ethers.getSigners();

    const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
    treasury = await TreasuryManager.deploy(
      scott.address,
      hank.address,
      classEquity.address,
      infraReserve.address
    );
  });

  describe("Deployment", function () {
    it("sets constructor addresses correctly", async function () {
      expect(await treasury.scott()).to.equal(scott.address);
      expect(await treasury.hank()).to.equal(hank.address);
      expect(await treasury.classEquityRebuildFund()).to.equal(classEquity.address);
      expect(await treasury.infrastructureReserve()).to.equal(infraReserve.address);
    });

    it("sets deployer as owner", async function () {
      expect(await treasury.owner()).to.equal(owner.address);
    });

    it("starts with zero distributions", async function () {
      expect(await treasury.totalDistributed()).to.equal(0);
      expect(await treasury.distributionCount()).to.equal(0);
    });

    it("starts with infrastructure reserve not set", async function () {
      expect(await treasury.infrastructureReserveSet()).to.equal(false);
      expect(await treasury.infrastructureReserveBP()).to.equal(0);
    });

    it("reverts if scott address is zero", async function () {
      const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
      await expect(
        TreasuryManager.deploy(ethers.ZeroAddress, hank.address, classEquity.address, infraReserve.address)
      ).to.be.revertedWith("Scott address required");
    });

    it("reverts if hank address is zero", async function () {
      const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
      await expect(
        TreasuryManager.deploy(scott.address, ethers.ZeroAddress, classEquity.address, infraReserve.address)
      ).to.be.revertedWith("Hank address required");
    });
  });

  describe("Infrastructure Reserve", function () {
    it("owner can set infrastructure reserve BP", async function () {
      await treasury.setInfrastructureReserveBP(500); // 5%
      expect(await treasury.infrastructureReserveBP()).to.equal(500);
      expect(await treasury.infrastructureReserveSet()).to.equal(true);
    });

    it("cannot set above 10% (1000 BP)", async function () {
      await expect(
        treasury.setInfrastructureReserveBP(1001)
      ).to.be.revertedWith("Cannot exceed 10% of gross revenue");
    });

    it("can only be set once", async function () {
      await treasury.setInfrastructureReserveBP(500);
      await expect(
        treasury.setInfrastructureReserveBP(300)
      ).to.be.revertedWith("Already set - cannot change");
    });

    it("non-owner cannot set", async function () {
      await expect(
        treasury.connect(scott).setInfrastructureReserveBP(500)
      ).to.be.reverted;
    });

    it("emits InfrastructureReserveSized event", async function () {
      await expect(treasury.setInfrastructureReserveBP(500))
        .to.emit(treasury, "InfrastructureReserveSized")
        .withArgs(500);
    });
  });

  describe("Slot Setup", function () {
    it("owner can set Hank choices", async function () {
      await treasury.setHankChoices(hc1.address, hc2.address, hc3.address, hc4.address);
      expect(await treasury.hankChoice1()).to.equal(hc1.address);
      expect(await treasury.hankChoice2()).to.equal(hc2.address);
      expect(await treasury.hankChoice3()).to.equal(hc3.address);
      expect(await treasury.hankChoice4()).to.equal(hc4.address);
    });

    it("owner can set Hank causes", async function () {
      await treasury.setHankCauses(cause1.address, cause2.address, cause3.address);
      expect(await treasury.hankCause1()).to.equal(cause1.address);
      expect(await treasury.hankCause2()).to.equal(cause2.address);
      expect(await treasury.hankCause3()).to.equal(cause3.address);
    });

    it("owner can set named slots", async function () {
      await treasury.setNamedSlots(mother.address, sophie.address, mariah.address, colombia.address);
      expect(await treasury.scottsMotherAddr()).to.equal(mother.address);
      expect(await treasury.sophieJones()).to.equal(sophie.address);
      expect(await treasury.mariah()).to.equal(mariah.address);
      expect(await treasury.colombiaFund()).to.equal(colombia.address);
    });

    it("owner can set open slots", async function () {
      await treasury.setOpenSlots(slotA.address, slotB.address);
      expect(await treasury.openSlotA()).to.equal(slotA.address);
      expect(await treasury.openSlotB()).to.equal(slotB.address);
    });

    it("non-owner cannot set slots", async function () {
      await expect(
        treasury.connect(scott).setHankChoices(hc1.address, hc2.address, hc3.address, hc4.address)
      ).to.be.reverted;
    });
  });

  describe("Distribution", function () {
    beforeEach(async function () {
      // Full setup: set infra reserve and all slots
      await treasury.setInfrastructureReserveBP(500); // 5%
      await treasury.setHankChoices(hc1.address, hc2.address, hc3.address, hc4.address);
      await treasury.setHankCauses(cause1.address, cause2.address, cause3.address);
      await treasury.setNamedSlots(mother.address, sophie.address, mariah.address, colombia.address);
      await treasury.setOpenSlots(slotA.address, slotB.address);
    });

    it("distributes revenue correctly (10 ETH)", async function () {
      const amount = ethers.parseEther("10");
      
      // Track balances before
      const scottBefore = await ethers.provider.getBalance(scott.address);
      const hankBefore = await ethers.provider.getBalance(hank.address);
      const classEquityBefore = await ethers.provider.getBalance(classEquity.address);
      const infraBefore = await ethers.provider.getBalance(infraReserve.address);

      await treasury.distribute({ value: amount });

      const scottAfter = await ethers.provider.getBalance(scott.address);
      const hankAfter = await ethers.provider.getBalance(hank.address);
      const classEquityAfter = await ethers.provider.getBalance(classEquity.address);
      const infraAfter = await ethers.provider.getBalance(infraReserve.address);

      // Scott: 1% of 10 ETH = 0.1 ETH
      expect(scottAfter - scottBefore).to.equal(ethers.parseEther("0.1"));
      // Hank: 1% of 10 ETH = 0.1 ETH
      expect(hankAfter - hankBefore).to.equal(ethers.parseEther("0.1"));
      // Infrastructure: 5% of 10 ETH = 0.5 ETH
      expect(infraAfter - infraBefore).to.equal(ethers.parseEther("0.5"));

      // Class Equity: 10 - (15 * 0.1) - 0.5 = 10 - 1.5 - 0.5 = 8.0 ETH
      expect(classEquityAfter - classEquityBefore).to.equal(ethers.parseEther("8"));
    });

    it("increments distribution count and total", async function () {
      await treasury.distribute({ value: ethers.parseEther("1") });
      expect(await treasury.distributionCount()).to.equal(1);
      expect(await treasury.totalDistributed()).to.equal(ethers.parseEther("1"));

      await treasury.distribute({ value: ethers.parseEther("2") });
      expect(await treasury.distributionCount()).to.equal(2);
      expect(await treasury.totalDistributed()).to.equal(ethers.parseEther("3"));
    });

    it("reverts with zero value", async function () {
      await expect(
        treasury.distribute({ value: 0 })
      ).to.be.revertedWith("No revenue to distribute");
    });

    it("reverts if infrastructure reserve not set", async function () {
      // Deploy a fresh contract without setting infra BP
      const TreasuryManager = await ethers.getContractFactory("TreasuryManager");
      const fresh = await TreasuryManager.deploy(
        scott.address, hank.address, classEquity.address, infraReserve.address
      );
      await expect(
        fresh.distribute({ value: ethers.parseEther("1") })
      ).to.be.revertedWith("Infrastructure reserve BP not set yet");
    });

    it("emits RevenueDistributed event", async function () {
      const amount = ethers.parseEther("1");
      await expect(treasury.distribute({ value: amount }))
        .to.emit(treasury, "RevenueDistributed");
    });

    it("each named slot gets exactly 1%", async function () {
      const amount = ethers.parseEther("100"); // Easy math: 1% = 1 ETH

      const slotAddresses = [
        hc1, hc2, hc3, hc4,
        cause1, cause2, cause3,
        mother, sophie, mariah, colombia,
        slotA, slotB
      ];

      const balancesBefore = await Promise.all(
        slotAddresses.map(s => ethers.provider.getBalance(s.address))
      );

      await treasury.distribute({ value: amount });

      const balancesAfter = await Promise.all(
        slotAddresses.map(s => ethers.provider.getBalance(s.address))
      );

      // Each should receive exactly 1 ETH (1% of 100 ETH)
      for (let i = 0; i < slotAddresses.length; i++) {
        expect(balancesAfter[i] - balancesBefore[i]).to.equal(
          ethers.parseEther("1"),
          `Slot ${i} did not receive 1%`
        );
      }
    });
  });

  describe("Zero-Address Accumulation", function () {
    it("holds funds in contract when slots are zero address", async function () {
      // Only set infra reserve, leave all other slots as zero
      await treasury.setInfrastructureReserveBP(500);

      const amount = ethers.parseEther("10");
      await treasury.distribute({ value: amount });

      // Contract should hold the funds for 13 empty slots (13 * 1% = 13% = 1.3 ETH)
      const contractBalance = await ethers.provider.getBalance(await treasury.getAddress());
      expect(contractBalance).to.equal(ethers.parseEther("1.3"));
    });
  });

  describe("Flush", function () {
    it("owner can flush accumulated funds", async function () {
      // Set infra but leave slots empty
      await treasury.setInfrastructureReserveBP(500);
      await treasury.distribute({ value: ethers.parseEther("10") });

      // Contract has 1.3 ETH (13 empty slots * 1%)
      const recipientBefore = await ethers.provider.getBalance(mother.address);
      await treasury.flushAccumulated(mother.address);
      const recipientAfter = await ethers.provider.getBalance(mother.address);

      expect(recipientAfter - recipientBefore).to.equal(ethers.parseEther("1.3"));
    });

    it("reverts with zero address", async function () {
      await expect(
        treasury.flushAccumulated(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });

    it("reverts with zero balance", async function () {
      await expect(
        treasury.flushAccumulated(mother.address)
      ).to.be.revertedWith("Nothing to flush");
    });

    it("non-owner cannot flush", async function () {
      await treasury.setInfrastructureReserveBP(500);
      await treasury.distribute({ value: ethers.parseEther("1") });
      await expect(
        treasury.connect(scott).flushAccumulated(mother.address)
      ).to.be.reverted;
    });
  });

  describe("Receive", function () {
    it("contract can receive plain ETH transfers", async function () {
      await owner.sendTransaction({
        to: await treasury.getAddress(),
        value: ethers.parseEther("1")
      });
      const balance = await ethers.provider.getBalance(await treasury.getAddress());
      expect(balance).to.equal(ethers.parseEther("1"));
    });
  });
});
