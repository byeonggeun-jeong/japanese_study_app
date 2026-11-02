@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 24 LTS is required. Install it from https://nodejs.org/
  pause
  exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<24)process.exit(1)"
if errorlevel 1 (
  echo Please update Node.js to version 24 LTS or newer: https://nodejs.org/
  pause
  exit /b 1
)
node dist/server/index.js %*
if errorlevel 1 pause
