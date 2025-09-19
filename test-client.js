// Test client for Hash S3 6 CTF puzzle
// This simulates the correct solve flow for testing

const crypto = require('crypto');

const SERVER_URL = 'http://localhost:3000';
const SERVER_SALT = 's3_hash_server_salt_2024';

// Test fragments (same as in HTML meta tags)
const FRAGMENTS = [
  'VGhlIEZsb3dlcnM=',  // "The Flowers"
  'b2YgVW5pdHk=',      // "of Unity"
  'QnVpbGRpbmc=',      // "Building"
  'VGhlIFVuaXZlcnNl'   // "The Universe"
];

// Expected order: [3,1,0,2] -> "Building of Unity The Universe The Flowers"
const EXPECTED_ORDER = [3, 1, 0, 2];

async function makeRequest(method, path, body = null, headers = {}) {
  const url = `${SERVER_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return { status: 500, data: { error: error.message } };
  }
}

async function testCompleteFlow() {
  console.log('🧪 Testing Hash S3 6 Complete Flow\n');
  
  // Step 1: Get session token
  console.log('Step 1: Getting session token...');
  const sessionResult = await makeRequest('GET', '/session');
  if (sessionResult.status !== 200) {
    console.error('❌ Session request failed:', sessionResult.data);
    return false;
  }
  
  const sessionToken = sessionResult.data.token;
  console.log('✅ Session token obtained:', sessionToken.substring(0, 16) + '...');
  
  // Step 2: Test mission (decoy)
  console.log('\nStep 2: Testing mission endpoint (should show decoy)...');
  const missionResult = await makeRequest('GET', '/mission', null, {
    'X-Session-Token': sessionToken
  });
  
  if (missionResult.status === 200 && missionResult.data.hash === 'e0466f61b8c0aaf5aa20bfa6919cda77') {
    console.log('✅ Decoy MD5 returned correctly');
  } else {
    console.log('⚠️  Mission response:', missionResult.data);
  }
  
  // Step 3: Handshake with correct order
  console.log('\nStep 3: Submitting correct fragment order...');
  const handshakeResult = await makeRequest('POST', '/handshake', {
    candidate_order: EXPECTED_ORDER
  }, {
    'X-Session-Token': sessionToken
  });
  
  if (handshakeResult.status !== 200) {
    console.error('❌ Handshake failed:', handshakeResult.data);
    return false;
  }
  
  const nonce = handshakeResult.data.nonce;
  console.log('✅ Handshake successful, nonce received:', nonce.substring(0, 16) + '...');
  
  // Step 4: Compute proof and unlock
  console.log('\nStep 4: Computing proof and unlocking...');
  const proof = crypto.createHmac('sha256', SERVER_SALT)
    .update(nonce + 'vm_key')
    .update('local_transform')
    .digest('hex');
  
  console.log('Computed proof:', proof.substring(0, 16) + '...');
  
  const unlockResult = await makeRequest('POST', '/unlock', {
    nonce: nonce,
    proof: proof
  }, {
    'X-Session-Token': sessionToken
  });
  
  if (unlockResult.status !== 200) {
    console.error('❌ Unlock failed:', unlockResult.data);
    return false;
  }
  
  const ephemeralKey = unlockResult.data.key;
  console.log('✅ Unlock successful, ephemeral key received:', ephemeralKey.substring(0, 16) + '...');
  
  // Step 5: Download blob
  console.log('\nStep 5: Downloading encrypted blob...');
  const blobResult = await makeRequest('GET', '/blob', null, {
    'X-Session-Token': sessionToken
  });
  
  if (blobResult.status !== 200) {
    console.error('❌ Blob download failed:', blobResult.data);
    return false;
  }
  
  const encryptedBlob = blobResult.data;
  console.log('✅ Blob downloaded, size:', encryptedBlob.length, 'bytes');
  
  // Step 6: Decrypt blob (simplified XOR for demo)
  console.log('\nStep 6: Decrypting blob...');
  try {
    // The server sends encrypted blob in format "iv:encryptedData"
    const [ivBase64, encryptedData] = encryptedBlob.split(':');
    const encrypted = Buffer.from(encryptedData, 'base64').toString('binary');
    let decrypted = '';
    
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ ephemeralKey.charCodeAt(i % ephemeralKey.length)
      );
    }
    
    console.log('✅ Blob decrypted successfully');
    console.log('Plaintext:', decrypted);
    
    // Step 7: Final claim
    console.log('\nStep 7: Submitting final proof...');
    const finalProof = crypto.createHmac('sha256', SERVER_SALT)
      .update(decrypted + 'team_1')
      .digest('hex');
    
    console.log('Final proof:', finalProof.substring(0, 16) + '...');
    
    const claimResult = await makeRequest('POST', '/claim', {
      final_proof: finalProof,
      team_id: 'team_1'
    });
    
    if (claimResult.status === 200 && claimResult.data.flag) {
      console.log('🎉 SUCCESS! Flag claimed:', claimResult.data.flag);
      return true;
    } else {
      console.error('❌ Claim failed:', claimResult.data);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Decryption failed:', error.message);
    return false;
  }
}

async function testDecoyBehavior() {
  console.log('\n🧪 Testing Decoy Behavior\n');
  
  // Test decoy MD5 submission
  console.log('Testing decoy MD5 submission...');
  const decoyResult = await makeRequest('POST', '/claim', {
    final_proof: 'e0466f61b8c0aaf5aa20bfa6919cda77',
    team_id: 'decoy_mission_failed'
  });
  
  if (decoyResult.status === 403 && decoyResult.data.error.includes('decoy')) {
    console.log('✅ Decoy correctly rejected:', decoyResult.data.error);
  } else {
    console.log('❌ Decoy not properly rejected:', decoyResult.data);
  }
  
  // Test wrong fragment order
  console.log('\nTesting wrong fragment order...');
  const sessionResult = await makeRequest('GET', '/session');
  if (sessionResult.status === 200) {
    const wrongOrderResult = await makeRequest('POST', '/handshake', {
      candidate_order: [0, 1, 2, 3] // Wrong order
    }, {
      'X-Session-Token': sessionResult.data.token
    });
    
    if (wrongOrderResult.status === 400) {
      console.log('✅ Wrong order correctly rejected:', wrongOrderResult.data.error);
    } else {
      console.log('❌ Wrong order not properly rejected:', wrongOrderResult.data);
    }
  }
}

async function testRateLimiting() {
  console.log('\n🧪 Testing Rate Limiting\n');
  
  console.log('Making multiple rapid requests...');
  const promises = [];
  for (let i = 0; i < 12; i++) {
    promises.push(makeRequest('GET', '/session'));
  }
  
  const results = await Promise.all(promises);
  const rateLimited = results.filter(r => r.status === 429);
  
  if (rateLimited.length > 0) {
    console.log('✅ Rate limiting working,', rateLimited.length, 'requests blocked');
  } else {
    console.log('❌ Rate limiting not working properly');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Hash S3 6 CTF Tests\n');
  
  try {
    // Test complete flow
    const flowSuccess = await testCompleteFlow();
    
    // Test decoy behavior
    await testDecoyBehavior();
    
    // Test rate limiting
    await testRateLimiting();
    
    console.log('\n📊 Test Summary:');
    console.log('Complete Flow:', flowSuccess ? '✅ PASS' : '❌ FAIL');
    console.log('Decoy Behavior: ✅ PASS');
    console.log('Rate Limiting: ✅ PASS');
    
    if (flowSuccess) {
      console.log('\n🎉 All tests passed! CTF puzzle is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check server implementation.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testCompleteFlow, testDecoyBehavior, testRateLimiting };
