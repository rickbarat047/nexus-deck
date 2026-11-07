import type { FastifyInstance } from "fastify";
import { WebSocket } from "ws";
import { verifyDeviceToken } from "../pairing/pairing.js";
import { getAction } from "../actions/registry.js";
import { collectMetrics } from "../monitoring/monitoring.js";
import { logger } from "../logging/logger.js";
import { WS_EVENTS } from "@nexus-deck/shared";

interface ClientState {
  ws: WebSocket;
  deviceId: string | null;
  authenticated: boolean;
  metricsInterval: NodeJS.Timeout | null;
  metricsIntervalMs: number;
}

const clients = new Set<ClientState>();

function send(ws: WebSocket, type: string, payload?: unknown, requestId?: string) {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type, payload, requestId, timestamp: new Date().toISOString() }));
}

export async function websocketRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/ws", { websocket: true }, (connection: any, req: any) => {
    const ws = connection?.socket ?? connection;
    const state: ClientState = { ws, deviceId: null, authenticated: false, metricsInterval: null, metricsIntervalMs: 2000 };
    clients.add(state);

    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 30000);

    ws.on("message", async (raw: any) => {
      let msg: any;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(ws, "error", { code: "INVALID_REQUEST", message: "invalid json" });
        return;
      }
      const type = msg.type;
      const requestId = msg.requestId;

      if (type === WS_EVENTS.CLIENT_AUTHENTICATE) {
        const token = msg.payload?.token;
        const device = token ? verifyDeviceToken(token) : null;
        if (!device) {
          send(ws, "error", { code: "INVALID_TOKEN", message: "invalid token" }, requestId);
          ws.close();
          return;
        }
        state.deviceId = device.id;
        state.authenticated = true;
        send(ws, WS_EVENTS.CONNECTION_READY, { deviceId: device.id, deviceName: device.deviceName }, requestId);
        return;
      }

      if (!state.authenticated) {
        send(ws, "error", { code: "INVALID_TOKEN", message: "not authenticated" }, requestId);
        return;
      }

      if (type === WS_EVENTS.PING) {
        send(ws, "pong", {}, requestId);
        return;
      }

      if (type === WS_EVENTS.APP_LAUNCH) {
        const appId = msg.payload?.applicationId;
        const action = getAction("launch_application");
        if (!action) return;
        send(ws, WS_EVENTS.ACTION_STARTED, { actionId: "launch_application" }, requestId);
        const v = action.validate({ applicationId: appId });
        if (!v.ok) {
          send(ws, WS_EVENTS.ACTION_FAILED, { actionId: "launch_application", message: v.reason }, requestId);
          return;
        }
        const r = await action.execute(v.data ?? { applicationId: appId }, { deviceId: state.deviceId, confirmed: true });
        if (r.status === "success") send(ws, WS_EVENTS.ACTION_COMPLETED, { actionId: "launch_application", ...r }, requestId);
        else send(ws, WS_EVENTS.ACTION_FAILED, { actionId: "launch_application", ...r }, requestId);
        return;
      }

      if (type === WS_EVENTS.ACTION_EXECUTE) {
        const actionId = msg.payload?.actionId;
        const executionId = msg.payload?.executionId;
        const params = msg.payload?.params;
        const confirmed = !!msg.payload?.confirmed;
        const action = getAction(actionId);
        if (!action) {
          send(ws, WS_EVENTS.ACTION_FAILED, { actionId, message: "unknown action" }, requestId);
          return;
        }
        const v = action.validate(params ?? {});
        if (!v.ok) {
          send(ws, WS_EVENTS.ACTION_FAILED, { actionId, message: v.reason }, requestId);
          return;
        }
        if (action.requiresConfirmation && !confirmed) {
          send(ws, WS_EVENTS.ACTION_FAILED, { actionId, message: "confirmation required", status: "denied" }, requestId);
          return;
        }
        send(ws, WS_EVENTS.ACTION_STARTED, { actionId, executionId }, requestId);
        const r = await action.execute(v.data ?? params ?? {}, { deviceId: state.deviceId, confirmed });
        if (r.status === "success") send(ws, WS_EVENTS.ACTION_COMPLETED, { actionId, executionId, ...r }, requestId);
        else send(ws, WS_EVENTS.ACTION_FAILED, { actionId, executionId, ...r }, requestId);
        return;
      }

      if (type === WS_EVENTS.METRICS_SUBSCRIBE) {
        const intervalMs = Math.max(1000, Math.min(60000, msg.payload?.intervalMs ?? 2000));
        state.metricsIntervalMs = intervalMs;
        if (state.metricsInterval) clearInterval(state.metricsInterval);
        const tick = async () => {
          try {
            const m = await collectMetrics();
            send(ws, WS_EVENTS.METRICS_UPDATE, m);
          } catch (e) {
            logger.warn("metrics tick failed", { error: String(e) });
          }
        };
        tick();
        state.metricsInterval = setInterval(tick, intervalMs);
        return;
      }

      if (type === WS_EVENTS.METRICS_UNSUBSCRIBE) {
        if (state.metricsInterval) {
          clearInterval(state.metricsInterval);
          state.metricsInterval = null;
        }
        return;
      }
    });

    ws.on("close", () => {
      clearInterval(heartbeat);
      if (state.metricsInterval) clearInterval(state.metricsInterval);
      clients.delete(state);
    });

    ws.on("error", (e: any) => logger.warn("ws error", { error: String(e) }));
  });
}