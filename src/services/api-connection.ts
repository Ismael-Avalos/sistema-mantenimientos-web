type ApiConnectionListener = (connected: boolean) => void;

let connected = false;
const listeners = new Set<ApiConnectionListener>();

export function getApiConnectionStatus(): boolean {
  return connected;
}

export function publishApiConnectionStatus(nextStatus: boolean): void {
  connected = nextStatus;
  listeners.forEach((listener) => listener(connected));
}

export function subscribeToApiConnection(listener: ApiConnectionListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
