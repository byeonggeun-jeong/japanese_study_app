import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { getWindowWebPreferences } from './windowOptions'

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 850,
    minHeight: 620,
    backgroundColor: '#FBF9F8',
    title: '일본어공부',
    webPreferences: getWindowWebPreferences(join(__dirname, '../preload/index.js'))
  })

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event) => event.preventDefault())

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => app.quit())
