const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables
const SERVER_SALT = process.env.SERVER_SALT || 's3_hash_server_salt_2024';
const FLAG_TEAM_1 = process.env.FLAG_TEAM_1 || 'flag{s3_hash_multi_stage_complete}';
const MASTER_ENCRYPTION_KEY = process.env.MASTER_ENCRYPTION_KEY || 's3_hash_master_key_32_bytes_long_2024!';

// In-memory storage for sessions, nonces, and rate limiting
const sessions = new Map();
const nonces = new Map();
const rateLimits = new Map();

// TTL values (in milliseconds)
const SESSION_TTL = 90 * 1000; // 90 seconds
const NONCE_TTL = 30 * 1000;   // 30 seconds
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// Canonical fragments (server-side)
const CANONICAL_FRAGMENTS = [
  'VGhlIFVuaXZlcnNl',  // "The Universe"
  'b2YgVW5pdHk=',      // "of Unity"  
  'VGhlIEZsb3dlcnM=',  // "The Flowers"
  'QnVpbGRpbmc='       // "Building"
];

// Expected order: [3,1,0,2] -> "Building of Unity The Universe The Flowers"
const EXPECTED_ORDER = [3, 1, 0, 2];
const EXPECTED_DIGEST = crypto.createHash('sha256')
  .update(CANONICAL_FRAGMENTS[3] + CANONICAL_FRAGMENTS[1] + CANONICAL_FRAGMENTS[0] + CANONICAL_FRAGMENTS[2])
  .digest('hex');

// Decoy MD5 and plaintext
const DECOY_MD5 = 'e0466f61b8c0aaf5aa20bfa6919cda77';
const DECOY_PLAINTEXT = 'decoy_mission_failed';

// Create encrypted blob
const PLAINTEXT_BLOB = 'Building of Unity The Universe The Flowers';
const encryptedBlob = encryptBlob(PLAINTEXT_BLOB, MASTER_ENCRYPTION_KEY);

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Rate limiting middleware
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const limit = rateLimits.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }
  
  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'rate limit exceeded' });
  }
  
  limit.count++;
  next();
}

// Logging middleware
function logRequest(req, res, next) {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const ua = req.get('User-Agent') || 'unknown';
  const teamId = req.body?.team_id || 'unknown';
  
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}, UA: ${ua}, Team: ${teamId}`);
  next();
}

app.use(rateLimit);
app.use(logRequest);

// Utility functions
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

function encryptBlob(plaintext, key) {
  const iv = crypto.randomBytes(16);
  const cipherKey = crypto.createHash('sha256').update(key).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

function decryptBlob(encrypted, key) {
  const [ivBase64, encryptedData] = encrypted.split(':');
  const iv = Buffer.from(ivBase64, 'base64');
  const cipherKey = crypto.createHash('sha256').update(key).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function verifyProof(nonce, proof) {
  // Expected proof: HMAC_SHA256(nonce + "vm_key", "local_transform")
  const expectedProof = crypto.createHmac('sha256', SERVER_SALT)
    .update(nonce + 'vm_key')
    .update('local_transform')
    .digest('hex');
  return proof === expectedProof;
}

function verifyFinalProof(plaintext, teamId, finalProof) {
  const expectedProof = crypto.createHmac('sha256', SERVER_SALT)
    .update(plaintext + teamId)
    .digest('hex');
  return finalProof === expectedProof;
}

// Cleanup expired sessions and nonces
setInterval(() => {
  const now = Date.now();
  
  // Clean sessions
  for (const [token, data] of sessions.entries()) {
    if (now > data.expires) {
      sessions.delete(token);
    }
  }
  
  // Clean nonces
  for (const [nonce, data] of nonces.entries()) {
    if (now > data.expires) {
      nonces.delete(nonce);
    }
  }
  
  // Clean rate limits
  for (const [ip, data] of rateLimits.entries()) {
    if (now > data.resetTime) {
      rateLimits.delete(ip);
    }
  }
}, 10000); // Clean every 10 seconds

// Routes

// GET /session - Issue session token
app.get('/session', (req, res) => {
  const token = generateToken();
  const expires = Date.now() + SESSION_TTL;
  
  sessions.set(token, {
    created: Date.now(),
    expires: expires,
    ip: req.ip || req.connection.remoteAddress
  });
  
  res.json({
    token: token,
    ttl: SESSION_TTL / 1000
  });
});

// GET /mission - Return decoy MD5 (always fails)
app.get('/mission', (req, res) => {
  const token = req.headers['x-session-token'];
  
  // Always return decoy, regardless of session
  res.json({
    hash: DECOY_MD5,
    message: 'MD5 revealed — but you will need more than a crack.'
  });
});

// POST /handshake - Verify candidate order
app.post('/handshake', (req, res) => {
  const token = req.headers['x-session-token'];
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'invalid session token' });
  }
  
  const { candidate_order } = req.body;
  
  if (!Array.isArray(candidate_order) || candidate_order.length !== 4) {
    return res.status(400).json({ error: 'invalid candidate_order format' });
  }
  
  // Verify order
  const isValidOrder = JSON.stringify(candidate_order) === JSON.stringify(EXPECTED_ORDER);
  
  if (!isValidOrder) {
    return res.status(400).json({ error: 'incorrect fragment order' });
  }
  
  // Generate nonce
  const nonce = generateNonce();
  const expires = Date.now() + NONCE_TTL;
  
  nonces.set(nonce, {
    token: token,
    expires: expires,
    created: Date.now()
  });
  
  res.json({ nonce: nonce });
});

// POST /unlock - Verify proof and return ephemeral key
app.post('/unlock', (req, res) => {
  const token = req.headers['x-session-token'];
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'invalid session token' });
  }
  
  const { nonce, proof } = req.body;
  
  if (!nonce || !proof) {
    return res.status(400).json({ error: 'missing nonce or proof' });
  }
  
  if (!nonces.has(nonce)) {
    return res.status(400).json({ error: 'invalid or expired nonce' });
  }
  
  const nonceData = nonces.get(nonce);
  if (nonceData.token !== token) {
    return res.status(400).json({ error: 'nonce token mismatch' });
  }
  
  if (Date.now() > nonceData.expires) {
    nonces.delete(nonce);
    return res.status(400).json({ error: 'nonce expired' });
  }
  
  // Verify proof
  if (!verifyProof(nonce, proof)) {
    return res.status(400).json({ error: 'invalid proof' });
  }
  
  // Generate ephemeral key
  const ephemeralKey = crypto.randomBytes(16).toString('hex');
  
  // Store ephemeral key with session
  const sessionData = sessions.get(token);
  sessionData.ephemeralKey = ephemeralKey;
  sessionData.unlocked = true;
  
  // Invalidate nonce
  nonces.delete(nonce);
  
  res.json({ key: ephemeralKey });
});

// GET /blob - Download encrypted blob
app.get('/blob', (req, res) => {
  const token = req.headers['x-session-token'];
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'invalid session token' });
  }
  
  const sessionData = sessions.get(token);
  
  if (!sessionData.unlocked) {
    return res.status(403).json({ error: 'session not unlocked' });
  }
  
  // Invalidate session after blob download (one-time use)
  sessions.delete(token);
  
  res.set('Content-Type', 'text/plain');
  res.send(encryptedBlob);
});

// POST /claim - Final proof verification
app.post('/claim', (req, res) => {
  const { final_proof, team_id } = req.body;
  
  if (!final_proof || !team_id) {
    return res.status(400).json({ error: 'missing final_proof or team_id' });
  }
  
  // Check for decoy submission
  if (final_proof === DECOY_MD5 || team_id === DECOY_PLAINTEXT) {
    return res.status(403).json({ error: '403: decoy — follow the blob path' });
  }
  
  // Verify final proof
  if (verifyFinalProof(PLAINTEXT_BLOB, team_id, final_proof)) {
    // Return appropriate flag based on team_id
    const flagVar = `FLAG_TEAM_${team_id.replace('team_', '').toUpperCase()}`;
    const flag = process.env[flagVar] || FLAG_TEAM_1;
    
    res.json({ flag: flag });
  } else {
    res.status(403).json({ error: 'invalid final proof' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Expected order: [${EXPECTED_ORDER.join(',')}]`);
  console.log(`Expected digest: ${EXPECTED_DIGEST}`);
  console.log(`Encrypted blob: ${encryptedBlob.substring(0, 50)}...`);
});

module.exports = app;
