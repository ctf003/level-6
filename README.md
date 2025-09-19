# Hash S3 6 - Multi-Stage CTF Puzzle

A sophisticated, AI-resistant CTF puzzle that requires players to follow a complex multi-stage sequence to obtain the real flag. The visible MD5 hash is a decoy designed to frustrate automated solvers.

## Overview

This puzzle implements a chained sequence that must be completed in order:
1. **Fragment Assembly** - Extract and order Base64 fragments from page meta tags
2. **VM Execution** - Run a JavaScript micro-VM to compute the correct fragment permutation
3. **Handshake** - Submit the computed order to the server
4. **Unlock** - Provide a proof derived from the nonce using local computation
5. **Blob Download** - Retrieve an encrypted blob from the server
6. **Local Decryption** - Decrypt the blob using the ephemeral key
7. **Final Claim** - Submit the final proof to claim the flag

## Architecture

### Frontend (Client-Side)
- **Vanilla JavaScript** - No external dependencies
- **Meta Tag Fragments** - Base64-encoded fragments in HTML meta tags
- **Ordering VM** - JavaScript micro-VM that computes fragment permutation
- **Progressive Hints** - Three levels of hints with increasing penalties
- **Decoy MD5** - Visible hash that always fails server verification

### Backend (Server-Side)
- **Express.js** - Minimal Node.js server
- **Session Management** - Short TTL tokens with automatic cleanup
- **Rate Limiting** - IP-based rate limiting to prevent abuse
- **AES Encryption** - Encrypted blob that requires ephemeral key
- **HMAC Verification** - Server-side proof verification for all steps
- **Comprehensive Logging** - All requests logged with IP, UA, and timestamps

## Environment Variables

Set these environment variables before starting the server:

```bash
# Server configuration
SERVER_SALT=s3_hash_server_salt_2024
MASTER_ENCRYPTION_KEY=s3_hash_master_key_32_bytes_long_2024!

# Team flags (never commit these!)
FLAG_TEAM_1=flag{s3_hash_multi_stage_complete}
FLAG_TEAM_2=flag{another_team_flag}
FLAG_TEAM_3=flag{yet_another_team_flag}
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   ```bash
   export SERVER_SALT="your_secret_salt_here"
   export MASTER_ENCRYPTION_KEY="your_32_byte_key_here"
   export FLAG_TEAM_1="flag{your_team_flag_here}"
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the puzzle:**
   Open `http://localhost:3000` in your browser

## Solve Flow

### Step 1: Fragment Discovery
Players must find the Base64 fragments in the HTML meta tags:
```html
<!-- MARKER: S3_HASH_FRAGMENTS -->
<meta name="frag-0" content="VGhlIEZsb3dlcnM=" />
<meta name="frag-1" content="b2YgVW5pdHk=" />
<meta name="frag-2" content="QnVpbGRpbmc=" />
<meta name="frag-3" content="VGhlIFVuaXZlcnNl" />
```

### Step 2: VM Computation
Run the ordering VM to compute the correct permutation:
```javascript
// Command: compute
// Output: computed order: [3,1,0,2]
```

### Step 3: Session & Handshake
```bash
session                    # Get session token
handshake 3,1,0,2         # Submit correct order
# Server returns nonce if order is correct
```

### Step 4: Unlock
```bash
unlock <proof>            # Submit proof derived from nonce
# Proof = HMAC_SHA256(nonce + "vm_key", "local_transform")
```

### Step 5: Blob & Decryption
```bash
blob                      # Download encrypted blob
decrypt <ephemeral_key>   # Decrypt blob locally
```

### Step 6: Final Claim
```bash
claim <final_proof>       # Submit final proof
# final_proof = HMAC_SHA256(SERVER_SALT, plaintext + team_id)
```

## API Endpoints

### GET /session
Obtain a session token (90s TTL)
```json
{
  "token": "abc123...",
  "ttl": 90
}
```

### GET /mission
Always returns the decoy MD5 (bait for crackers)
```json
{
  "hash": "e0466f61b8c0aaf5aa20bfa6919cda77",
  "message": "MD5 revealed — but you will need more than a crack."
}
```

### POST /handshake
Submit candidate fragment order
```json
{
  "candidate_order": [3, 1, 0, 2]
}
```

### POST /unlock
Submit proof to unlock ephemeral key
```json
{
  "nonce": "abc123...",
  "proof": "def456..."
}
```

### GET /blob
Download encrypted blob (requires unlocked session)
Headers: `X-Session-Token: <token>`

### POST /claim
Submit final proof to claim flag
```json
{
  "final_proof": "ghi789...",
  "team_id": "team_1"
}
```

## Security Features

### Anti-AI Measures
- **Session Tokens** - Short TTL prevents mass scraping
- **Rate Limiting** - 10 requests per minute per IP
- **Encrypted Blob** - Requires server-side unlock
- **VM Execution** - Static analysis won't reveal correct order
- **Progressive Hints** - Penalized hint system

### Anti-Paste Protection
- **Decoy MD5** - Always fails, explicit rejection message
- **Chained Dependencies** - Each step requires previous completion
- **Ephemeral Keys** - One-time use tokens
- **Server Verification** - All proofs verified server-side

## TTL Values

- **Session Token**: 90 seconds
- **Nonce**: 30 seconds  
- **Rate Limit Window**: 60 seconds
- **Ephemeral Key**: Single use only

## Testing

### Validation Checklist
- [ ] `git grep -n "flag{"` shows zero client-side hits
- [ ] `missionexploit()` without session shows decoy MD5
- [ ] Cracking decoy MD5 fails with explicit rejection
- [ ] VM computes correct order [3,1,0,2]
- [ ] Handshake accepts correct order, rejects incorrect
- [ ] Unlock requires valid proof
- [ ] Blob requires unlocked session
- [ ] Final claim returns flag for correct proof

### Test Commands
```bash
# Test the complete flow
npm test

# Check for client-side flags
git grep -n "flag{"

# Verify decoy behavior
curl -X GET http://localhost:3000/mission
```

## Logging

All requests are logged with:
- Timestamp
- HTTP method and path
- Client IP address
- User-Agent string
- Team ID (when available)

Special logging for:
- Decoy submissions (for post-CTF analysis)
- Failed handshake attempts
- Rate limit violations
- Successful flag claims

## Deployment Notes

- **Never commit flags** - Use environment variables only
- **Set strong secrets** - Use cryptographically secure random values
- **Monitor logs** - Watch for abuse patterns
- **Rate limiting** - Adjust limits based on expected traffic
- **HTTPS in production** - Ensure all traffic is encrypted

## Troubleshooting

### Common Issues
1. **"invalid session token"** - Session expired, get new one
2. **"incorrect fragment order"** - Run VM computation first
3. **"invalid proof"** - Check proof calculation algorithm
4. **"session not unlocked"** - Complete unlock step first
5. **"rate limit exceeded"** - Wait before retrying

### Debug Mode
Set `DEBUG=1` environment variable for verbose logging.

## Files Structure

```
hash-s3-6/
├── index.html          # Frontend with meta fragments
├── script.js           # Main client-side logic
├── ordering-vm.js      # JavaScript micro-VM
├── styles.css          # Terminal styling
├── server.js           # Express server
├── package.json        # Dependencies
└── README.md           # This file
```

## License

MIT License - Use responsibly for educational CTF purposes only.
