@echo off
title Uninstall NEXUS DECK
setlocal enabledelayedexpansion

set "INSTALLDIR=%PROGRAMFILES%\Nexus Deck"

echo Uninstalling NEXUS DECK...

:: Remove startup registry entry
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "NexusDeckAgent" /f >nul 2>&1

:: Stop the agent
taskkill /f /im node.exe >nul 2>&1

:: Remove shortcuts
del "%USERPROFILE%\Desktop\NEXUS DECK Agent.lnk" 2>nul
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\NEXUS DECK Agent.lnk" 2>nul
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Uninstall NEXUS DECK.lnk" 2>nul

:: Remove program files
if exist "%INSTALLDIR%" rmdir /s /q "%INSTALLDIR%"

echo.
echo NEXUS DECK has been uninstalled.
echo.
pause