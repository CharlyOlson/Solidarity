# Test evidence (evidence-only; no code in this commit)

| Item | Value |
|---|---|
| Baseline `main` | `f52e042b47aad70824df1d25fa2b8b42bf6dd8ce`, tree `9dc8368d28a9df2b6f86efb1fb69b836ffac5b00` |
| Planning commit (empty, same tree) | `0f2e9442947e86307708049f8233695a24b49f0d` |
| Pre-repair `StabilityMetrics.sol` blob | `c980dd092c6305419f589653f4089a57e33589ef` |
| **Tested code-bearing commit** | `b96e8dccec04945870c029109c84b49e06c443d3` |
| **Tested tree** | `6f8a84da0e484ad9257194ba5b801de9b09f1050` |
| Environment | Node v22.23.3, npm 10.9.9; hardhat 2.28.6, ethers 6.16.0, `@openzeppelin/contracts` 4.9.6, `solc` 0.8.20 (exact pin, solcjs); lockfile `npm ci --ignore-scripts` |

Run from a clean `git worktree` at the tested SHA (no uncommitted changes, fresh `npm ci`):

| Command | Result |
|---|---|
| `npx hardhat --config hardhat.security.config.js test test/security/*.test.js` | 49 passing, 0 failing, 0 skipped |
| `npx hardhat --config hardhat.security.config.js test` (all existing + new) | 105 passing, 0 failing, 0 skipped (56 pre-existing TreasuryManager/SolidarityToken tests all pass) |

Breakdown of the 49: legacy baseline 3 (documents the vulnerability), StabilityMetrics access 15, handshake 31.
Compilation emitted pre-existing warnings in `TreasuryManager.sol` (shadowed declaration); not touched.

## Toolchain blockers (honest report)

- `npx hardhat test` with the unmodified `hardhat.config.js` fails in this sandbox: `HH502` the native compiler list at `binaries.soliditylang.org` is unreachable (no network). That is an environment limitation, not a code failure. The security config substitutes the exact-pinned local `solc` npm package; it changes no sources or compiler settings (same optimizer/viaIR). Where the network is available, the default config should also run the new tests; that was **not** verified here.
- Native-solc vs solcjs compile equivalence was not separately verified.

## Review and CI

- Automated code review of the code-bearing diff: no significant issues reported. CodeQL (JavaScript): 0 alerts. (Solidity is not covered by CodeQL.)
- GitHub Actions on the PR (Charter Guard, Drift Detector, Secret Scan, Require Signed Commits) were `action_required` (awaiting maintainer approval) at the time of writing; none runs the Hardhat tests, so the CI result says nothing about contract behaviour.
- Commits are not signed by a personal key; the repo's "Require Signed Commits" workflow may flag that. Not bypassed.

## Residual risks

- Shared feed: roles are trusted operators; admin can grant itself any role; no timelock/multisig; metric provenance is unverified; `IntegrationHub` is still open and must not be granted the writer role (D2).
- Prototype: authority attestation is not objective policy; authority/user collusion is out of the threat model; no recovery, rotation, delegation, pause, or device/passkey/2FA integration exists; enrollment trust unresolved (D4). Not an audit; no formal verification, fuzzing, or external review.
- Nothing was deployed; no live RPC, funds or real keys were used. See `THREAT_MODEL_AND_AUTHORITY_MATRIX.md` for decisions D1–D7.
