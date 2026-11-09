@echo off
title Stop NEXUS DECK Agent
taskkill /f /im node.exe 2>nul
echo NEXUS DECK Agent stopped.
timeout 2