import { projectLinks } from '../shared/links'

export function getWindowWebPreferences(preload: string) {
  return {
    preload,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true
  }
}

export function isAllowedExternalUrl(url: string): boolean {
  return Object.values(projectLinks).some(link => link === url)
}
