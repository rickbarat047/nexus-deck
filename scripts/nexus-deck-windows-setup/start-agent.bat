@echo off
title NEXUS DECK Agent
setlocal enabledelayedexpansion

set "INSTALLDIR=%PROGRAMFILES%\Nexus Deck"

:: Set dev mode for local testing (remove for production HTTPS)
set NEXUS_DEV_MODE=true

:: Start the tray controller
cd /d "%INSTALLDIR%"
start "" node tray\tray-controller.js

echo NEXUS DECK Agent is starting in the system tray...
echo Look for the green NEXUS DECK icon near your clock.
timeout 3