export function ok<T>(data: T) {
  return { success: true, data, error: null, timestamp: new Date().toISOString() };
}
export function fail(code: string, message: string) {
  return { success: false, data: null, error: { code, message }, timestamp: new Date().toISOString() };
}