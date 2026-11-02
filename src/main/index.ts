import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { getWindowWebPreferences, isAllowedExternalUrl } from './windowOptions'
import { loadProgress, saveProgress } from './progressStore'

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 850,
    minHeight: 620,
    autoHideMenuBar: true,
    backgroundColor: '#FBF9F8',
    title: '일본어공부',
    webPreferences: getWindowWebPreferences(join(__dirname, '../preload/index.js'))
  })

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event) => event.preventDefault())

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0]
    if (!window) return
    if (window.isMinimized()) window.restore()
    window.show()
    window.focus()
  })
  app.whenReady().then(() => {
    const progressPath = join(app.getPath('userData'), 'study-data', 'progress.json')
    ipcMain.handle('progress:load', () => loadProgress(progressPath))
    ipcMain.handle('progress:save', (_event, progress) => saveProgress(progressPath, progress))
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => app.quit())
}
