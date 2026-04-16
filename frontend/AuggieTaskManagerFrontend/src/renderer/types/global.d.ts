/**
 * Extend Window for APIs exposed via preload contextBridge.
 */
export interface ElectronAPI {
  /** Reserved for preload-exposed IPC. */
  invoke?: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
