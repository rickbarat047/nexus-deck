import { verifyDeviceToken } from "../pairing/pairing.js";
export async function authMiddleware(req, reply) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        reply.code(401).send({ success: false, data: null, error: { code: "INVALID_TOKEN", message: "missing token" }, timestamp: new Date().toISOString() });
        return;
    }
    const token = header.slice(7);
    const device = verifyDeviceToken(token);
    if (!device) {
        reply.code(401).send({ success: false, data: null, error: { code: "INVALID_TOKEN", message: "invalid or revoked token" }, timestamp: new Date().toISOString() });
        return;
    }
    req.deviceId = device.id;
    req.deviceName = device.deviceName;
}
//# sourceMappingURL=auth.js.map