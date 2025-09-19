@echo off
REM Hash S3 6 CTF Deployment Script for Windows

echo 🚀 Deploying Hash S3 6 CTF Puzzle...

REM Check for required environment variables
if "%SERVER_SALT%"=="" (
    echo ❌ SERVER_SALT environment variable not set
    exit /b 1
)

if "%MASTER_ENCRYPTION_KEY%"=="" (
    echo ❌ MASTER_ENCRYPTION_KEY environment variable not set
    exit /b 1
)

if "%FLAG_TEAM_1%"=="" (
    echo ❌ FLAG_TEAM_1 environment variable not set
    exit /b 1
)

REM Validate no client-side flags
echo 🔍 Checking for client-side flags...
findstr /n "flag{" index.html script.js ordering-vm.js styles.css >nul 2>&1
if %errorlevel%==0 (
    echo ❌ Client-side flag strings detected!
    exit /b 1
)
echo ✅ No client-side flag strings found

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Run tests
echo 🧪 Running tests...
npm test

if %errorlevel% neq 0 (
    echo ❌ Tests failed!
    exit /b 1
)

echo ✅ All tests passed

REM Start server
echo 🎯 Starting server...
npm start
