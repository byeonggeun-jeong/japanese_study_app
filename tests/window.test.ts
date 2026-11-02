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

it('only permits the project profile and repository in the external browser', async () => {
 const { isAllowedExternalUrl } = await import('../src/main/windowOptions')
 expect(isAllowedExternalUrl('https://github.com/byeonggeun-jeong')).toBe(true)
 expect(isAllowedExternalUrl('https://github.com/byeonggeun-jeong/japanese_study_app')).toBe(true)
 for(const url of ['javascript:alert(1)','file:///C:/Windows','https://github.com.evil.test/byeonggeun-jeong','https://github.com/another-user','https://github.com/byeonggeun-jeong?redirect=other']) expect(isAllowedExternalUrl(url),url).toBe(false)
})
