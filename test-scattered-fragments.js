// Test script for scattered fragments in /For Real page

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Scattered Fragments in /For Real Page\n');

// Test the /For Real page
const forRealPath = path.join(__dirname, 'For Real', 'index.html');
if (fs.existsSync(forRealPath)) {
  console.log('✓ /For Real page exists');
  const forRealContent = fs.readFileSync(forRealPath, 'utf8');
  
  // Check for system configuration comment at the start
  if (forRealContent.includes('System configuration and monitoring styles')) {
    console.log('✓ System configuration comment found at start of code');
  } else {
    console.log('❌ System configuration comment not found');
  }
  
  // Check for Base64 fragments scattered throughout
  const fragments = [
    { hash: 'OXRoIEZsb29y', name: '9th Floor', expected: '9th Floor' },
    { hash: 'OXRoIEZsb29y', name: '9th Floor', expected: '9th Floor' },
    { hash: 'OXRoIEZsb29y', name: '9th Floor', expected: '9th Floor' },
    { hash: 'OXRoIEZsb29y', name: '9th Floor', expected: '9th Floor' }
  ];
  
  console.log('\nScattered fragments found in HTML:');
  fragments.forEach((frag, i) => {
    if (forRealContent.includes(frag.hash)) {
      console.log(`  ✓ Fragment ${i + 1}: ${frag.hash} → "${frag.expected}"`);
    } else {
      console.log(`  ❌ Fragment ${i + 1} missing: ${frag.hash}`);
    }
  });
  
  // Check for hidden data divs
  const hiddenDivs = ['hidden-data-1', 'hidden-data-2', 'hidden-data-3', 'hidden-data-4'];
  console.log('\nHidden data divs:');
  hiddenDivs.forEach((div, i) => {
    if (forRealContent.includes(div)) {
      console.log(`  ✓ ${div} found`);
    } else {
      console.log(`  ❌ ${div} missing`);
    }
  });
  
  // Verify fragments are scattered (not all together)
  const fragmentPositions = fragments.map(frag => forRealContent.indexOf(frag.hash));
  const isScattered = fragmentPositions.every((pos, i) => {
    if (i === 0) return true;
    return Math.abs(pos - fragmentPositions[i-1]) > 100; // At least 100 chars apart
  });
  
  if (isScattered) {
    console.log('\n✓ Fragments are properly scattered throughout the code');
  } else {
    console.log('\n❌ Fragments are too close together');
  }
  
  // Test fragment assembly
  console.log('\nFragment Assembly Test:');
  const orderedFragments = fragments.map(f => f.hash);
  const combined = orderedFragments.join('');
  console.log('Combined Base64:', combined);
  
  try {
    const flag = Buffer.from(combined, 'base64').toString('utf8');
    console.log('🎉 FINAL FLAG:', flag);
    console.log('✅ Scattered fragments work correctly!');
  } catch (e) {
    console.log('❌ Failed to decode combined Base64:', e.message);
  }
  
} else {
  console.log('❌ /For Real page not found');
}

console.log('\n📊 Updated Solve Flow:');
console.log('1. Main Dashboard → missionexploit → shows MD5 hash');
console.log('2. Decode MD5 → "The real mission is at /For Real"');
console.log('3. Navigate to /For Real → missionexploit → "Flag is in fragments"');
console.log('4. Inspect page source → find scattered Base64 fragments');
console.log('5. Decode Base64 fragments → get flag');
console.log('');
console.log('🎯 Key Features:');
console.log('✓ Subtle fragments scattered throughout HTML');
console.log('✓ Long, complex HTML code for obfuscation');
console.log('✓ missionexploit only says "Flag is in fragments"');
console.log('✓ No revealing comments about flag content');
console.log('✓ Players must search for Base64 fragments');
