import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createStudyServer } from './server'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const staticRoot = join(root, 'dist', 'app')
const progressPath = process.env.JAPANESE_STUDY_DATA_PATH ?? join(
  process.env.APPDATA ?? join(homedir(), '.local', 'share'),
  '일본어공부', 'study-data', 'progress.json'
)
const port = 3217
const url = `http://127.0.0.1:${port}`

function openBrowser(): void {
  if (process.argv.includes('--no-open')) return
  const command = process.platform === 'win32' ? 'cmd.exe' : process.platform === 'darwin' ? 'open' : 'xdg-open'
  const args = process.platform === 'win32' ? ['/d', '/c', 'start', '', url] : [url]
  const child = spawn(command, args, { windowsHide: true, stdio: 'ignore' })
  child.on('error', () => console.log(`브라우저에서 ${url} 을 열어 주세요.`))
  child.unref()
}

try {
  if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('Node.js 24 LTS 이상이 필요합니다: https://nodejs.org/')
  await access(join(staticRoot, 'index.html'))
  const server = createStudyServer({ staticRoot, progressPath })
  server.on('error', async (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      const existing = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(1500) }).then(res => res.json()).catch(() => null)
      if (existing?.app === 'japanese-study' && existing.version === '0.2.0') {
        console.log(`이미 실행 중입니다: ${url}`)
        openBrowser()
        return
      }
      console.error(`${port} 포트를 다른 프로그램 또는 이전 버전이 사용 중입니다. 해당 시작 창을 닫고 다시 실행해 주세요.`)
    } else console.error('실행하지 못했습니다:', error.message)
    process.exitCode = 1
  })
  server.listen(port, '127.0.0.1', () => {
    console.log(`일본어공부 0.2.0 · ${url}\n이 창을 열어 두세요. 종료: Ctrl+C\n학습 기록: ${progressPath}`)
    openBrowser()
  })
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => { server.closeIdleConnections(); server.close(() => process.exit(0)) })
  }
} catch (error) {
  console.error('실행하지 못했습니다. 배포 ZIP 전체를 압축 해제했는지 확인해 주세요. 개발 중이면 npm run build를 먼저 실행하세요.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
