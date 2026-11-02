# Local web app implementation plan

Execution: inline, with executing-plans. The user requested implementation,
structure cleanup, README update and GitHub push together.

Goal: replace unsigned Electron executables with a local Node.js web application,
preserving the existing curriculum, UI and per-Windows-user progress files.

Architecture: React/Vite UI in src/app; learning/content/shared modules unchanged;
built-in Node HTTP server in src/server, with the existing atomic progress store.
Default origin is http://127.0.0.1:3217. Use official Node.js 24 LTS, not a custom EXE.
Progress stays at %APPDATA%/일본어공부/study-data/progress.json. Browser storage is
not the source of truth. Two browser tabs use revision checks to prevent lost saves.

- [x] Add failing real HTTP tests for old-record loading, persistent save/restart,
  invalid payload rejection, stale revisions, cross-origin/Host rejection and static boundaries.
- [x] Move renderer to app, reuse progressStore under server, replace Electron bridge
  with fetch API. Remove obsolete Electron main/preload/window configuration and tests.
- [x] Build UI and server, create a ZIP with Windows launcher, licenses and usage guide.
  Launcher checks Node >=24 and starts the loopback server/default browser.
- [x] Replace Windows EXE CI with local-web ZIP CI. Archive signing-only documents;
  write current architecture, migration/backup and launch instructions in README.
- [x] Verify typecheck, all tests, content identity, production package and actual browser
  flow against scratch progress. Check real existing progress hashes before/after read-only launch.
- [x] Commit/push to existing public main and verify GitHub Actions succeeds.

No SignPath submission, security-setting changes, paid service or unrelated UI redesign.
