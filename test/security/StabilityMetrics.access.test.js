/**
 * Access-control repair of the shared StabilityMetrics feed / global lock policy.
 * Local in-process EVM only, ephemeral accounts, fictional fixtures.
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("StabilityMetrics access control", function () {
  let sm, admin, writer, lockMgr, guardian, stranger;
  let WRITER, LOCK_MGR, GUARDIAN, ADMIN;

  const snapshot = async (c) => ({
    alpha: await c.alphaLock(), beta: await c.betaLock(), omega: await c.omegaLock(),
    day: await c.currentDay(), m: (await c.getCurrentMetrics()).map(String),
  });

  beforeEach(async function () {
    [admin, writer, lockMgr, guardian, stranger] = await ethers.getSigners();
    sm = await (await ethers.getContractFactory("StabilityMetrics")).deploy(admin.address);
    WRITER = await sm.METRICS_WRITER_ROLE();
    LOCK_MGR = await sm.LOCK_MANAGER_ROLE();
    GUARDIAN = await sm.OMEGA_GUARDIAN_ROLE();
    ADMIN = await sm.DEFAULT_ADMIN_ROLE();
    await sm.grantRole(WRITER, writer.address);
    await sm.grantRole(LOCK_MGR, lockMgr.address);
    await sm.grantRole(GUARDIAN, guardian.address);
    await time.increaseTo(Math.floor((await time.latest()) / 86400 + 2) * 86400 + 3600);
  });

  describe("constructor", function () {
    it("rejects a zero admin", async function () {
      const F = await ethers.getContractFactory("StabilityMetrics");
      await expect(F.deploy(ethers.ZeroAddress)).to.be.revertedWith("Admin is zero address");
    });
    it("gives the admin role management only: no lock or write power", async function () {
      expect(await sm.hasRole(ADMIN, admin.address)).to.equal(true);
      for (const r of [WRITER, LOCK_MGR, GUARDIAN]) {
        const fresh = await (await ethers.getContractFactory("StabilityMetrics")).deploy(admin.address);
        expect(await fresh.hasRole(r, admin.address)).to.equal(false);
      }
      const fresh = await (await ethers.getContractFactory("StabilityMetrics")).deploy(admin.address);
      await expect(fresh.connect(admin).setLock("alpha", true)).to.be.reverted;
      await expect(fresh.connect(admin).updateMetrics(1, 1, 1)).to.be.reverted;
    });
  });

  describe("setLock", function () {
    it("rejects unauthorized callers for every lock and leaves state unchanged", async function () {
      const before = await snapshot(sm);
      for (const lock of ["alpha", "beta", "omega"]) {
        await expect(sm.connect(stranger).setLock(lock, true)).to.be.reverted;
      }
      expect(await snapshot(sm)).to.deep.equal(before);
    });
    it("enforces role-per-lock: lock manager cannot touch omega, guardian cannot touch alpha/beta", async function () {
      await expect(sm.connect(lockMgr).setLock("omega", true)).to.be.reverted;
      await expect(sm.connect(guardian).setLock("alpha", true)).to.be.reverted;
      await expect(sm.connect(guardian).setLock("beta", true)).to.be.reverted;
      await expect(sm.connect(writer).setLock("alpha", true)).to.be.reverted;
      expect(await sm.alphaLock()).to.equal(false);
      expect(await sm.omegaLock()).to.equal(false);
    });
    it("lets authorized roles set and clear their locks and emits LockStatusChanged", async function () {
      await expect(sm.connect(lockMgr).setLock("alpha", true)).to.emit(sm, "LockStatusChanged").withArgs("alpha", true);
      await sm.connect(lockMgr).setLock("beta", true);
      await sm.connect(guardian).setLock("omega", true);
      expect([await sm.alphaLock(), await sm.betaLock(), await sm.omegaLock()]).to.deep.equal([true, true, true]);
      await sm.connect(lockMgr).setLock("alpha", false);
      await sm.connect(guardian).setLock("omega", false);
      expect([await sm.alphaLock(), await sm.omegaLock()]).to.deep.equal([false, false]);
    });
    it("rejects unknown lock strings even from authorized roles, with no state change or event", async function () {
      const before = await snapshot(sm);
      for (const caller of [lockMgr, guardian, admin]) {
        for (const lock of ["gamma", "", "Alpha", "alpha ", "omega\0"]) {
          await expect(sm.connect(caller).setLock(lock, true)).to.be.reverted;
        }
      }
      expect(await snapshot(sm)).to.deep.equal(before);
    });
  });

  describe("updateMetrics", function () {
    it("rejects unauthorized writers (including admin, lock manager, guardian) with unchanged state", async function () {
      const before = await snapshot(sm);
      for (const s of [stranger, admin, lockMgr, guardian]) {
        await expect(sm.connect(s).updateMetrics(3000, 4000, 0)).to.be.reverted;
      }
      expect(await snapshot(sm)).to.deep.equal(before);
    });
    it("preserves the Omega veto even for authorized writers; unlocking is not available to writers", async function () {
      await sm.connect(guardian).setLock("omega", true);
      const before = await snapshot(sm);
      await expect(sm.connect(writer).updateMetrics(1, 1, 1)).to.be.revertedWith("Omega lock active");
      await expect(sm.connect(writer).setLock("omega", false)).to.be.reverted;
      expect(await snapshot(sm)).to.deep.equal(before);
      await sm.connect(guardian).setLock("omega", false);
      await sm.connect(writer).updateMetrics(1, 1, 1);
    });
    it("preserves the scoring formula (floor(100*sqrt(p^2+v^2+l^2)/1000))", async function () {
      await expect(sm.connect(writer).updateMetrics(3000, 4000, 0)).to.emit(sm, "MetricsUpdated");
      expect((await sm.getCurrentMetrics()).stabilityScore).to.equal(500n);
      await time.increase(86400);
      await sm.connect(writer).updateMetrics(10, 10, 10);
      expect((await sm.getCurrentMetrics()).stabilityScore).to.equal(1n); // floor(17.3*100/1000)
    });
    it("preserves same-day replacement and next-day new entry", async function () {
      await sm.connect(writer).updateMetrics(3000, 4000, 0);
      const day = await sm.currentDay();
      await sm.connect(writer).updateMetrics(6000, 8000, 0);
      expect(await sm.currentDay()).to.equal(day);
      expect((await sm.dailyMetrics(day)).stabilityScore).to.equal(1000n);
      await time.increase(86400);
      await sm.connect(writer).updateMetrics(3000, 4000, 0);
      expect(await sm.currentDay()).to.equal(day + 1n);
      expect((await sm.dailyMetrics(day)).stabilityScore).to.equal(1000n);
    });
    it("still reverts (checked arithmetic) on squared-input overflow rather than wrapping", async function () {
      await expect(sm.connect(writer).updateMetrics(2n ** 128n, 0, 0)).to.be.reverted;
    });
  });

  describe("role audit trail", function () {
    it("emits RoleGranted / RoleRevoked with the acting account", async function () {
      await expect(sm.connect(admin).grantRole(WRITER, stranger.address))
        .to.emit(sm, "RoleGranted").withArgs(WRITER, stranger.address, admin.address);
      await sm.connect(stranger).updateMetrics(1, 1, 1);
      await expect(sm.connect(admin).revokeRole(WRITER, stranger.address))
        .to.emit(sm, "RoleRevoked").withArgs(WRITER, stranger.address, admin.address);
      await expect(sm.connect(stranger).updateMetrics(1, 1, 1)).to.be.reverted;
    });
    it("rejects role grants/revokes from non-admins", async function () {
      await expect(sm.connect(stranger).grantRole(WRITER, stranger.address)).to.be.reverted;
      await expect(sm.connect(writer).grantRole(GUARDIAN, writer.address)).to.be.reverted;
      await expect(sm.connect(guardian).revokeRole(GUARDIAN, guardian.address)).to.be.reverted;
      expect(await sm.hasRole(WRITER, stranger.address)).to.equal(false);
    });
  });

  describe("IntegrationHub caller compatibility", function () {
    let hub, monitor;
    beforeEach(async function () {
      const Mon = await ethers.getContractFactory("MockMonitor");
      monitor = await Mon.deploy();
      hub = await (await ethers.getContractFactory("IntegrationHub"))
        .deploy(await sm.getAddress(), ethers.ZeroAddress, await monitor.getAddress());
    });
    it("hub cannot write until it is explicitly granted METRICS_WRITER_ROLE", async function () {
      await expect(hub.connect(stranger).processMetrics(3000, 4000, 0)).to.be.reverted;
    });
    it("KNOWN RISK: once granted, the unrestricted hub.processMetrics lets anyone write via the hub", async function () {
      await sm.grantRole(WRITER, await hub.getAddress());
      await hub.connect(stranger).processMetrics(3000, 4000, 0);
      expect((await sm.getCurrentMetrics()).stabilityScore).to.equal(500n);
    });
  });
});
