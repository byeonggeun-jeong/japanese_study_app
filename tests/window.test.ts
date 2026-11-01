import { describe, expect, it } from 'vitest'
import { getWindowWebPreferences } from '../src/main/windowOptions'

describe('Electron window security', () => {
  it('keeps renderer code isolated from Node', () => {
    expect(getWindowWebPreferences('preload.js')).toMatchObject({
      preload: 'preload.js',
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    })
  })
})
