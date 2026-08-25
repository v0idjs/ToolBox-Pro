export interface FileAPI {
  openFile: () => Promise<{ filePath: string; content: string; name: string; size: number } | null>
  openFiles: () => Promise<{ filePath: string; content: string; name: string }[]>
  openFolder: () => Promise<string | null>
  saveFile: (defaultName?: string, content?: string) => Promise<string | null>
  saveFileBinary: (
    defaultName?: string,
    base64?: string,
    filters?: { name: string; extensions: string[] }[]
  ) => Promise<string | null>
  listFiles: (dirPath: string) => Promise<{ name: string; path: string; size: number }[]>
  batchRename: (renames: { from: string; to: string }[]) => Promise<{ success: number; failed: number; errors: string[] }>
  computeFileHash: (filePath: string, algorithm: string) => Promise<{ hash: string; size: number }>
  getFolderSize: (dirPath: string) => Promise<
    { name: string; path: string; size: number; isDirectory: boolean }[]
  >
  findDuplicates: (dirPath: string) => Promise<string[][]>
}

declare global {
  interface Window {
    api: FileAPI
  }
}
