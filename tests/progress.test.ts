import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createEmptyProgress, loadProgress, saveProgress } from '../src/main/progressStore'

const dirs: string[] = []

async function progressPath(): Promise<string> {
  const dir = await mkdtemp(join(process.cwd(), '.test-progress-'))
  dirs.push(dir)
  return join(dir, 'data', 'progress.json')
}

afterEach(async () => {
  for (const dir of dirs.splice(0)) {
    if (!dir.startsWith(join(process.cwd(), '.test-progress-'))) throw new Error('Unsafe test cleanup path')
    await rm(dir, { recursive: true, force: true })
  }
})

describe('local progress', () => {
  it('starts empty only when no file exists', async () => {
    expect(await loadProgress(await progressPath())).toEqual(createEmptyProgress())
  })

  it('saves and reloads progress without leaving a temporary file', async () => {
    const path = await progressPath()
    const progress = { ...createEmptyProgress(), completedDates: ['2026-11-01'] }
    await saveProgress(path, progress)
    expect(await loadProgress(path)).toEqual(progress)
    await expect(readFile(`${path}.tmp`, 'utf8')).rejects.toThrow()
  })

  it('recovers a corrupt primary file from its last valid backup', async () => {
    const path = await progressPath()
    const oldProgress = { ...createEmptyProgress(), completedDates: ['2026-10-31'] }
    await saveProgress(path, oldProgress)
    await saveProgress(path, { ...oldProgress, completedDates: ['2026-10-31', '2026-11-01'] })
    await writeFile(path, '{broken', 'utf8')
    expect(await loadProgress(path)).toEqual(oldProgress)
  })

  it('refuses an unsupported schema instead of resetting history', async () => {
    const path = await progressPath()
    await saveProgress(path, createEmptyProgress())
    await writeFile(path, JSON.stringify({ ...createEmptyProgress(), schemaVersion: 2 }), 'utf8')
    await expect(loadProgress(path)).rejects.toThrow('Unsupported progress version')
  })

  it('refuses corrupt history when no backup exists', async () => {
    const path = await progressPath()
    await saveProgress(path, createEmptyProgress())
    await writeFile(path, '{broken', 'utf8')
    await expect(loadProgress(path)).rejects.toThrow('Progress file is damaged')
  })
})
