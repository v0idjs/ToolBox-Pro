import { contextBridge, ipcRenderer } from 'electron'

const api = {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFile: (defaultName?: string, content?: string) =>
    ipcRenderer.invoke('dialog:saveFile', defaultName, content),
  saveFileBinary: (
    defaultName?: string,
    base64?: string,
    filters?: { name: string; extensions: string[] }[]
  ) => ipcRenderer.invoke('dialog:saveFileBinary', defaultName, base64, filters),
  listFiles: (dirPath: string) => ipcRenderer.invoke('fs:listFiles', dirPath),
  batchRename: (renames: { from: string; to: string }[]) => ipcRenderer.invoke('fs:batchRename', renames),
  computeFileHash: (filePath: string, algorithm: string) => ipcRenderer.invoke('fs:computeFileHash', filePath, algorithm),
  getFolderSize: (dirPath: string) => ipcRenderer.invoke('fs:getFolderSize', dirPath),
  findDuplicates: (dirPath: string) => ipcRenderer.invoke('fs:findDuplicates', dirPath)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  console.warn('contextIsolation is disabled — this is a security risk')
}
