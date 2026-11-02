import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { loadProgress, parseProgress, saveProgress } from './progressStore'
import type { Progress } from '../shared/types'

const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2', '.png': 'image/png', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8'
}

function reply(response: ServerResponse, status: number, text = ''): void {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' })
  response.end(text)
}

async function readBody(request: IncomingMessage): Promise<string | null> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 2 * 1024 * 1024) return null
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

function revision(progress: unknown): string {
  return `"${createHash('sha256').update(JSON.stringify(progress)).digest('hex')}"`
}

export function createStudyServer({ staticRoot, progressPath }: { staticRoot: string; progressPath: string }) {
  // Serialize reads/recovery and writes: every request sees the latest file revision.
  let pending: Promise<void> = Promise.resolve()
  return createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Cross-Origin-Resource-Policy', 'same-origin')
    response.setHeader('Content-Security-Policy', "frame-ancestors 'none'; object-src 'none'; base-uri 'none'")
    const origin = `http://127.0.0.1:${request.socket.localPort}`
    if (request.headers.host !== new URL(origin).host ||
        (request.headers.origin && request.headers.origin !== origin) ||
        request.headers['sec-fetch-site'] === 'cross-site') {
      reply(response, 403, 'Local requests only')
      return
    }
    try {
      const pathname = new URL(request.url ?? '/', origin).pathname
      if (pathname === '/api/health' && request.method === 'GET') {
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ app: 'japanese-study', version: '0.2.0' }))
        return
      }
      if (pathname === '/api/progress') {
        if (!['GET', 'PUT'].includes(request.method ?? '')) { reply(response, 405); return }
        if (request.method === 'PUT' && request.headers['content-type'] !== 'application/json') { reply(response, 415); return }
        if (request.method === 'PUT' && !request.headers['if-match']) { reply(response, 428); return }
        const body = request.method === 'PUT' ? await readBody(request) : ''
        if (body === null) { reply(response, 413); return }
        let next: Progress | undefined
        if (request.method === 'PUT') {
          try { next = parseProgress(body) }
          catch { reply(response, 400, 'Invalid progress'); return }
        }
        const operation = pending.then(async () => {
          const current = await loadProgress(progressPath)
          if (next) {
            if (request.headers['if-match'] !== revision(current)) { reply(response, 409, 'Progress changed in another tab'); return }
            await saveProgress(progressPath, next)
            response.setHeader('ETag', revision(next))
            reply(response, 204)
          } else {
            response.setHeader('ETag', revision(current))
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.end(JSON.stringify(current))
          }
        })
        pending = operation.catch(() => {})
        await operation
        return
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') { reply(response, 405); return }
      const root = resolve(staticRoot)
      const decoded = decodeURIComponent(pathname)
      // The production public tree contains no private files. Keep JSON/data paths
      // unservable even if a caller accidentally puts its progress under that tree.
      if (decoded.includes('..') || decoded.includes('\\') || decoded.includes('\0')) { reply(response, 404); return }
      const file = resolve(root, decoded === '/' ? 'index.html' : `.${decoded}`)
      if (!file.startsWith(root + sep) || !mime[extname(file)] || extname(file) === '.json') { reply(response, 404); return }
      const info = await stat(file).catch(() => null)
      if (!info?.isFile()) { reply(response, 404); return }
      response.writeHead(200, { 'Content-Type': mime[extname(file)], 'Content-Length': info.size })
      if (request.method === 'HEAD') response.end()
      else createReadStream(file).on('error', () => response.destroy()).pipe(response)
    } catch (error) {
      console.error('Local request failed:', error instanceof Error ? error.message : 'Unknown error')
      if (!response.headersSent) reply(response, 500, 'Local storage unavailable')
      else response.destroy()
    }
  })
}
