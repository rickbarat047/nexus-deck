declare module "ws" {
  export class WebSocket {
    static OPEN: number;
    readyState: number;
    send(data: string): void;
    ping(): void;
    close(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  }
}