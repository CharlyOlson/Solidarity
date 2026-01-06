const { QuantumMathUtils } = require('../src/QuantumMathUtils');

describe('QuantumMathUtils', () => {
  test('fibonacciQuantum(10) ≈ 55', () => {
    const v = QuantumMathUtils.fibonacciQuantum(10);
    expect(v).toBeGreaterThan(54.9);
    expect(v).toBeLessThan(55.1);
  });

  test('calculateResonanceFrequency returns finite positive', () => {
    const f = QuantumMathUtils.calculateResonanceFrequency(42, 440);
    expect(Number.isFinite(f)).toBe(true);
    expect(f).toBeGreaterThan(0);
  });

  test('cubicHarmonicMean simple array > 0', () => {
    const mean = QuantumMathUtils.cubicHarmonicMean([1, 8, 27]); // 1^3, 2^3, 3^3
    expect(mean).toBeGreaterThan(0);
  });
});
