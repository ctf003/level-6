const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// Handle /For Real route
app.get('/For Real', (req, res) => {
  res.sendFile(path.join(__dirname, 'For Real', 'index.html'));
});

// Simple logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}`);
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`Hash S3 6 Multi-Level CTF Server running on port ${PORT}`);
  console.log(`Main puzzle: http://localhost:${PORT}`);
  console.log(`For Real page: http://localhost:${PORT}/For Real`);
  console.log('');
  console.log('Multi-level solve flow:');
  console.log('Level 1 - Main Dashboard:');
  console.log('1. help (see available commands)');
  console.log('2. missionexploit (shows MD5 hash)');
  console.log('3. Decode MD5 hash → "The real mission is at /For Real"');
  console.log('');
  console.log('Level 2 - Navigate to /For Real:');
  console.log('1. Go to /For Real dashboard');
  console.log('2. missionexploit (hint about inspecting page source)');
  console.log('');
  console.log('Level 3 - Inspect /For Real Page Source:');
  console.log('1. Right-click → View Page Source');
  console.log('2. Find Base64 fragments in hidden-data divs');
  console.log('3. Fragments: flag, flag{s3_, building, _unity}');
  console.log('4. Decode: flag + flag{s3_ + building + _unity} = flag');
});

module.exports = app;
