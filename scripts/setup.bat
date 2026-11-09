@echo off
:: NEXUS DECK Windows Installer
:: Run this once to install the Windows companion agent

title NEXUS DECK Setup
echo.
echo ========================================
echo   NEXUS DECK - Windows Companion Setup
echo ========================================
echo.

:: Check for Node.js
echo [1/6] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Installing Node.js LTS...
    winget install OpenJS.NodeJS.LTS 2>nul
    if %errorlevel% neq 0 (
        echo ERROR: Could not install Node.js automatically.
        echo Please install Node.js from https://nodejs.org and run this setup again.
        pause
        exit /b 1
    )
) else (
    echo Node.js found: 
    node --version
)

:: Check for pnpm
echo [2/6] Checking pnpm...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing pnpm...
    npm install -g pnpm@10
)

:: Install dependencies
echo [3/6] Installing dependencies...
cd /d "%~dp0.."
pnpm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)

:: Build shared package
echo [4/6] Building shared package...
pnpm --filter @nexus-deck/shared build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build shared package.
    pause
    exit /b 1
)

:: Build agent
echo [5/6] Building Windows agent...
pnpm --filter @nexus-deck/agent build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build agent.
    pause
    exit /b 1
)

:: Create shortcuts
echo [6/6] Creating shortcuts...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\NEXUS DECK Agent.lnk'); $Shortcut.TargetPath = '%CD%\scripts\start-agent.bat'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.Save(); $Shortcut2 = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\NEXUS DECK Agent.lnk'); $Shortcut2.TargetPath = '%CD%\scripts\start-agent.bat'; $Shortcut2.WorkingDirectory = '%CD%'; $Shortcut2.Save()"

echo.
echo ========================================
echo   Setup complete!
echo ========================================
echo.
echo Double-click "NEXUS DECK Agent" on your desktop to start.
echo The agent will run in the system tray.
echo.
pause