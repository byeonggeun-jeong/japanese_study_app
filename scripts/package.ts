import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve, join, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const { version } = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const staging = resolve(root, 'dist/package')
if (!staging.startsWith(resolve(root, 'dist') + sep)) throw new Error('Unsafe package path')
await rm(staging, { recursive: true, force: true })
const name = `JapaneseStudy-${version}`
const target = join(staging, name)
await mkdir(join(target, 'dist'), { recursive: true })
for (const directory of ['app', 'server']) await cp(join(root, 'dist', directory), join(target, 'dist', directory), { recursive: true })
for (const file of ['시작.cmd', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) await cp(join(root, file), join(target, file))
await cp(join(root, 'licenses'), join(target, 'licenses'), { recursive: true })
await mkdir(join(target, 'docs'), { recursive: true })
for (const file of ['local-web-app.md', 'content-coverage.md']) await cp(join(root, 'docs', file), join(target, 'docs', file))
await cp(join(root, 'docs/archive/electron'), join(target, 'docs/archive/electron'), { recursive: true })
await mkdir(join(target, 'content'))
await cp(join(root, 'src/content/vocabulary/lexicon.json'), join(target, 'content/lexicon.json'))
await writeFile(join(target, 'package.json'), JSON.stringify({ name: 'japanese-study', version, type: 'module', private: true, license: 'MIT' }, null, 2))
await writeFile(join(target, 'build-info.json'), JSON.stringify({ version, commit: process.env.GITHUB_SHA ?? 'local', runtime: 'Node.js >=24', app: 'http://127.0.0.1:3217' }, null, 2))

if (process.platform !== 'win32') throw new Error('Create the Windows ZIP on Windows (or use the Windows CI artifact).')
const archive = join(root, 'dist', `${name}-LocalWeb.zip`)
await rm(archive, { force: true })
const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', "$ErrorActionPreference = 'Stop'; Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory($env:JAPANESE_PACKAGE_SOURCE, $env:JAPANESE_PACKAGE_ARCHIVE, [System.IO.Compression.CompressionLevel]::Optimal, $true)"], {
  stdio: 'inherit', windowsHide: true,
  env: { ...process.env, JAPANESE_PACKAGE_SOURCE: target, JAPANESE_PACKAGE_ARCHIVE: archive }
})
if (result.error) throw result.error
if (result.status !== 0) throw new Error('ZIP packaging failed')
console.log(`Created ${archive}`)
