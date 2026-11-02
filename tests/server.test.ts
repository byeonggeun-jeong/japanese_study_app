import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { request, type Server } from 'node:http'
import { afterEach, expect, it } from 'vitest'
import { createStudyServer } from '../src/server/server'
import { createEmptyProgress, saveProgress } from '../src/server/progressStore'

const directories: string[] = []
const servers: Server[] = []
afterEach(async () => {
  for (const server of servers.splice(0)) {
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
  for (const dir of directories.splice(0)) {
    if (!dir.startsWith(join(process.cwd(), '.test-progress-web-'))) throw new Error('Unsafe cleanup')
    await rm(dir, { recursive: true, force: true })
  }
})

async function fixture() {
  const dir = await mkdtemp(join(process.cwd(), '.test-progress-web-'))
  directories.push(dir)
  await writeFile(join(dir, 'index.html'), '<h1>Study</h1>')
  const progressPath = join(dir, 'private', 'progress.json')
  const start = async () => {
    const server = createStudyServer({ staticRoot: dir, progressPath })
    servers.push(server)
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address() as { port: number }
    return `http://127.0.0.1:${address.port}`
  }
  return { dir, progressPath, start }
}

it('reads existing desktop progress and saves through a server restart', async () => {
  const f = await fixture()
  const old = { ...createEmptyProgress(), completedDates: ['2026-11-01'] }
  await saveProgress(f.progressPath, old)
  const before = await readFile(f.progressPath, 'utf8')
  const url = await f.start()
  const loaded = await fetch(`${url}/api/progress`)
  expect(await loaded.json()).toEqual(old)
  expect(await readFile(f.progressPath, 'utf8')).toBe(before)
  const next = { ...old, completedDates: [...old.completedDates, '2026-11-02'] }
  const saved = await fetch(`${url}/api/progress`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'If-Match': loaded.headers.get('etag')! }, body: JSON.stringify(next) })
  expect(saved.status).toBe(204)
  expect(saved.headers.get('etag')).not.toBe(loaded.headers.get('etag'))
  expect(await (await fetch(`${await f.start()}/api/progress`)).json()).toEqual(next)
  expect(JSON.parse(await readFile(`${f.progressPath}.bak`, 'utf8'))).toEqual(old)
})

it('rejects stale saves from a second tab and preserves the latest record', async () => {
  const f = await fixture(), url = await f.start()
  const initial = await fetch(`${url}/api/progress`)
  const headers = { 'Content-Type': 'application/json', 'If-Match': initial.headers.get('etag')! }
  const next = { ...createEmptyProgress(), completedDates: ['2026-11-02'] }
  const responses = await Promise.all([next, createEmptyProgress()].map((body) => fetch(`${url}/api/progress`, { method: 'PUT', headers, body: JSON.stringify(body) })))
  expect(responses.map(r => r.status).sort()).toEqual([204, 409])
  expect(await (await fetch(`${url}/api/progress`)).json()).toEqual(responses[0].status === 204 ? next : createEmptyProgress())
})

it('rejects invalid or unversioned writes without changing progress', async () => {
  const f = await fixture(), url = await f.start()
  const loaded = await fetch(`${url}/api/progress`)
  const headers = { 'Content-Type': 'application/json', 'If-Match': loaded.headers.get('etag')! }
  expect((await fetch(`${url}/api/progress`, { method: 'PUT', headers, body: '{broken' })).status).toBe(400)
  expect((await fetch(`${url}/api/progress`, { method: 'PUT', headers, body: JSON.stringify({ ...createEmptyProgress(), completedDates: ['tomorrow'] }) })).status).toBe(400)
  expect((await fetch(`${url}/api/progress`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(createEmptyProgress()) })).status).toBe(428)
  expect(await (await fetch(`${url}/api/progress`)).json()).toEqual(createEmptyProgress())
})

it('rejects foreign origins, DNS rebinding hosts and unsupported content types', async () => {
  const f = await fixture(), url = await f.start()
  expect((await fetch(`${url}/api/progress`, { headers: { Origin: 'https://untrusted.example' } })).status).toBe(403)
  const hostStatus = await new Promise<number | undefined>((resolve, reject) => {
    const req = request(`${url}/api/progress`, { headers: { Host: 'untrusted.example' } }, res => { res.resume(); resolve(res.statusCode) })
    req.on('error', reject).end()
  })
  expect(hostStatus).toBe(403)
  expect((await fetch(`${url}/api/progress`, { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status).toBe(403)
  expect((await fetch(`${url}/api/progress`, { method: 'PUT', body: '{}' })).status).toBe(415)
})

it('serves only built public assets and never exposes private progress or parent files', async () => {
  const f = await fixture(), url = await f.start()
  await saveProgress(f.progressPath, createEmptyProgress())
  expect(await (await fetch(url)).text()).toBe('<h1>Study</h1>')
  expect((await fetch(`${url}/private/progress.json`)).status).toBe(404)
  expect((await fetch(`${url}/%2e%2e%2fpackage.json`)).status).toBe(404)
  expect((await fetch(`${url}/missing.js`)).status).toBe(404)
  expect((await fetch(`${url}/api/progress`, { method: 'OPTIONS' })).status).toBe(405)
})

it('bounds request sizes and remains usable after rejecting oversized input', async () => {
  const f = await fixture(), url = await f.start()
  const loaded = await fetch(`${url}/api/progress`)
  expect((await fetch(`${url}/api/progress`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'If-Match': loaded.headers.get('etag')! }, body: 'x'.repeat(2 * 1024 * 1024 + 1) })).status).toBe(413)
  expect((await fetch(`${url}/api/progress`)).status).toBe(200)
})
