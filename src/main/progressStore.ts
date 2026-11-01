import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Progress } from '../shared/types'

export function createEmptyProgress(): Progress {
  return { schemaVersion: 1, answers: {}, review: {}, completedDates: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseProgress(text: string): Progress {
  const value: unknown = JSON.parse(text)
  if (!isRecord(value)) throw new Error('Progress file is damaged')
  if (value.schemaVersion !== 1) throw new Error('Unsupported progress version')
  if (!isRecord(value.answers) || !isRecord(value.review) || !Array.isArray(value.completedDates) ||
      !value.completedDates.every((date) => typeof date === 'string')) {
    throw new Error('Progress file is damaged')
  }
  return value as unknown as Progress
}

export async function loadProgress(path: string): Promise<Progress> {
  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return createEmptyProgress()
    throw error
  }

  try {
    return parseProgress(raw)
  } catch (error) {
    if ((error as Error).message === 'Unsupported progress version') throw error
    try {
      const backup = await readFile(`${path}.bak`, 'utf8')
      const progress = parseProgress(backup)
      await writeFile(`${path}.tmp`, backup, 'utf8')
      await rename(`${path}.tmp`, path)
      return progress
    } catch {
      throw new Error('Progress file is damaged')
    }
  }
}

export async function saveProgress(path: string, progress: Progress): Promise<void> {
  parseProgress(JSON.stringify(progress))
  await mkdir(dirname(path), { recursive: true })

  try {
    const previous = await readFile(path, 'utf8')
    parseProgress(previous)
    await copyFile(path, `${path}.bak`)
  } catch (error) {
    if ((error as Error).message === 'Unsupported progress version') throw error
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT' && (error as Error).message !== 'Progress file is damaged') throw error
  }

  await writeFile(`${path}.tmp`, JSON.stringify(progress), 'utf8')
  await rename(`${path}.tmp`, path)
}
