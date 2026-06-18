export interface FileAPI {
  openFile: () => Promise<{ filePath: string; content: string; name: string; size: number } | null>
  openFiles: () => Promise<{ filePath: string; content: string; name: string }[]>
  openFolder: () => Promise<string | null>
  saveFile: (defaultName?: string, content?: string) => Promise<string | null>
  listFiles: (dirPath: string) => Promise<{ name: string; path: string; size: number }[]>
  batchRename: (renames: { from: string; to: string }[]) => Promise<{ success: number; failed: number; errors: string[] }>
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
