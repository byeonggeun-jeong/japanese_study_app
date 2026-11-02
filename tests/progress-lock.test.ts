import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { createEmptyProgress, loadProgress, saveProgress } from '../src/server/progressStore'
vi.mock('node:fs/promises', { spy: true })
const dirs: string[] = []
afterEach(async () => {
  for (const directory of dirs.splice(0)) {
    if (!directory.startsWith(join(process.cwd(), '.test-progress-lock-'))) throw new Error('Unsafe cleanup')
    await rm(directory, { recursive: true, force: true })
  }
})
it.each(['save', 'recover'])('retries a transient Windows rename lock during %s without losing history', async (operation) => {
  const directory = await mkdtemp(join(process.cwd(), '.test-progress-lock-'))
  dirs.push(directory)
  const path = join(directory, 'progress.json')
  const progress = { ...createEmptyProgress(), completedDates: ['2026-11-01'] }
  await saveProgress(path, progress)
  if (operation === 'recover') {
    await saveProgress(path, progress)
    await writeFile(path, '{broken', 'utf8')
  }
  vi.mocked(rename).mockRejectedValueOnce(Object.assign(new Error('file temporarily locked'), { code: 'EPERM' }))
  if (operation === 'save') await saveProgress(path, progress)
  else expect(await loadProgress(path)).toEqual(progress)
  expect(JSON.parse(await readFile(path, 'utf8'))).toEqual(progress)
})
