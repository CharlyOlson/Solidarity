/**
 * HarmonicAIInputFormatter
 * Math-driven prompt / input formatting pipeline for building a custom AI bot
 * integrating Solidarity's golden ratio, Fibonacci, mirror numbers, and harmonic interval systems.
 *
 * Core Goals:
 *  - Derive structured metadata from raw user input using project mathematical primitives
 *  - Provide a deterministic, inspectable prompt skeleton for LLM requests (e.g., Perplexity)
 *  - Offer extensible hooks for future reinforcement / adaptive tuning
 *
 * Exports:
 *  formatHarmonicInput(rawText, options?) -> HarmonicFormattedInput
 *  buildPerplexityRequest(rawText, options?) -> { model, messages, ... }
 *  computeInputFeatures(rawText) -> feature object (internal, exported for testing)
 */

const {
  GoldenRatioMath,
  MirrorNumberSystem
} = require('../core/goldenHarmonicSystem');
const path = require('path');
const fs = require('fs');
let cacheApi = null;
try {
  cacheApi = require('./HarmonicCache');
} catch (_) {
  // optional cache layer
}
const { harmonicReferenceTable } = require('../core/harmonicReferenceTable');

// Default model candidates (aligned with Perplexity doc categories)
const DEFAULT_MODEL_CANDIDATES = [
  process.env.PERPLEXITY_MODEL,
  'sonar',
  'sonar-pro',
  'sonar-reasoning',
  'sonar-reasoning-pro'
].filter(Boolean);

/**
 * Adaptive model + temperature heuristic.
 * Returns ordered model candidates + temperature based on feature complexity.
 */
function chooseModelAndTemperature(features, explicitCandidates = DEFAULT_MODEL_CANDIDATES) {
  const { entropyApprox: H, wordCount: W, goldenPartitionIndex: G, nearestFibonacci: F, mirror } = features;

  // Entropy tiers
  const entropyTier = H < 3 ? 'low' : H < 4 ? 'medium' : 'high';

  // Complexity score (rough composite)
  const fibDistance = Math.abs(W - F);
  const structuralRatio = G / (W || 1);
  const mirrorDelta = Math.abs((mirror.nearestRepunit || 1) - W) / Math.max(1, W);
  const complexityScore = (
    (entropyTier === 'high' ? 2 : entropyTier === 'medium' ? 1 : 0) +
    (fibDistance > 8 ? 1 : 0) +
    (structuralRatio > 0.65 ? 1 : 0) +
    (mirrorDelta < 0.05 ? 1 : 0)
  );

  // Decide base family priority
  let ordered = [...explicitCandidates];
  if (complexityScore <= 1) {
    // simpler queries: prefer search models early
    ordered.sort((a, b) => a.localeCompare(b)); // deterministic baseline
    ordered = ordered.sort(m => /reasoning/.test(m) ? 1 : -1);
  } else if (complexityScore <= 3) {
    // moderate: balanced ordering
    ordered = ordered.sort(m => /reasoning-pro/.test(m) ? 1 : 0);
  } else {
    // high complexity: put reasoning models first
    ordered = ordered.sort((a, b) => (/reasoning/.test(b) ? 1 : -1));
  }

  // Temperature heuristic
  let temperature = 0.25;
  if (entropyTier === 'high') temperature += 0.07;
  if (mirrorDelta < 0.05) temperature -= 0.04; // near repunit => structured
  if (W > 120) temperature += 0.03;
  if (temperature < 0.15) temperature = 0.15;
  if (temperature > 0.45) temperature = 0.45;

  return { orderedModelCandidates: ordered, temperature: Number(temperature.toFixed(2)), complexityScore };
}

/**
 * Tokenize text conservatively (word-level) while retaining indices.
 */
function basicTokenize(text) {
  if (!text) return [];
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => ({ token: w, index: i }));
}

/**
 * Map tokens cyclically to harmonic intervals for semantic coloration.
 */
function mapTokensToHarmonics(tokens) {
  if (!tokens.length) return [];
  return tokens.map((t, i) => {
    const h = harmonicReferenceTable[i % harmonicReferenceTable.length];
    return {
      ...t,
      harmonic: h.interval,
      ratio: h.ratio,
      intervalName: h.name
    };
  });
}

/**
 * Compute mirror number / repunit related features from text length characteristics.
 */
function computeMirrorNumberFeatures(mirrorSystem, length) {
  const repunits = mirrorSystem.generateRepunits(Math.min(6, Math.max(1, Math.floor(Math.log10(length + 1)) + 2))); // up to 6 digits
  const nearestRepunit = repunits.reduce((prev, cur) => Math.abs(cur - length) < Math.abs(prev - length) ? cur : prev, repunits[0]);
  const isLengthPalindrome = mirrorSystem.isPalindrome(length);
  return {
    repunitsSample: repunits.slice(0, 6),
    nearestRepunit,
    lengthIsPalindrome: isLengthPalindrome
  };
}

/**
 * Compute high-level input metrics and mathematical descriptors.
 */
function computeInputFeatures(rawText) {
  const golden = new GoldenRatioMath();
  const mirror = new MirrorNumberSystem();
  const tokens = basicTokenize(rawText);
  const charLength = rawText.length;
  const wordCount = tokens.length;
  const goldenPartitionIndex = Math.floor(wordCount * golden.PHI_RECIPROCAL); // main/core segment boundary
  const harmonicTokens = mapTokensToHarmonics(tokens);
  const mirrorFeatures = computeMirrorNumberFeatures(mirror, charLength);

  // Fibonacci proximity (nearest fibonacci numbers around word count)
  let fibBelow = 0, fibAbove = 1;
  while (fibAbove < wordCount) {
    const next = fibBelow + fibAbove;
    fibBelow = fibAbove;
    fibAbove = next;
  }
  const nearestFibonacci = Math.abs(wordCount - fibBelow) < Math.abs(wordCount - fibAbove) ? fibBelow : fibAbove;

  return {
    rawLength: charLength,
    wordCount,
    goldenPartitionIndex,
    phi: golden.PHI,
    phiReciprocal: golden.PHI_RECIPROCAL,
    goldenAngle: golden.GOLDEN_ANGLE,
    fibBelow,
    fibAbove,
    nearestFibonacci,
    mirror: mirrorFeatures,
    harmonicCoverage: harmonicTokens.slice(0, 12), // snippet preview
    entropyApprox: approximateShannonEntropy(rawText),
    timestamp: Date.now()
  };
}

/**
 * Approximate Shannon entropy (character distribution) for variability feature.
 */
function approximateShannonEntropy(text) {
  if (!text) return 0;
  const freq = {};
  for (const c of text) {
    freq[c] = (freq[c] || 0) + 1;
  }
  const len = text.length;
  let H = 0;
  for (const k in freq) {
    const p = freq[k] / len;
    H -= p * Math.log2(p);
  }
  return Number(H.toFixed(4));
}

/**
 * Build a structured prompt skeleton that encodes math-derived metadata.
 */
function buildPromptSkeleton(rawText, features) {
  const coreWords = basicTokenize(rawText).slice(0, features.goldenPartitionIndex).map(t => t.token).join(' ');
  const expansionWords = basicTokenize(rawText).slice(features.goldenPartitionIndex).map(t => t.token).join(' ');
  const mirrorTag = features.mirror.lengthIsPalindrome ? 'PAL_LENGTH' : 'NONPAL_LENGTH';

  const systemContent = [
    'You are a Harmonic-Golden AI agent for the Solidarity platform.',
    'Incorporate mathematical awareness (golden ratio, harmonic intervals, Fibonacci proximity) to enhance reasoning clarity.',
    'When structuring answers: first provide a concise Core Response, then an Expansion segment, optionally a Harmonic Reflection summarizing proportion or interval insights.',
    'Avoid overusing math terms; use them only where they genuinely sharpen explanation.'
  ].join('\n');

  const metaHeader = [
    `#HARMONIC_META`,
    `phi=${features.phi.toFixed(12)}`,
    `phi_recip=${features.phiReciprocal.toFixed(12)}`,
    `golden_angle=${features.goldenAngle.toFixed(6)}`,
    `word_count=${features.wordCount}`,
    `golden_partition_index=${features.goldenPartitionIndex}`,
    `nearest_fib=${features.nearestFibonacci}`,
    `entropy=${features.entropyApprox}`,
    `mirror_nearest=${features.mirror.nearestRepunit}`,
    `mirror_length_pal=${features.mirror.lengthIsPalindrome}`,
    `mirror_tag=${mirrorTag}`
  ].join('|');

  const userContent = [
    metaHeader,
    '## CORE_SEGMENT',
    coreWords || rawText,
    '## EXPANSION_SEGMENT',
    expansionWords || '(none)',
    '## ORIGINAL_INPUT',
    rawText
  ].join('\n');

  return {
    system: systemContent,
    user: userContent
  };
}

/**
 * Main formatting function.
 */
function formatHarmonicInput(rawText, options = {}) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('Input text must be a non-empty string');
  }
  // Cache lookup
  let cacheHit = false;
  let features;
  if (cacheApi) {
    const cached = cacheApi.getCachedFeatures(rawText);
    if (cached) {
      features = cached.features;
      cacheHit = true;
    }
  }
  if (!features) {
    features = computeInputFeatures(rawText);
    if (cacheApi) {
      try { cacheApi.storeFeatures(rawText, features); } catch (_) { /* ignore */ }
    }
  }
  const skeleton = buildPromptSkeleton(rawText, features);
  return {
    version: '1.0.0',
    created: new Date().toISOString(),
    features,
    skeleton,
    cacheHit,
    advisory: 'You may feed messages=[{role:"system",content:skeleton.system},{role:"user",content:skeleton.user}] to an LLM.'
  };
}

/**
 * Build Perplexity-style request payload (caller still performs HTTP request).
 */
function buildPerplexityRequest(rawText, options = {}) {
  const { modelCandidates = DEFAULT_MODEL_CANDIDATES, temperature } = options;
  const formatted = formatHarmonicInput(rawText, options);
  const adaptive = chooseModelAndTemperature(formatted.features, modelCandidates);
  const finalTemp = (typeof temperature === 'number') ? temperature : adaptive.temperature;
  const chosenModel = adaptive.orderedModelCandidates[0];
  return {
    model: chosenModel,
    modelCandidates: adaptive.orderedModelCandidates,
    messages: [
      { role: 'system', content: formatted.skeleton.system },
      { role: 'user', content: formatted.skeleton.user }
    ],
    temperature: finalTemp,
    complexityScore: adaptive.complexityScore,
    _harmonicMeta: formatted.features,
    _cacheHit: formatted.cacheHit
  };
}

module.exports = {
  formatHarmonicInput,
  buildPerplexityRequest,
  computeInputFeatures,
  chooseModelAndTemperature
};

// CLI helper for quick experimentation
if (require.main === module) {
  const input = process.argv.slice(2).join(' ') || 'Explain resonant synchronization in distributed audio systems.';
  const formatted = formatHarmonicInput(input);
  console.log('--- Harmonic Formatted Input (System) ---\n');
  console.log(formatted.skeleton.system);
  console.log('\n--- Harmonic Formatted Input (User) ---\n');
  console.log(formatted.skeleton.user);
  console.log('\n--- Features Snapshot ---');
  console.dir(formatted.features, { depth: 3 });
}
