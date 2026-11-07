import { useConnectionStore } from "../stores/connectionStore";

let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;
let reconnectAttempts = 0;
let shouldReconnect = true;
let metricsSubscribed = false;
let metricsInterval = 2000;

const listeners = new Set<(msg: any) => void>();

export function onMessage(cb: (msg: any) => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(msg: any) {
  listeners.forEach((cb) => cb(msg));
}

export function connect() {
  const { agentAddress, accessToken } = useConnectionStore.getState();
  if (!agentAddress || !accessToken) return;
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  shouldReconnect = true;
  const url = agentAddress.replace(/^https/, "wss").replace(/^http/, "ws") + "/ws";
  useConnectionStore.getState().setStatus("connecting");
  let socket: WebSocket;
  try {
    socket = new WebSocket(url);
    ws = socket;
  } catch (e) {
    useConnectionStore.getState().setStatus("error");
    useConnectionStore.getState().setError(String(e));
    scheduleReconnect();
    return;
  }

  socket.onopen = () => {
    reconnectAttempts = 0;
    socket.send(JSON.stringify({ type: "client:authenticate", payload: { token: accessToken } }));
  };

  socket.onmessage = (ev) => {
    let msg: any;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (msg.type === "connection:ready") {
      useConnectionStore.getState().setStatus("connected");
      useConnectionStore.getState().setError(null);
      if (msg.payload?.deviceName) useConnectionStore.getState().setPcName(msg.payload.deviceName);
      // fetch system info
      fetchSystemInfo();
      if (metricsSubscribed) subscribeMetrics(metricsInterval);
    } else if (msg.type === "connection:status") {
      // noop
    } else if (msg.type === "metrics:update") {
      useConnectionStore.getState().setMetrics(msg.payload);
    } else if (msg.type === "pairing:revoked") {
      useConnectionStore.getState().clearCredentials();
      disconnect();
    }
    notify(msg);
  };

  socket.onclose = () => {
    useConnectionStore.getState().setStatus("disconnected");
    if (ws === socket) ws = null;
    if (shouldReconnect) scheduleReconnect();
  };

  socket.onerror = () => {
    useConnectionStore.getState().setStatus("error");
  };
}

function scheduleReconnect() {
  if (reconnectTimer) window.clearTimeout(reconnectTimer);
  const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts));
  reconnectAttempts++;
  reconnectTimer = window.setTimeout(() => connect(), delay);
}

export function disconnect() {
  shouldReconnect = false;
  if (ws) {
    ws.close();
    ws = null;
  }
}

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const { agentAddress, accessToken } = useConnectionStore.getState();
  if (!agentAddress) throw new Error("not connected");
  const url = agentAddress + path;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init?.headers as any) } });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message ?? "request failed");
  return json.data as T;
}

export function subscribeMetrics(intervalMs = 2000) {
  metricsSubscribed = true;
  metricsInterval = intervalMs;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "metrics:subscribe", payload: { intervalMs } }));
  }
}

export function unsubscribeMetrics() {
  metricsSubscribed = false;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "metrics:unsubscribe" }));
  }
}

export function sendAction(actionId: string, executionId: string, params?: any, confirmed?: boolean) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "action:execute", payload: { actionId, executionId, params, confirmed } }));
  }
}

export function sendLaunch(applicationId: string) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "app:launch", payload: { applicationId } }));
  }
}

async function fetchSystemInfo() {
  try {
    const info = await api("/api/v1/system/info");
    useConnectionStore.getState().setSystemInfo(info);
    useConnectionStore.getState().setPcName(info.hostname);
  } catch (e) {
    // ignore
  }
}