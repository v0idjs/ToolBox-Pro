import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { readFile, writeFile, readdir, stat, rename, unlink, mkdir } from 'fs/promises'
import { createHash } from 'crypto'

function isPathSafe(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase()
  const blocked = ['/etc/', '/proc/', '/sys/', '/dev/', 'c:/windows/system32']
  return !blocked.some((p) => normalized.startsWith(p))
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#090E1A',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const isDev = !app.isPackaged

  const loadContent = () => {
    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).catch(() => {
        setTimeout(loadContent, 1000)
      })
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  loadContent()

  if (isDev) {
    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      if (errorCode === -102 || errorCode === -106) {
        setTimeout(loadContent, 2000)
      }
    })
  }
}

// IPC Handlers for file operations
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  const filePath = result.filePaths[0]
  const content = await readFile(filePath, 'utf-8')
  const fileStat = await stat(filePath)
  return { filePath, content, name: filePath.split(/[/\\]/).pop() || '', size: fileStat.size }
})

ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections']
  })
  if (result.canceled || result.filePaths.length === 0) return []
  const files = await Promise.all(
    result.filePaths.map(async (filePath) => {
      const content = await readFile(filePath, 'utf-8')
      return { filePath, content, name: filePath.split(/[/\\]/).pop() || '' }
    })
  )
  return files
})

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

ipcMain.handle('dialog:saveFile', async (_event, defaultName?: string, content?: string) => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultName || 'output.txt'
  })
  if (result.canceled || !result.filePath) return null
  if (content !== undefined) {
    await writeFile(result.filePath, content, 'utf-8')
  }
  return result.filePath
})

ipcMain.handle('fs:getFolderSize', async (_event, dirPath: string) => {
  const results: { name: string; path: string; size: number; isDirectory: boolean }[] = []

  async function scanDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      try {
        const s = await stat(fullPath)
        results.push({
          name: entry.name,
          path: fullPath,
          size: s.size,
          isDirectory: entry.isDirectory()
        })
        if (entry.isDirectory()) {
          await scanDir(fullPath)
        }
      } catch {
        // skip inaccessible files
      }
    }
  }

  await scanDir(dirPath)
  return results
})

ipcMain.handle('fs:findDuplicates', async (_event, dirPath: string) => {
  const filesByHash = new Map<string, string[]>()

  async function scanDir(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      try {
        const s = await stat(fullPath)
        if (entry.isDirectory()) {
          await scanDir(fullPath)
        } else if (s.isFile() && s.size > 0) {
          const content = await readFile(fullPath)
          const hash = createHash('md5').update(content).digest('hex')
          const existing = filesByHash.get(hash) || []
          existing.push(fullPath)
          filesByHash.set(hash, existing)
        }
      } catch {
        // skip inaccessible files
      }
    }
  }

  await scanDir(dirPath)

  const duplicates: string[][] = []
  for (const paths of filesByHash.values()) {
    if (paths.length > 1) {
      duplicates.push(paths)
    }
  }
  return duplicates
})

app.whenReady().then(() => {
  app.setAppUserModelId('com.toolbox.pro')
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
