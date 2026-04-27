import { contextBridge } from 'electron';

/**
 * Preload runs in an isolated, sandboxed context: no __dirname / path.join.
 * Expose only APIs the renderer needs; extend via ipcRenderer + allowlist later.
 */
contextBridge.exposeInMainWorld('electronAPI', {});
