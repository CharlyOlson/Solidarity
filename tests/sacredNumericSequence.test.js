const { SacredNumericSequence } = require('../src/SacredNumericSequence');

describe('SacredNumericSequence', () => {
  test('generateFibonacciSequence(10) returns first 10 fibonacci numbers', () => {
    const sns = new SacredNumericSequence();
    const seq = sns.generateFibonacciSequence(10);
    expect(seq).toEqual([0,1,1,2,3,5,8,13,21,34]);
  });

  test('phi approximation from fibonacci converges near phi', () => {
    const sns = new SacredNumericSequence();
    const fib = sns.getSequence('fibonacci');
    const approx = sns.calculateGoldenRatioApproximation(fib, 10);
    expect(approx).toBeGreaterThan(1.6);
    expect(approx).toBeLessThan(1.7);
    // close to sns.phi
    expect(Math.abs(approx - sns.phi)).toBeLessThan(0.05);
  });

  test('solidarity_nodes exists and contains expected nodes', () => {
    const sns = new SacredNumericSequence();
    const nodes = sns.getSequence('solidarity_nodes');
    expect(nodes).toEqual([1,3,4,7,14,21]);
  });

  test('generateHarmonicFrequencies returns positive fundamental', () => {
    const sns = new SacredNumericSequence();
    const res = sns.generateHarmonicFrequencies('fibonacci', 7);
    expect(res).toHaveProperty('fundamental');
    expect(res.fundamental).toBeGreaterThan(0);
    expect(Array.isArray(res.golden_ratios)).toBe(true);
  });
});
