/**
 * NEXUS DECK Tray Controller
 * Shows a system tray icon and manages the agent process.
 * Run with: node tray-controller.js
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const { default: Systray } = require('systray');

const AGENT_SCRIPT = path.join(__dirname, '..', 'dist', 'index.js');
let agentProcess = null;
let isDevMode = process.env.NEXUS_DEV_MODE === 'true';

function startAgent() {
  if (agentProcess && !agentProcess.killed) return;

  agentProcess = spawn(process.execPath, [AGENT_SCRIPT], {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  agentProcess.stdout.on('data', (data) => {
    // Log to file if needed
  });

  agentProcess.stderr.on('data', (data) => {
    // Log errors
  });

  agentProcess.on('close', (code) => {
    agentProcess = null;
  });
}

function stopAgent() {
  if (agentProcess && !agentProcess.killed) {
    try {
      agentProcess.kill();
    } catch (e) {
      // ignore
    }
    agentProcess = null;
  }
}

const systray = new Systray({
  icon: path.join(__dirname, 'icon.png'),
  title: 'NEXUS DECK Agent',
  tooltip: 'NEXUS DECK - PC Control Agent',
});

systray.on('click', () => {
  if (agentProcess && !agentProcess.killed) {
    stopAgent();
    systray.setTitle('NEXUS DECK Agent (Stopped)');
  } else {
    startAgent();
    systray.setTitle('NEXUS DECK Agent (Running)');
  }
});

systray.on('quit', () => {
  stopAgent();
  systray.destroy();
  process.exit(0);
});

// Start agent on launch
startAgent();
systray.setTitle('NEXUS DECK Agent (Running)');

console.log('NEXUS DECK Tray Controller started');