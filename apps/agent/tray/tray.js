const { app, Tray, Menu, nativeImage, shell } = require('electron');
// We'll use a lightweight approach - spawn the agent and manage tray
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// Since electron is heavy, we'll use a simple approach:
// Create a hidden window-free tray using a small HTML/JS approach
// Or use the systray package

module.exports = { spawn, path, fs };