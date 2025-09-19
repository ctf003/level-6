// Simple test for Hash S3 6 CTF puzzle

// Test fragments (from HTML meta tags)
const fragments = [
  'e2hhc2hfczNf',  // frag-0: "flag{s3_"
  'YnVpbGRpbmc=',  // frag-1: "building"
  'X3VuaXR5fQ==',  // frag-2: "_unity}"
  'ZmxhZw=='       // frag-3: "flag"
];

// Expected order: [3,1,0,2]
const order = [3, 1, 0, 2];

console.log('🧪 Testing Hash S3 6 Simple Puzzle\n');

// Test fragment decoding
console.log('Individual fragments:');
fragments.forEach((frag, i) => {
  try {
    const decoded = Buffer.from(frag, 'base64').toString('utf8');
    console.log(`frag-${i}: ${frag} → "${decoded}"`);
  } catch (e) {
    console.log(`frag-${i}: ${frag} → ERROR`);
  }
});

console.log('\nAssembling in correct order [3,1,0,2]:');
const orderedFragments = order.map(i => fragments[i]);
console.log('Ordered fragments:', orderedFragments);

const combined = orderedFragments.join('');
console.log('Combined Base64:', combined);

try {
  const flag = Buffer.from(combined, 'base64').toString('utf8');
  console.log('\n🎉 FLAG REVEALED:', flag);
  console.log('✅ Puzzle solved successfully!');
} catch (e) {
  console.log('\n❌ Failed to decode combined Base64:', e.message);
}

console.log('\n📊 Expected solve flow:');
console.log('1. missionexploit → shows decoy MD5');
console.log('2. compute → gets order [3,1,0,2]');
console.log('3. assemble → combines fragments');
console.log('4. decode → reveals flag');
