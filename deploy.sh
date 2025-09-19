#!/bin/bash

# Hash S3 6 CTF Deployment Script

echo "🚀 Deploying Hash S3 6 CTF Puzzle..."

# Check for required environment variables
if [ -z "$SERVER_SALT" ]; then
    echo "❌ SERVER_SALT environment variable not set"
    exit 1
fi

if [ -z "$MASTER_ENCRYPTION_KEY" ]; then
    echo "❌ MASTER_ENCRYPTION_KEY environment variable not set"
    exit 1
fi

if [ -z "$FLAG_TEAM_1" ]; then
    echo "❌ FLAG_TEAM_1 environment variable not set"
    exit 1
fi

# Validate no client-side flags
echo "🔍 Checking for client-side flags..."
if git grep -n "flag{" index.html script.js ordering-vm.js styles.css; then
    echo "❌ Client-side flag strings detected!"
    exit 1
fi
echo "✅ No client-side flag strings found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

echo "✅ All tests passed"

# Start server
echo "🎯 Starting server..."
npm start
