import { contextBridge, ipcRenderer } from 'electron'
import type { StudyAppAPI } from '../shared/types'

const api: StudyAppAPI = {
  loadProgress: () => ipcRenderer.invoke('progress:load'),
  saveProgress: (progress) => ipcRenderer.invoke('progress:save', progress)
}

contextBridge.exposeInMainWorld('studyApp', api)
