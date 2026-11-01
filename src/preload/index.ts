import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('studyApp', {
  loadProgress: () => ipcRenderer.invoke('progress:load'),
  saveProgress: (progress: unknown) => ipcRenderer.invoke('progress:save', progress)
})
