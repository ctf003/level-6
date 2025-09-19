// Test script for Hash S3 6 Multi-Level CTF puzzle

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Hash S3 6 Multi-Level CTF Puzzle\n');

// Test Level 1 - Main Dashboard
console.log('Level 1 - Main Dashboard:');
console.log('✓ Tricky UI with security panels and mission board');
console.log('✓ Commands: help, status, missions, missionexploit, hint, clear, whoami');
console.log('✓ missionexploit shows decoy MD5 + hint about /For Real');

// Test Level 2 - For Real Page
console.log('\nLevel 2 - /For Real Dashboard:');
const forRealPath = path.join(__dirname, 'For Real', 'index.html');
if (fs.existsSync(forRealPath)) {
  console.log('✓ /For Real page exists');
  const forRealContent = fs.readFileSync(forRealPath, 'utf8');
  
  // Check for Base64 fragments in the HTML
  const fragments = [
    'ZmxhZw==',      // flag
    'e2hhc2hfczNf',  // flag{s3_
    'YnVpbGRpbmc=',  // building
    'X3VuaXR5fQ=='   // _unity}
  ];
  
  console.log('✓ Base64 fragments found in HTML:');
  fragments.forEach((frag, i) => {
    if (forRealContent.includes(frag)) {
      console.log(`  - Fragment ${i + 1}: ${frag}`);
    } else {
      console.log(`  ❌ Fragment ${i + 1} missing: ${frag}`);
    }
  });
  
  // Check for hidden-data divs
  if (forRealContent.includes('hidden-data-1') && 
      forRealContent.includes('hidden-data-2') &&
      forRealContent.includes('hidden-data-3') &&
      forRealContent.includes('hidden-data-4')) {
    console.log('✓ Hidden data divs found');
  } else {
    console.log('❌ Missing hidden data divs');
  }
  
} else {
  console.log('❌ /For Real page not found');
}

// Test Level 3 - Fragment Assembly
console.log('\nLevel 3 - Fragment Assembly:');
const fragments = [
  'ZmxhZw==',      // "flag"
  'e2hhc2hfczNf',  // "flag{s3_"
  'YnVpbGRpbmc=',  // "building"
  'X3VuaXR5fQ=='   // "_unity}"
];

console.log('Individual fragments:');
fragments.forEach((frag, i) => {
  try {
    const decoded = Buffer.from(frag, 'base64').toString('utf8');
    console.log(`  Fragment ${i + 1}: ${frag} → "${decoded}"`);
  } catch (e) {
    console.log(`  Fragment ${i + 1}: ${frag} → ERROR`);
  }
});

console.log('\nAssembling in order [0,1,2,3]:');
const combined = fragments.join('');
console.log('Combined Base64:', combined);

try {
  const flag = Buffer.from(combined, 'base64').toString('utf8');
  console.log('\n🎉 FINAL FLAG REVEALED:', flag);
  console.log('✅ Multi-level puzzle solved successfully!');
} catch (e) {
  console.log('\n❌ Failed to decode combined Base64:', e.message);
}

console.log('\n📊 Complete Multi-Level Flow:');
console.log('1. Main Dashboard → missionexploit → hint about /For Real');
console.log('2. Navigate to /For Real → missionexploit → hint about page source');
console.log('3. Inspect page source → find Base64 fragments → decode → flag');
console.log('');
console.log('🎯 Key Features:');
console.log('✓ Tricky UI with security panels and mission boards');
console.log('✓ MD5 decoy on main dashboard');
console.log('✓ Multi-level navigation');
console.log('✓ Base64 fragments scattered in HTML code');
console.log('✓ Progressive hints at each level');
console.log('✓ No complex server-side crypto needed');
