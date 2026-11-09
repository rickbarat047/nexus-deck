@echo off
title NEXUS DECK Agent
cd /d "%~dp0.."

:: Set dev mode for local HTTP testing (remove for production HTTPS)
set NEXUS_DEV_MODE=true

:: Start the tray controller
start "" node apps\agent\tray\tray-controller.js

echo NEXUS DECK Agent is starting in the system tray...
echo Look for the green NEXUS DECK icon near your clock.
timeout 3