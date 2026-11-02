import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

it('sends the loaded revision and advances it only after a successful save', async () => {
  const progress = { schemaVersion: 1, answers: {}, review: {}, completedDates: [] }
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(progress), { headers: { etag: '"one"' } }))
    .mockResolvedValueOnce(new Response(null, { status: 204, headers: { etag: '"two"' } }))
    .mockResolvedValueOnce(new Response(null, { status: 204, headers: { etag: '"three"' } }))
  vi.stubGlobal('fetch', fetch)
  const { studyApi } = await import('../src/app/api')
  expect(await studyApi.loadProgress()).toEqual(progress)
  await studyApi.saveProgress(progress as never)
  await studyApi.saveProgress(progress as never)
  expect(fetch.mock.calls[1][1].headers['If-Match']).toBe('"one"')
  expect(fetch.mock.calls[2][1].headers['If-Match']).toBe('"two"')
})

it('explains a conflicting tab save without accepting the stale write', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 409 })))
  const { studyApi } = await import('../src/app/api')
  await expect(studyApi.saveProgress({} as never)).rejects.toThrow('새로고침')
})

it('reports storage and load failures rather than treating them as empty progress', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 500 })))
  const { studyApi } = await import('../src/app/api')
  await expect(studyApi.loadProgress()).rejects.toThrow('불러오지 못했습니다')
  await expect(studyApi.saveProgress({} as never)).rejects.toThrow('시작 창')
})
