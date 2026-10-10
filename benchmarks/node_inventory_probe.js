/**
 * Smoke probe for JS components named in the twelve-node inventory.
 * Loads and instantiates only; no network, keys, RPC, wallets or funds.
 * Prints one JSON object on the last stdout line.
 */
const path = require('path');
const root = path.resolve(__dirname, '..');
const out = {};
const realLog = console.log;
console.log = () => {};

function probe(name, fn) {
    try { out[name] = { executed: true, detail: fn() }; }
    catch (e) { out[name] = { executed: false, detail: 'ERR ' + String(e.message).slice(0, 160) }; }
}
const req = (p) => require(path.join(root, p));

probe('CorrectedSolidaritySystem', () => {
    const { CorrectedSolidaritySystem } = req('src/correctedSolidaritySystem.js');
    const s = new CorrectedSolidaritySystem();
    return typeof s.getSystemStatus;
});
probe('ComprehensiveSolidarityDiscovery', () => {
    const { ComprehensiveSolidarityDiscovery } = req('src/ComprehensiveSolidarityDiscovery.js');
    return typeof new ComprehensiveSolidarityDiscovery();
});
probe('GreekLetterNodesSystem(alpha,beta,theta,omega)', () => {
    const { GreekLetterNodesSystem } = req('src/nodes/GreekLetterNodesSystem.js');
    const s = new GreekLetterNodesSystem({ enableAutoActivation: false, logLevel: 'error' });
    return Object.keys(s.nodes);
});
probe('SacredNumericSequence(Henry ladder source)', () => {
    const { SacredNumericSequence } = req('src/SacredNumericSequence.js');
    return Object.getOwnPropertyNames(Object.getPrototypeOf(new SacredNumericSequence())).slice(0, 6);
});
probe('QuantumGoldenProcessor.processKleinTunneling(classical simulation)', () => {
    const g = req('src/goldenHarmonicSystem.js');
    const q = new g.QuantumGoldenProcessor(new g.GoldenRatioMath());
    return q.processKleinTunneling([0.1, 0.5, 1.0]).length;
});
console.log = realLog;
console.log(JSON.stringify(out));
process.exit(0);
