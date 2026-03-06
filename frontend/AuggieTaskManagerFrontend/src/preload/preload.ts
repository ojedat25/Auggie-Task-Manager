import { contextBridge } from 'electron';

/**
 * Preload script: bridge between Main process and Renderer.
 * Expose only safe APIs via contextBridge (never expose Node/Electron directly).
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Add IPC or safe APIs here when needed, e.g.:
  // invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
});
