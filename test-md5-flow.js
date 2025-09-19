// Test script for MD5 decode flow

const crypto = require('crypto');

console.log('🧪 Testing Hash S3 6 MD5 Decode Flow\n');

// The MD5 hash from missionexploit
const MISSION_MD5 = '134f554d33350e632942044032509562';

console.log('Step 1 - Mission Exploit Output:');
console.log('HASH: ' + MISSION_MD5);
console.log('MD5 revealed — decode it to find the real mission.');
console.log('');

console.log('Step 2 - MD5 Decode Process:');
console.log('Players need to:');
console.log('1. Copy the MD5 hash: ' + MISSION_MD5);
console.log('2. Use an MD5 decoder (online or offline)');
console.log('3. Decode the hash to get the message');
console.log('');

// Verify the MD5 hash
const expectedMessage = 'The real mission is at /For Real';
const generatedHash = crypto.createHash('md5').update(expectedMessage).digest('hex');

console.log('Step 3 - Verification:');
console.log('Expected message: "' + expectedMessage + '"');
console.log('Generated MD5: ' + generatedHash);
console.log('Mission MD5:   ' + MISSION_MD5);

if (generatedHash === MISSION_MD5) {
  console.log('✅ MD5 hash matches expected message');
} else {
  console.log('❌ MD5 hash does not match');
}

console.log('');
console.log('Step 4 - Complete Flow:');
console.log('1. Main Dashboard → missionexploit → shows MD5 hash');
console.log('2. Player decodes MD5 → gets "The real mission is at /For Real"');
console.log('3. Player navigates to /For Real → finds Base64 fragments');
console.log('4. Player decodes Base64 → gets final flag');
console.log('');
console.log('🎯 Key Features:');
console.log('✓ MD5 hash contains real hint (not just decoy)');
console.log('✓ Players must decode MD5 to progress');
console.log('✓ No direct hints in missionexploit output');
console.log('✓ Requires external MD5 decoder or knowledge');
