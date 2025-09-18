const axios = require('axios');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');

// Simple in-memory cache
const cache = {
  keys: null,
  fetchedAt: 0,
  maxAgeMs: 60 * 60 * 1000, // 1 hour
};

async function fetchJWKS(jwksUrl) {
  const now = Date.now();
  if (cache.keys && (now - cache.fetchedAt) < cache.maxAgeMs) {
    return cache.keys;
  }
  const { data } = await axios.get(jwksUrl, { timeout: 5000 });
  if (!data || !data.keys) throw new Error('Invalid JWKS response');
  cache.keys = data.keys;
  cache.fetchedAt = now;
  return cache.keys;
}

async function getSigningKey(jwksUrl, kid) {
  const keys = await fetchJWKS(jwksUrl);
  const jwk = keys.find(k => k.kid === kid) || keys[0];
  if (!jwk) throw new Error('No JWKs available');
  const pem = jwkToPem(jwk);
  return pem;
}

async function verifyWithJWKS(token, jwksUrl, options = {}) {
  const decodedHeader = jwt.decode(token, { complete: true });
  if (!decodedHeader || !decodedHeader.header) throw new Error('Invalid token');
  const { kid, alg } = decodedHeader.header;
  const pem = await getSigningKey(jwksUrl, kid);
  return jwt.verify(token, pem, { algorithms: [alg || 'RS256'], ...options });
}

module.exports = {
  fetchJWKS,
  getSigningKey,
  verifyWithJWKS,
};

