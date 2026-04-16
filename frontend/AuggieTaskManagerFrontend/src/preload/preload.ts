import { contextBridge } from 'electron';
import path from 'path';

contextBridge.exposeInMainWorld('electronAPI', {
  getPath: (fileName: string) => path.join(__dirname, fileName),
});
