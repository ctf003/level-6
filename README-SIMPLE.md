# Hash S3 6 - Simplified CTF Puzzle

A simple but effective CTF puzzle that uses **MD5 as decoy** and **Base64 fragments as the real solution**.

## 🎯 **How It Works**

1. **MD5 Decoy**: The `missionexploit` command shows a visible MD5 hash that is pure bait
2. **Base64 Fragments**: The real flag is hidden in Base64-encoded fragments in HTML meta tags
3. **VM Ordering**: A JavaScript micro-VM computes the correct fragment order
4. **Simple Assembly**: Fragments are assembled and Base64-decoded to reveal the flag

## 🚀 **Quick Start**

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## 🧩 **Solve Flow**

### Step 1: See the Decoy
```
missionexploit
```
**Output**: Shows MD5 hash `e0466f61b8c0aaf5aa20bfa6919cda77` (this is bait!)

### Step 2: Find Fragment Order
```
compute
```
**Output**: `computed order: [3,1,0,2]`

### Step 3: Assemble Fragments
```
assemble
```
**Output**: Shows combined Base64 string

### Step 4: Decode to Get Flag
```
decode
```
**Output**: `🎉 FLAG FOUND! 🎉 flag`

## 🔍 **Technical Details**

### Fragments in HTML
```html
<!-- MARKER: S3_HASH_FRAGMENTS -->
<meta name="frag-0" content="e2hhc2hfczNf" />  <!-- "{hash_s3_" -->
<meta name="frag-1" content="YnVpbGRpbmc=" />  <!-- "building" -->
<meta name="frag-2" content="X3VuaXR5fQ==" />  <!-- "_unity}" -->
<meta name="frag-3" content="ZmxhZw==" />      <!-- "flag" -->
```

### Correct Order: [3,1,0,2]
- Position 0: frag-3 → `ZmxhZw==` → "flag"
- Position 1: frag-1 → `YnVpbGRpbmc=` → "building"  
- Position 2: frag-0 → `e2hhc2hfczNf` → "{hash_s3_"
- Position 3: frag-2 → `X3VuaXR5fQ==` → "_unity}"

**Combined**: `flag` + `building` + `{hash_s3_` + `_unity}` = `flagbuilding{hash_s3_unity}`

**Base64 Decoded**: `flag`

## 🎨 **Features**

- **Decoy MD5**: Visible hash that leads nowhere
- **Hidden Fragments**: Real solution in Base64 fragments
- **VM Ordering**: JavaScript micro-VM computes correct order
- **Simple Assembly**: Just combine and decode Base64
- **Progressive Hints**: Three levels of hints available

## 🧪 **Testing**

```bash
node test-simple.js
```

This will show you the complete fragment assembly and decoding process.

## 🎯 **Key Insights**

1. **Ignore the MD5** - it's pure bait
2. **Look for fragments** - they're in the HTML meta tags
3. **Order matters** - use the VM to get correct order
4. **Simple decode** - just Base64 decode the assembled string

## 🚫 **What NOT to Do**

- Don't try to crack the MD5 hash
- Don't submit the MD5 as the flag
- Don't ignore the fragment ordering

## ✅ **Success Criteria**

- MD5 is visible but useless (decoy)
- Real flag is in Base64 fragments
- VM computes correct order [3,1,0,2]
- Simple assembly and decode reveals flag
- No complex crypto or server-side verification needed

This simplified version focuses on the core concept: **MD5 as decoy, Base64 as solution**.
