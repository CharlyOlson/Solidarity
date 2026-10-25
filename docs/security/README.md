# Security suite

Run (local in-process EVM only; no network, keys, or RPC):

```bash
npm ci --ignore-scripts
npx hardhat --config hardhat.security.config.js test test/security/*.test.js
```

`hardhat.security.config.js` reuses `hardhat.config.js` but compiles with the exact-pinned `solc` npm
package (solcjs 0.8.20) so it works where the native compiler download is blocked.
Threat model, authority matrix and open decisions: [THREAT_MODEL_AND_AUTHORITY_MATRIX.md](./THREAT_MODEL_AND_AUTHORITY_MATRIX.md).
Test evidence: [EVIDENCE.md](./EVIDENCE.md).

Files under `contracts/prototype/` are non-production (prototype, mocks, a verbatim copy of the legacy vulnerable contract). Do not deploy them.
