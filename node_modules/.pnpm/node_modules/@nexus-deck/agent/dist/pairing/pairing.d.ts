export interface PairingCodeRecord {
    code: string;
    expiresAt: string;
}
export declare function createPairingCode(): PairingCodeRecord;
export declare function validatePairingCode(code: string): boolean;
export declare function consumePairingCode(code: string): void;
export declare function issueDeviceToken(deviceName: string, code: string): {
    deviceId: string;
    accessToken: string;
} | null;
export declare function verifyDeviceToken(token: string): {
    id: string;
    deviceName: string;
} | null;
export declare function revokeDevice(id: string): boolean;
export declare function listDevices(): Array<{
    id: string;
    device_name: string;
    created_at: string;
    last_seen: string | null;
    revoked_at: string | null;
}>;
//# sourceMappingURL=pairing.d.ts.map