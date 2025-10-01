/**
 * HarmonicCache - lightweight JSONL-based caching for harmonic feature extraction
 * and model responses. Designed to avoid external dependencies.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '..', '.cache');
const FEATURE_FILE = path.join(CACHE_DIR, 'harmonic-features.jsonl');
const RESPONSE_FILE = path.join(CACHE_DIR, 'harmonic-responses.jsonl');

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function stableHash(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function appendJSONL(file, obj) {
  ensureDir();
  fs.appendFileSync(file, JSON.stringify(obj) + '\n', 'utf8');
}

function indexFile(file) {
  if (!fs.existsSync(file)) return new Map();
  const map = new Map();
  const lines = fs.readFileSync(file, 'utf8').split(/\n+/).filter(Boolean);
  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (obj.key) map.set(obj.key, obj);
    } catch (_) { /* ignore corrupted line */ }
  }
  return map;
}

let featureIndex = null;
let responseIndex = null;

function lazyLoad() {
  if (!featureIndex) featureIndex = indexFile(FEATURE_FILE);
  if (!responseIndex) responseIndex = indexFile(RESPONSE_FILE);
}

function getCachedFeatures(rawText) {
  lazyLoad();
  const key = stableHash('F|' + rawText);
  return featureIndex.get(key) || null;
}

function storeFeatures(rawText, features) {
  lazyLoad();
  const key = stableHash('F|' + rawText);
  if (featureIndex.has(key)) return;
  const record = { key, ts: Date.now(), features };
  appendJSONL(FEATURE_FILE, record);
  featureIndex.set(key, record);
}

function getCachedResponse(requestObject) {
  lazyLoad();
  const signature = JSON.stringify({
    modelCandidates: requestObject.modelCandidates || [requestObject.model],
    messages: requestObject.messages,
    temperature: requestObject.temperature
  });
  const key = stableHash('R|' + signature);
  return responseIndex.get(key) || null;
}

function storeResponse(requestObject, responseData) {
  lazyLoad();
  const signature = JSON.stringify({
    modelCandidates: requestObject.modelCandidates || [requestObject.model],
    messages: requestObject.messages,
    temperature: requestObject.temperature
  });
  const key = stableHash('R|' + signature);
  if (responseIndex.has(key)) return;
  const record = { key, ts: Date.now(), response: responseData };
  appendJSONL(RESPONSE_FILE, record);
  responseIndex.set(key, record);
}

module.exports = {
  getCachedFeatures,
  storeFeatures,
  getCachedResponse,
  storeResponse
};
