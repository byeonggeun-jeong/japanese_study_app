import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createEmptyProgress, loadProgress, saveProgress } from '../src/server/progressStore'

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

  it.each([
    { answers: { q1: { correct: -1, incorrect: 0, lastAnsweredAt: '2026-11-01' } } },
    { review: { q1: { dueDate: 'tomorrow', intervalDays: 1, successes: 0 } } },
    { completedDates: ['2026-02-30'] },
    { completedDates: ['2026-11-01', '2026-11-01'] },
    { activeSet: { id: 'daily-1', source: 'daily', itemIds: ['q1'], currentIndex: 8 } },
    { placement: { starts: { kana: 42 }, completedAt: '2026-11-01' } }
  ])('recovers malformed nested progress from backup: %j', async (damage) => {
    const path = await progressPath()
    const baseline = { ...createEmptyProgress(), completedDates: ['2026-10-31'] }
    await saveProgress(path, baseline)
    await saveProgress(path, baseline)
    await writeFile(path, JSON.stringify({ ...baseline, ...damage }), 'utf8')
    expect(await loadProgress(path)).toEqual(baseline)
  })

  it('keeps two installations independent', async () => {
    const first = await progressPath()
    const second = await progressPath()
    await saveProgress(first, { ...createEmptyProgress(), completedDates: ['2026-11-01'] })
    await saveProgress(second, createEmptyProgress())
    expect((await loadProgress(first)).completedDates).toEqual(['2026-11-01'])
    expect((await loadProgress(second)).completedDates).toEqual([])
  })
})
