export function ok(data) {
    return { success: true, data, error: null, timestamp: new Date().toISOString() };
}
export function fail(code, message) {
    return { success: false, data: null, error: { code, message }, timestamp: new Date().toISOString() };
}
//# sourceMappingURL=response.js.map