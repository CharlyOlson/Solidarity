/**
 * Negative-security reproduction of the PRE-REPAIR StabilityMetrics (blob c980dd0).
 * These tests PASS by demonstrating the vulnerability: they document that, before
 * the repair, any account can flip locks and write metrics. Local in-process EVM only.
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Legacy StabilityMetrics baseline (documents the pre-repair weakness)", function () {
  let legacy, stranger;

  beforeEach(async function () {
    [, stranger] = await ethers.getSigners();
    const F = await ethers.getContractFactory("LegacyStabilityMetricsBaseline");
    legacy = await F.deploy();
  });

  it("lets any account set every lock, including omega", async function () {
    await legacy.connect(stranger).setLock("omega", true);
    await legacy.connect(stranger).setLock("alpha", true);
    expect(await legacy.omegaLock()).to.equal(true);
    expect(await legacy.alphaLock()).to.equal(true);
  });

  it("lets any account clear omega and then write metrics", async function () {
    await legacy.connect(stranger).setLock("omega", true);
    await expect(legacy.connect(stranger).updateMetrics(1, 1, 1)).to.be.revertedWith("Omega lock active");
    await legacy.connect(stranger).setLock("omega", false);
    await legacy.connect(stranger).updateMetrics(3000, 4000, 0);
    expect((await legacy.getCurrentMetrics()).stabilityScore).to.equal(500n);
  });

  it("accepts unknown lock strings and emits an event without changing state", async function () {
    await expect(legacy.connect(stranger).setLock("gamma", true))
      .to.emit(legacy, "LockStatusChanged").withArgs("gamma", true);
    expect(await legacy.alphaLock()).to.equal(false);
    expect(await legacy.betaLock()).to.equal(false);
    expect(await legacy.omegaLock()).to.equal(false);
  });
});
