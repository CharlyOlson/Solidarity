# StabilityMetrics access control and consent-handshake prototype: threat model

Scope: a focused review-only security change. Baseline `main` = `f52e042` (tree `9dc8368b…`);
the PR planning commit `0f2e944` is empty and has the same tree. Pre-repair
`contracts/StabilityMetrics.sol` blob: `c980dd092c6305419f589653f4089a57e33589ef`.
Separate from audio PRs #26/#27/#29/#30. No change to `TreasuryManager.sol`,
`SOLIDARITY_CHARTER.md`, audio/DSP, or economic semantics.

## What is and is not claimed

- Repaired: the **shared metrics feed and global lock policy** in `StabilityMetrics` now enforce roles in the contract.
- Prototype only: a **personal consent handshake** (`contracts/prototype/`), not wired to anything, not deployed, not production.
- `StabilityMetrics` has **no per-user resources**; nothing here pretends otherwise.
- Not claimed: AI-proof security, deployed protection, full-platform certification, visual/Hanko matching, MAC/location checks, encryption, MFA, device or passkey integration. None of these are implemented or tested here.

## Findings from inspection (baseline)

| Item | Finding |
|---|---|
| `setLock(string,bool)` | Public, unrestricted; any account can set alpha/beta/omega, including clearing `omegaLock`. Unknown strings emit an event and change nothing. |
| `updateMetrics(...)` | Public; only gate is `!omegaLock`, which anyone can clear, so the gate is not a security control. |
| Callers in repo | Only `IntegrationHub.processMetrics` (external, unrestricted) calls `updateMetrics`. No deploy script deploys `StabilityMetrics` (`DEPLOYMENT.md` address is blank). `src/utils/walletManager.js` ABI is for a different function name and is unaffected. |
| Existing authN/authz | Other contracts use `onlyOwner` or are open; there is no shared governance policy and no spec assigning who operates the metrics feed or omega. |
| Open-PR overlap | None touch `StabilityMetrics`, `IntegrationHub`, or `hardhat.config.js`. #15 and #24 touch `package.json` (different hunks). |

## Authority matrix

| Resource / action | Class | Who may act (this PR) | Who may NOT |
|---|---|---|---|
| Grant/revoke roles on `StabilityMetrics` | Shared governance | `DEFAULT_ADMIN_ROLE` (set by constructor arg) | Everyone else |
| `updateMetrics` | Shared metrics feed | `METRICS_WRITER_ROLE` | Admin (unless it also grants itself the role, visible on-chain), lock roles, public |
| `setLock("alpha"/"beta")` | Global policy | `LOCK_MANAGER_ROLE` | Everyone else |
| `setLock("omega")` (global write veto) | Global emergency policy | `OMEGA_GUARDIAN_ROLE` | Writers and lock managers cannot clear it |
| Unknown lock string | n/a | Nobody: reverts | |
| Personal account/resource operations | Personal | **Not implemented in production.** Prototype requires user approval **and** system permit | No central actor, relayer, AI, or admin can sign for a user |

Admin can grant itself any role. That is an accepted, auditable power (`RoleGranted`
events), not a hidden one; role holders for production are decision D1 below.
Personal consent is never a role in `StabilityMetrics`.

## Threat model (shared feed)

| Threat | Mitigation | Residual |
|---|---|---|
| Anyone flips locks / clears omega | Role per lock; reverts otherwise (tests) | Compromised role key can still act |
| Anyone writes fake metrics | `METRICS_WRITER_ROLE` | Writer is trusted; on-chain code cannot verify inputs are true (provenance not verified) |
| Role changes unnoticed | OZ `RoleGranted`/`RoleRevoked` events | Needs off-chain monitoring |
| Unknown lock typo silently "succeeds" | Reverts `Unknown lock type` | Behavior change: previously a no-op with event |
| Open `IntegrationHub.processMetrics` becomes a bypass once the hub is granted the writer role | Test documents it; hub not modified | **Do not grant the hub the writer role until the hub is access-controlled (decision D2).** |
| Admin key loss/compromise | None here (no timelock/multisig) | Use a multisig/timelock for the admin (D1) |
| Last admin renounces | Not prevented | Governance hygiene (D1) |

Disclosed, not changed: scoring formula and same-day replacement are preserved
bit-for-bit. `price²+volume²+liquidity²` reverts on overflow (checked math, Solidity ≥0.8)
rather than wrapping; integer division floors the score; inputs have no units/scale
validation; a same-day write replaces the earlier one; a day with no write
leaves `currentDay` at the last written day.

## Compatibility notes

- **Constructor changed**: `StabilityMetrics()` becomes `StabilityMetrics(address initialAdmin)` (non-zero). Any deployment script must pass it. None exists in the repo.
- **Startup sequence**: deploy, then admin grants `METRICS_WRITER_ROLE`, `LOCK_MANAGER_ROLE`, `OMEGA_GUARDIAN_ROLE` to the intended operators. Before this, all writes and lock changes revert.
- **ABI**: `setLock`, `updateMetrics`, events and getters are unchanged; `AccessControl` functions are added.
- **Callers**: `IntegrationHub` calls revert until granted; see D2 before granting.
- Per-lock roles are my reading of the matrix, because nothing in the specs says who operates locks.

## Personal consent handshake prototype (non-production)

`contracts/prototype/ConsentHandshakePrototype.sol`. Both are required for each protected operation:

1. **User approval**: EIP-712 `UserApproval` signed by the signer the *user enrolled for that scope* (EOA or ERC-1271 contract wallet).
2. **System permit**: EIP-712 `SystemPermit` signed by a distinct `policyAuthority`.

Both bind the same payload: user, scope, action, key, value commitment, nonce, deadline,
enrollment epoch, policy epoch, optional context commitment; plus chain ID and verifying contract via the EIP-712 domain.
Different type names prevent reuse of one signature as the other. Libraries: OpenZeppelin Contracts 4.9.6
(`EIP712`, `SignatureChecker`/ECDSA, lockfile-pinned); no bespoke cryptography.

- State writes happen only inside `execute`, after both checks. Anyone may relay; submission confers no authority. There is no `user_confirmed` flag, no admin setter, no arbitrary call, no funds, no external call except ERC-1271 static verification.
- Enrollment: `enrollSigner(scope, signer)` binds to `msg.sender` only; no function takes a user account to enroll or replace. The authority's address is rejected as a user signer.
- Revocation / rotation: user-only; each bumps the enrollment epoch so older approvals die, even if the same key is re-enrolled.
- Policy change: `advancePolicyEpoch()` (authority only) invalidates all outstanding permits.
- Context: `contextCommitment` is a commitment only. Raw personal context (Hanko artwork, rotating presentation, daily word) stays off-chain. A daily word is user-facing context, **not** a password, MFA factor, or key-generation entropy. Challenges must be fresh random values (the tests use `crypto.randomBytes`); the contract never sees them.

### Authority attestation vs verified policy

A system permit proves that the **policy authority signed**; it does **not** prove the action satisfies an
objective policy. Anything a compromised authority signs is "permitted". It still cannot produce a user
approval. Colluding authority and user key together can do anything in scope. Compromise of either
single side alone cannot execute an operation. A real objective policy check (on-chain rules, attestations from
independent verifiers, multi-party authority) is an open design item (D3).

### Explicitly not implemented (powers kept visible)

| Power | Status |
|---|---|
| Recovery / lost-signer path | Not implemented. A user who loses a signer can enroll a new one only from the same account. Account-level loss has no recovery (D4). |
| Administrative user-key replacement | Deliberately absent |
| Delegation | Not implemented |
| Upgrade | None (non-upgradeable) |
| Emergency pause/unpause | Not implemented. The prototype's only global lever is `advancePolicyEpoch` (stops all outstanding permits). A pause design must not allow unpausing to bypass user consent (D5). |
| Authority rotation | Not implemented (`policyAuthority` is immutable in the prototype) (D3) |

## Decisions required before any production use

- **D1** Who holds `DEFAULT_ADMIN_ROLE`, writer, lock-manager and omega-guardian roles for the shared feed? (multisig/timelock?)
- **D2** Does `IntegrationHub` get its own access control (or is it retired)? Until then it must not be granted the writer role.
- **D3** Who is the system policy authority, how is it rotated, and what objective policy does it attest?
- **D4** Recovery and enrollment trust: how is a user's first signer enrollment authenticated, and how is loss recovered without admin impersonation?
- **D5** Emergency pause semantics and who controls them.
- **D6** Provenance of metric inputs (who attests price/volume/liquidity?) and whether the economic formula/scaling should change (out of scope here).
- **D7** Real device/passkey/2FA integration (out of scope; nothing is implemented).
