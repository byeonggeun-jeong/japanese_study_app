import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import type { Progress } from '../shared/types'

export function createEmptyProgress(): Progress {
  return { schemaVersion: 1, answers: {}, review: {}, completedDates: [] }
}

async function replaceProgress(temporary: string, path: string): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try { await rename(temporary, path); return }
    catch (error) {
      // Windows can briefly lock the destination after a read or virus scan.
      if (attempt >= 4 || !['EPERM', 'EBUSY'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error
      await delay(25 * 2 ** attempt)
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function date(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function timestamp(value: unknown): boolean {
  return typeof value === 'string' && date(value.slice(0, 10)) && Number.isFinite(Date.parse(value))
}

export function parseProgress(text: string): Progress {
  const value: unknown = JSON.parse(text)
  if (!isRecord(value)) throw new Error('Progress file is damaged')
  if (value.schemaVersion !== 1) throw new Error('Unsupported progress version')
  if (!isRecord(value.answers) || !isRecord(value.review) || !Array.isArray(value.completedDates) ||
      !value.completedDates.every(date) || new Set(value.completedDates).size !== value.completedDates.length ||
      !Object.values(value.answers).every((answer) => isRecord(answer) && count(answer.correct) && count(answer.incorrect) && timestamp(answer.lastAnsweredAt)) ||
      !Object.values(value.review).every((review) => isRecord(review) && date(review.dueDate) && count(review.intervalDays) && review.intervalDays > 0 && count(review.successes))) {
    throw new Error('Progress file is damaged')
  }
  if (value.placement !== undefined) {
    const placement = value.placement
    if (!isRecord(placement) || !isRecord(placement.starts) || !Object.values(placement.starts).every(nonempty) || !timestamp(placement.completedAt)) {
      throw new Error('Progress file is damaged')
    }
  }
  if (value.activeSet !== undefined) {
    const set = value.activeSet
    if (!isRecord(set) || !nonempty(set.id) || !['daily', 'free'].includes(String(set.source)) ||
        !Array.isArray(set.itemIds) || set.itemIds.length === 0 || !set.itemIds.every(nonempty) ||
        new Set(set.itemIds).size !== set.itemIds.length || !count(set.currentIndex) || set.currentIndex > set.itemIds.length ||
        (set.chapter !== undefined && !['kana', 'grammar', 'vocabulary', 'sentences'].includes(String(set.chapter))) ||
        (set.range !== undefined && !['all', 'hiragana', 'katakana', 'N5', 'N4'].includes(String(set.range)))) {
      throw new Error('Progress file is damaged')
    }
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
      await replaceProgress(`${path}.tmp`, path)
      return progress
    } catch (recoveryError) {
      throw new Error('Progress file is damaged', { cause: recoveryError })
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
  await replaceProgress(`${path}.tmp`, path)
}
