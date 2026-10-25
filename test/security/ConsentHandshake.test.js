/**
 * ConsentHandshakePrototype: NON-PRODUCTION local prototype tests.
 * Fictional fixtures, ephemeral accounts/keys only, in-process EVM, no network.
 */
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const crypto = require("crypto");
const { id, domainFor, signUser, signSystem } = require("./helpers/handshake");

describe("ConsentHandshakePrototype (non-production)", function () {
  let hs, other, domain, authority, userAcct, userKey, userB, relayer, attacker;
  const SCOPE = id("scope:demo-notes");
  const SCOPE2 = id("scope:demo-other");
  const SET = id("SET_ENTRY");
  const CLEAR = id("CLEAR_ENTRY");
  const KEY = id("key:one");
  const VAL = id("value:alpha");

  const freshChallengeCommitment = () =>
    ethers.keccak256(ethers.concat([crypto.randomBytes(32)])); // random challenge, only its commitment is used

  async function makeOp(over = {}) {
    return {
      user: userAcct.address, scope: SCOPE, action: SET, key: KEY, valueHash: VAL,
      nonce: await hs.nonces(userAcct.address, SCOPE),
      deadline: (await time.latest()) + 3600,
      enrollmentEpoch: await hs.enrollmentEpoch(userAcct.address, SCOPE),
      policyEpoch: await hs.policyEpoch(),
      contextCommitment: freshChallengeCommitment(),
      ...over,
    };
  }
  const both = async (op, d = domain) => [await signUser(userKey, d, op), await signSystem(authority, d, op)];
  const entry = (u = userAcct.address, s = SCOPE, k = KEY) => hs.entries(u, s, k);

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    [authority, userAcct, relayer, attacker, userB] = signers;
    userKey = ethers.Wallet.createRandom().connect(ethers.provider); // ephemeral user-controlled signer
    const F = await ethers.getContractFactory("ConsentHandshakePrototype");
    hs = await F.deploy(authority.address);
    other = await F.deploy(authority.address);
    domain = await domainFor(hs);
    await hs.connect(userAcct).enrollSigner(SCOPE, userKey.address);
  });

  describe("construction and enrollment", function () {
    it("rejects a zero authority", async function () {
      const F = await ethers.getContractFactory("ConsentHandshakePrototype");
      await expect(F.deploy(ethers.ZeroAddress)).to.be.revertedWith("Authority is zero address");
    });
    it("enrollment is per caller and per scope; nobody can enroll for another user", async function () {
      expect(await hs.userSigner(userAcct.address, SCOPE)).to.equal(userKey.address);
      expect(await hs.userSigner(userAcct.address, SCOPE2)).to.equal(ethers.ZeroAddress);
      expect(await hs.userSigner(userB.address, SCOPE)).to.equal(ethers.ZeroAddress);
      const fns = hs.interface.fragments.filter((f) => f.type === "function").map((f) => f.name);
      for (const f of fns.filter((n) => /enroll|revoke/i.test(n))) {
        const params = hs.interface.getFunction(f).inputs.map((i) => i.type);
        expect(params).to.not.include("address[]");
      }
      expect(hs.interface.getFunction("enrollSigner").inputs.map((i) => i.type)).to.deep.equal(["bytes32", "address"]);
    });
    it("rejects the system authority as a user signer (same authority on both sides)", async function () {
      await expect(hs.connect(userB).enrollSigner(SCOPE, authority.address)).to.be.revertedWith("Signer is system authority");
      await expect(hs.connect(userB).enrollSigner(SCOPE, ethers.ZeroAddress)).to.be.revertedWith("Signer is zero address");
    });
    it("the authority cannot sign for the user: its signature on the user side is rejected", async function () {
      const op = await makeOp();
      const sysSig = await signSystem(authority, domain, op);
      const forgedUser = await signUser(authority, domain, op);
      await expect(hs.connect(relayer).execute(op, forgedUser, sysSig)).to.be.revertedWith("Invalid user approval");
      expect(await entry()).to.equal(ethers.ZeroHash);
    });
    it("exposes no external state writer other than the four documented functions", async function () {
      const writers = hs.interface.fragments
        .filter((f) => f.type === "function" && f.stateMutability !== "view" && f.stateMutability !== "pure")
        .map((f) => f.name).sort();
      expect(writers).to.deep.equal(["advancePolicyEpoch", "enrollSigner", "execute", "revokeSigner"]);
    });
  });

  describe("all four user/system approval combinations", function () {
    it("user approval only -> rejected, state unchanged, nonce unconsumed", async function () {
      const op = await makeOp();
      const userSig = await signUser(userKey, domain, op);
      await expect(hs.connect(relayer).execute(op, userSig, "0x")).to.be.reverted;
      const wrongSys = await signSystem(attacker, domain, op);
      await expect(hs.connect(relayer).execute(op, userSig, wrongSys)).to.be.revertedWith("Invalid system permit");
      expect(await entry()).to.equal(ethers.ZeroHash);
      expect(await hs.nonces(userAcct.address, SCOPE)).to.equal(0n);
    });
    it("system permit only -> rejected, state unchanged", async function () {
      const op = await makeOp();
      const sysSig = await signSystem(authority, domain, op);
      await expect(hs.connect(relayer).execute(op, "0x", sysSig)).to.be.reverted;
      const wrongUser = await signUser(attacker, domain, op);
      await expect(hs.connect(relayer).execute(op, wrongUser, sysSig)).to.be.revertedWith("Invalid user approval");
      expect(await entry()).to.equal(ethers.ZeroHash);
    });
    it("neither -> rejected, state unchanged", async function () {
      const op = await makeOp();
      await expect(hs.connect(attacker).execute(op, "0x", "0x")).to.be.reverted;
      expect(await entry()).to.equal(ethers.ZeroHash);
    });
    it("both -> succeeds when submitted by an unrelated relayer, and emits the commitment only", async function () {
      const op = await makeOp();
      const [u, s] = await both(op);
      await expect(hs.connect(relayer).execute(op, u, s))
        .to.emit(hs, "OperationExecuted")
        .withArgs(userAcct.address, SCOPE, SET, KEY, VAL, 0n, op.contextCommitment, relayer.address);
      expect(await entry()).to.equal(VAL);
      expect(await hs.nonces(userAcct.address, SCOPE)).to.equal(1n);
    });
    it("a relayer cannot mint approvals: their own signatures on both sides fail", async function () {
      const op = await makeOp();
      const u = await signUser(relayer, domain, op);
      const s = await signSystem(relayer, domain, op);
      await expect(hs.connect(relayer).execute(op, u, s)).to.be.revertedWith("Invalid user approval");
    });
  });

  describe("binding of payload, user, scope, action, contract, chain", function () {
    const mutations = {
      key: { key: id("key:two") },
      valueHash: { valueHash: id("value:beta") },
      contextCommitment: { contextCommitment: id("ctx:other") },
      deadline: { deadline: 9_999_999_999 },
    };
    for (const [name, patch] of Object.entries(mutations)) {
      it(`altered ${name} after signing is rejected`, async function () {
        const op = await makeOp();
        const [u, s] = await both(op);
        await expect(hs.connect(relayer).execute({ ...op, ...patch }, u, s)).to.be.reverted;
        expect(await entry()).to.equal(ethers.ZeroHash);
        expect(await entry(userAcct.address, SCOPE, patch.key || KEY)).to.equal(ethers.ZeroHash);
      });
    }
    it("altered action (SET -> CLEAR) is rejected", async function () {
      const op = await makeOp();
      const [u, s] = await both(op);
      await expect(hs.connect(relayer).execute({ ...op, action: CLEAR, valueHash: ethers.ZeroHash }, u, s)).to.be.reverted;
      expect(await entry()).to.equal(ethers.ZeroHash);
    });
    it("unknown actions and invalid value/action combinations are rejected", async function () {
      let op = await makeOp({ action: id("TRANSFER") });
      let [u, s] = await both(op);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("Unknown action");
      op = await makeOp({ valueHash: ethers.ZeroHash });
      [u, s] = await both(op);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("Invalid value for action");
    });
    it("cross-user: a permit for user A cannot be applied to user B", async function () {
      await hs.connect(userB).enrollSigner(SCOPE, userKey.address); // even with the same signer key
      const op = await makeOp();
      const [u, s] = await both(op);
      await expect(hs.execute({ ...op, user: userB.address }, u, s)).to.be.reverted;
      expect(await entry(userB.address)).to.equal(ethers.ZeroHash);
    });
    it("scope isolation: approvals and nonces for one scope never apply to another", async function () {
      const key2 = ethers.Wallet.createRandom();
      await hs.connect(userAcct).enrollSigner(SCOPE2, key2.address);
      const op = await makeOp();
      const [u, s] = await both(op);
      await expect(hs.execute({ ...op, scope: SCOPE2 }, u, s)).to.be.reverted;
      await hs.execute(op, u, s);
      expect(await hs.nonces(userAcct.address, SCOPE2)).to.equal(0n);
      expect(await entry(userAcct.address, SCOPE2)).to.equal(ethers.ZeroHash);
      // user's signer for SCOPE cannot approve for SCOPE2
      const op2 = await makeOp({ scope: SCOPE2, nonce: 0n, enrollmentEpoch: 1n });
      await expect(hs.execute(op2, await signUser(userKey, domain, op2), await signSystem(authority, domain, op2)))
        .to.be.revertedWith("Invalid user approval");
    });
    it("cross-contract: a permit for one deployment fails on another", async function () {
      await other.connect(userAcct).enrollSigner(SCOPE, userKey.address);
      const op = await makeOp();
      const [u, s] = await both(op);
      await expect(other.execute(op, u, s)).to.be.revertedWith("Invalid user approval");
    });
    it("cross-chain: signatures over a different chainId are rejected", async function () {
      const op = await makeOp();
      const d = await domainFor(hs, { chainId: domain.chainId + 1n });
      const [u, s] = await both(op, d);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("Invalid user approval");
    });
    it("user approval cannot be reused as a system permit and vice versa", async function () {
      const op = await makeOp();
      const u = await signUser(userKey, domain, op);
      const s = await signSystem(authority, domain, op);
      await expect(hs.execute(op, s, u)).to.be.revertedWith("Invalid user approval");
    });
  });

  describe("nonce, expiry, replay", function () {
    it("consumes the nonce: replay of the same approval fails; sequential ops work; skipped nonce fails", async function () {
      const op = await makeOp();
      const [u, s] = await both(op);
      await hs.execute(op, u, s);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("Bad nonce");
      const op2 = await makeOp({ key: id("key:two"), valueHash: id("v2") });
      expect(op2.nonce).to.equal(1n);
      const [u2, s2] = await both(op2);
      await hs.execute(op2, u2, s2);
      const op4 = await makeOp({ nonce: 5n });
      const [u4, s4] = await both(op4);
      await expect(hs.execute(op4, u4, s4)).to.be.revertedWith("Bad nonce");
    });
    it("rejects expired permits and accepts them up to the deadline", async function () {
      const op = await makeOp({ deadline: (await time.latest()) + 100 });
      const [u, s] = await both(op);
      await time.increase(200);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("Expired");
      expect(await entry()).to.equal(ethers.ZeroHash);
      const fresh = await makeOp({ deadline: (await time.latest()) + 100 });
      const [u2, s2] = await both(fresh);
      await hs.execute(fresh, u2, s2);
    });
    it("CLEAR_ENTRY removes the value only with both approvals", async function () {
      let op = await makeOp();
      let [u, s] = await both(op);
      await hs.execute(op, u, s);
      op = await makeOp({ action: CLEAR, valueHash: ethers.ZeroHash });
      await expect(hs.execute(op, await signUser(userKey, domain, op), "0x")).to.be.reverted;
      expect(await entry()).to.equal(VAL);
      [u, s] = await both(op);
      await hs.execute(op, u, s);
      expect(await entry()).to.equal(ethers.ZeroHash);
    });
  });

  describe("revocation, rotation and policy change", function () {
    it("signer revocation invalidates outstanding approvals, even after re-enrolling the same key", async function () {
      const op = await makeOp();
      const [u, s] = await both(op);
      await hs.connect(userAcct).revokeSigner(SCOPE);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("No enrolled signer");
      await hs.connect(userAcct).enrollSigner(SCOPE, userKey.address);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("Stale enrollment epoch");
      expect(await entry()).to.equal(ethers.ZeroHash);
    });
    it("only the user can revoke; others cannot revoke or replace the signer", async function () {
      await expect(hs.connect(attacker).revokeSigner(SCOPE)).to.be.revertedWith("No signer enrolled");
      await expect(hs.connect(authority).revokeSigner(SCOPE)).to.be.revertedWith("No signer enrolled");
      expect(await hs.userSigner(userAcct.address, SCOPE)).to.equal(userKey.address);
    });
    it("user-controlled signer rotation invalidates approvals from the old signer", async function () {
      const op = await makeOp();
      const [u, s] = await both(op);
      const newKey = ethers.Wallet.createRandom();
      await hs.connect(userAcct).enrollSigner(SCOPE, newKey.address);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("Stale enrollment epoch");
      const op2 = await makeOp();
      await hs.execute(op2, await signUser(newKey, domain, op2), await signSystem(authority, domain, op2));
      expect(await entry()).to.equal(VAL);
    });
    it("policy epoch advance invalidates outstanding permits; only the authority can advance it", async function () {
      const op = await makeOp();
      const [u, s] = await both(op);
      await expect(hs.connect(attacker).advancePolicyEpoch()).to.be.revertedWith("Not system authority");
      await expect(hs.connect(userAcct).advancePolicyEpoch()).to.be.revertedWith("Not system authority");
      await expect(hs.connect(authority).advancePolicyEpoch()).to.emit(hs, "PolicyEpochAdvanced").withArgs(2n);
      await expect(hs.execute(op, u, s)).to.be.revertedWith("Stale policy epoch");
      expect(await entry()).to.equal(ethers.ZeroHash);
      const op2 = await makeOp();
      expect(op2.policyEpoch).to.equal(2n);
      const [u2, s2] = await both(op2);
      await hs.execute(op2, u2, s2);
    });
    it("policy epoch advance does not let the authority approve for the user", async function () {
      await hs.connect(authority).advancePolicyEpoch();
      const op = await makeOp();
      await expect(hs.execute(op, await signUser(authority, domain, op), await signSystem(authority, domain, op)))
        .to.be.revertedWith("Invalid user approval");
    });
  });

  describe("smart-contract wallet (ERC-1271) user signer", function () {
    it("accepts a contract-wallet signer the user enrolled, and still requires the system permit", async function () {
      const ownerKey = ethers.Wallet.createRandom();
      const wallet = await (await ethers.getContractFactory("MockERC1271Wallet")).deploy(ownerKey.address);
      await hs.connect(userB).enrollSigner(SCOPE, await wallet.getAddress());
      const op = await makeOp({ user: userB.address, nonce: 0n, enrollmentEpoch: 1n });
      const u = await signUser(ownerKey, domain, op);
      await expect(hs.execute(op, u, "0x")).to.be.reverted;
      await hs.execute(op, u, await signSystem(authority, domain, op));
      expect(await entry(userB.address)).to.equal(VAL);
      const bad = await makeOp({ user: userB.address, nonce: 1n, enrollmentEpoch: 1n });
      await expect(hs.execute(bad, await signUser(attacker, domain, bad), await signSystem(authority, domain, bad)))
        .to.be.revertedWith("Invalid user approval");
    });
  });

  describe("direct-call bypass and no-funds properties", function () {
    it("there is no external function that writes entries without execute()", async function () {
      for (const name of ["setEntry", "set", "write", "clearEntry"]) {
        expect(hs.interface.getFunction(name)).to.equal(null);
      }
      await expect(attacker.sendTransaction({ to: await hs.getAddress(), data: "0x12345678" })).to.be.reverted;
      await expect(attacker.sendTransaction({ to: await hs.getAddress(), value: 1n })).to.be.reverted;
      expect(await ethers.provider.getBalance(await hs.getAddress())).to.equal(0n);
    });
  });
});
