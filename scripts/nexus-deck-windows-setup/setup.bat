@echo off
:: NEXUS DECK Windows Companion Installer
:: This installs the NEXUS DECK agent on Windows so your phone can control your PC.

title NEXUS DECK Setup
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   NEXUS DECK - Windows Companion Setup
echo ============================================
echo.

:: Set install directory
set "INSTALLDIR=%PROGRAMFILES%\Nexus Deck"

echo [1/7] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo   Node.js not found. Installing Node.js...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements 2>nul
    if %errorlevel% neq 0 (
        echo   WARNING: Could not install Node.js automatically.
        echo   Please install Node.js from https://nodejs.org and run this setup again.
        pause
        exit /b 1
    )
    echo   Node.js installed.
) else (
    echo   Node.js found.
)

echo [2/7] Installing application files...
if not exist "%INSTALLDIR%" mkdir "%INSTALLDIR%"
xcopy /E /I /Q "%~dp0agent\*" "%INSTALLDIR%\agent\"
xcopy /E /I /Q "%~dp0tray\*" "%INSTALLDIR%\tray\"
if %errorlevel% neq 0 (
    echo   ERROR: Failed to copy files.
    pause
    exit /b 1
)
echo   Files installed to %INSTALLDIR%

echo [3/7] Creating data folder...
if not exist "%INSTALLDIR%\agent-data" mkdir "%INSTALLDIR%\agent-data"
echo   Data folder created.

echo [4/7] Creating shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "\$WshShell = New-Object -comObject WScript.Shell;" ^
  "\$Shortcut = \$WshShell.CreateShortcut('%USERPROFILE%\Desktop\NEXUS DECK Agent.lnk');" ^
  "\$Shortcut.TargetPath = '%INSTALLDIR%\tray\tray-controller.js';" ^
  "\$Shortcut.WorkingDirectory = '%INSTALLDIR%';" ^
  "\$Shortcut.Description = 'NEXUS DECK PC Control Agent';" ^
  "\$Shortcut.Save();" ^
  "\$Shortcut2 = \$WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\NEXUS DECK Agent.lnk');" ^
  "\$Shortcut2.TargetPath = '%INSTALLDIR%\tray\tray-controller.js';" ^
  "\$Shortcut2.WorkingDirectory = '%INSTALLDIR%';" ^
  "\$Shortcut2.Description = 'NEXUS DECK PC Control Agent';" ^
  "\$Shortcut2.Save();"
echo   Shortcuts created on Desktop and Start Menu.

echo [5/7] Configuring Windows startup...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "NexusDeckAgent" /d """%INSTALLDIR%\tray\tray-controller.js""" /f >nul 2>&1
if %errorlevel% eq 0 (
    echo   NEXUS DECK will start automatically with Windows.
) else (
    echo   WARNING: Could not configure startup. You can start it manually from the Desktop shortcut.
)

echo [6/7] Creating uninstall shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "\$WshShell = New-Object -comObject WScript.Shell;" ^
  "\$Shortcut = \$WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Uninstall NEXUS DECK.lnk');" ^
  "\$Shortcut.TargetPath = 'msiexec.exe';" ^
  "\$Shortcut.Arguments = '/x {product-guid}';" ^
  "\$Shortcut.Description = 'Uninstall NEXUS DECK';" ^
  "\$Shortcut.Save();"
echo   Uninstall shortcut created.

echo [7/7] Starting NEXUS DECK Agent...
start "" "%INSTALLDIR%\tray\tray-controller.js"
echo   Agent started. Look for the green NEXUS DECK icon in your system tray.

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo The NEXUS DECK companion is now running on your PC.
echo Look for the green icon near your system clock.
echo.
echo Next steps on your phone:
echo  1. Make sure your phone is on the same Wi-Fi as this PC
echo  2. Open the NEXUS DECK app on your phone
echo  3. The app will guide you through pairing
echo.
pause