export interface FileAPI {
  openFile: () => Promise<{ filePath: string; content: string; name: string; size: number } | null>
  openFiles: () => Promise<{ filePath: string; content: string; name: string }[]>
  openFolder: () => Promise<string | null>
  saveFile: (defaultName?: string, content?: string) => Promise<string | null>
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
