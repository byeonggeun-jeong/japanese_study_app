# Japanese Study Windows App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows Electron study app that gives two independent users a guided 10–20 minute daily path from kana through self-curated JLPT N4 preparation, with free practice and streak tracking.

**Architecture:** Electron runs a locally bundled React/TypeScript UI. Versioned static content supplies original lessons and exercises; a small local progress file under Electron `userData` stores placement, review state, and completed dates. Pure functions select the next set and calculate streaks; a narrow preload API handles persistence. Japanese speech uses available device voices without a paid service.

**Tech Stack:** Node 24, npm, Electron, electron-vite, React, TypeScript, Vitest, electron-builder (Windows NSIS target), CSS.

**Spec:** `docs/superpowers/specs/2026-11-01-japanese-study-windows-design.md`

## Global Constraints

- Windows Electron app; two installations store progress locally and independently.
- First release covers kana through a self-curated JLPT N4 preparation curriculum; N3 is later.
- Four chapters: kana repeat, grammar, vocabulary including kanji recognition, and sentences.
- First-run placement; guided daily set of 10–20 minutes plus free chapter practice.
- A completed guided or free set counts once per local calendar day toward the streak.
- Korean UI/explanations; Japanese learning text; white and muted red visual base.
- No paid runtime API, microphone scoring, handwriting, account, or sync.
- Content targets: at least 1,200 words, 100 grammar/expressions, 300 original sentences/dialogues, and 120 guided sets. These are self-curated goals, not official JLPT lists.
- Test installation and voice on the user's Windows PC; the friend's PC is outside the verification scope.

## Review Focus

- A corrupted or older progress file must not silently erase valid history; test recovery and version handling in Task 3.
- Near midnight or after multiple sets in one day, completed dates and streaks must stay correct; test in Task 3.
- A learner strong at sentences but weak at kana must get different chapter starts; test in Task 4.
- Missing Japanese device voice must leave text study usable; test in Task 8.
- Duplicate/changed content IDs or invalid answers must fail content validation before packaging; test in Tasks 2 and 9.

## File Map

- `package.json`, `electron.vite.config.ts`, `electron-builder.yml`, `tsconfig*.json`: app scripts, compilation, packaging.
- `src/main/index.ts`, `src/main/progressStore.ts`: secure window, progress IPC, atomic local file storage.
- `src/preload/index.ts`, `src/shared/types.ts`: narrow renderer API and shared data contracts.
- `src/content/{kana,grammar,vocabulary,sentences}/*.json`: authored, versioned learning material grouped by level/topic.
- `src/learning/{content,validateContent,placement,scheduler,review,streak}.ts`: pure content loading, validation, and study rules.
- `src/renderer/App.tsx`, `src/renderer/styles.css`, `src/renderer/components/*`: onboarding, home, practice, progress, and settings UI.
- `src/renderer/speech.ts`: free device speech synthesis and missing-voice state.
- `scripts/validate-content.ts`, `tests/*`: authoring checks and behavior tests.

---

### Task 1: Secure Electron Shell

**Files:** Create `package.json`, `electron.vite.config.ts`, `electron-builder.yml`, `tsconfig*.json`, `src/main/index.ts`, `src/preload/index.ts`, `src/renderer/index.html`, `src/renderer/main.tsx`, `.gitignore`.

**Interfaces:** Produces `window.studyApp` with only `loadProgress()` and `saveProgress(progress)`; later tasks add implementations without exposing raw IPC.

- [ ] **Step 1:** Initialize Git and add a minimal Electron + React + TypeScript shell with scripts `dev`, `typecheck`, `test`, `build`, `make`, `validate:content`.
- [ ] **Step 2:** Configure `contextIsolation: true`, `nodeIntegration: false`, a restrictive CSP, and a local renderer. Block unneeded navigation/new windows.
- [ ] **Step 3:** Run `npm run typecheck` and `npm run build`; both pass and the window opens with a placeholder screen.
- [ ] **Step 4:** Commit shell and configuration.

### Task 2: Content Contract and Validation

**Files:** Create `src/shared/types.ts`, `src/learning/content.ts`, `src/learning/validateContent.ts`, `scripts/validate-content.ts`, `tests/content.test.ts`, initial files under `src/content/*`.

**Interfaces:** `StudyItem { id, chapter, level, topicId, lessonId, kind, prompt, options?, answer, explanation, speechText? }`; `Lesson { id, level, topicId, estimatedMinutes, itemIds }`; `validateContent(items: StudyItem[], lessons: Lesson[]): ValidationIssue[]`; `loadContent(): { items: StudyItem[], lessons: Lesson[] }`.

- [ ] **Step 1:** Write tests rejecting duplicate IDs, missing answers, options without the answer, missing explanations, and unknown `kind`; test valid kana, vocabulary, grammar, and sentence samples.
- [ ] **Step 2:** Run `npm test -- tests/content.test.ts`; verify failures.
- [ ] **Step 3:** Implement only the schema and validation needed for those cases, plus a content loader.
- [ ] **Step 4:** Run focused tests and `npm run validate:content`; both pass.
- [ ] **Step 5:** Commit content contract.

### Task 3: Local Progress and Streaks

**Files:** Create `src/main/progressStore.ts`, `src/learning/streak.ts`, `tests/progress.test.ts`, `tests/streak.test.ts`; update `src/main/index.ts`, `src/preload/index.ts`, `src/shared/types.ts`.

**Interfaces:** `Progress { schemaVersion, placement?, answers, review, completedDates, activeSet? }`; `loadProgress(path): Promise<Progress>`; `saveProgress(path, progress): Promise<void>`; `completeStudyDate(progress, yyyyMmDd): Progress`; `getStreak(dates, today): { current, longest }`.

- [ ] **Step 1:** Test fresh file, atomic save/reload, corrupt file recovery with backup, unsupported schema version, repeated completion, midnight rollover, and a missed day.
- [ ] **Step 2:** Run focused tests; verify failures.
- [ ] **Step 3:** Implement validated JSON in an app-specific `userData` subfolder; write a temporary file then replace the old file. Expose only typed load/save IPC.
- [ ] **Step 4:** Run focused tests and typecheck; pass.
- [ ] **Step 5:** Commit progress behavior.

### Task 4: Placement

**Files:** Create `src/learning/placement.ts`, `tests/placement.test.ts`, `src/renderer/components/Placement.tsx`; update `src/shared/types.ts`.

**Interfaces:** `scorePlacement(answers: PlacementAnswer[]): PlacementResult`; chapter-specific start points feed Task 5. Placement questions are a tagged subset of content.

- [ ] **Step 1:** Test beginner answers, strong sentence/weak kana answers, incomplete placement, and repeat placement without deleting historical progress.
- [ ] **Step 2:** Run focused tests; verify failures.
- [ ] **Step 3:** Implement short staged diagnosis and its UI, showing recommended starts rather than a single total score.
- [ ] **Step 4:** Run focused tests and typecheck; pass.
- [ ] **Step 5:** Commit placement.

### Task 5: Daily Selection and Review

**Files:** Create `src/learning/review.ts`, `src/learning/scheduler.ts`, `tests/scheduler.test.ts`; update `src/shared/types.ts`.

**Interfaces:** `recordAnswer(progress, itemId, correct, now): Progress`; `buildDailySet(content, progress, today, seed): StudySet`; `buildFreeSet(content, chapter, seed): StudySet`. A `StudySet` has a stable ID, item IDs, and a completion state.

- [ ] **Step 1:** Test due-review priority, wrong-answer reappearance, fewer new items when reviews are heavy, chapter placement, deterministic seed, empty content, and a free-practice batch that can continue indefinitely.
- [ ] **Step 2:** Run focused tests; verify failures.
- [ ] **Step 3:** Implement rule-based selection with a target of 10–20 minutes; finishing any set calls `completeStudyDate` once.
- [ ] **Step 4:** Run focused tests and typecheck; pass.
- [ ] **Step 5:** Commit learning rules.

### Task 6: Practice Flow

**Files:** Create `src/renderer/components/{Practice,ChoiceQuestion,ArrangeQuestion,InputQuestion,Completion}.tsx`; update `src/renderer/App.tsx`, `src/renderer/styles.css`; create `tests/practice.test.tsx`.

**Interfaces:** Renders `StudySet` and `StudyItem`, records each answer through Task 5, persists after each answer through Task 3, resumes `activeSet` after restart.

- [ ] **Step 1:** Test answer/feedback/next flow, keyboard completion, no double-counted finish, and resume after reload.
- [ ] **Step 2:** Run focused UI tests; verify failures.
- [ ] **Step 3:** Implement four question presentations, Korean explanations, progress count, set completion, and repeat-forever continuation for kana.
- [ ] **Step 4:** Run focused UI tests and typecheck; pass.
- [ ] **Step 5:** Commit practice flow.

### Task 7: Home, Free Practice, Progress and Visual System

**Files:** Create `src/renderer/components/{Home,ChapterList,Progress,Settings}.tsx`; update `src/renderer/App.tsx`, `src/renderer/styles.css`; create `tests/navigation.test.tsx`.

**Interfaces:** Home starts/resumes Task 5's daily set; free chapter selection starts Task 5's free set; progress uses Task 3's dates and review state.

- [ ] **Step 1:** Test first-run placement routing, guided start/resume, free chapter routing, streak display, and predictable back navigation.
- [ ] **Step 2:** Run focused UI tests; verify failures.
- [ ] **Step 3:** Implement white/low-saturation-red tokens, readable Korean/Japanese type, responsive Windows window layout, visible focus, reduced motion, and progress/empty states.
- [ ] **Step 4:** Run focused UI tests, typecheck, and a keyboard walkthrough; pass.
- [ ] **Step 5:** Commit UI.

### Task 8: Cost-Free Japanese Speech

**Files:** Create `src/renderer/speech.ts`, `tests/speech.test.ts`; update `src/renderer/components/{Practice,Settings}.tsx`.

**Interfaces:** `getJapaneseVoice(): SpeechSynthesisVoice | null`; `speakJapanese(text): boolean`; only `speechText` items show a listen control.

- [ ] **Step 1:** Test Japanese voice present, absent voice, late `voiceschanged`, and cancel/replay behavior.
- [ ] **Step 2:** Run focused tests; verify failures.
- [ ] **Step 3:** Implement device speech synthesis and Korean free-voice setup guidance; keep text questions usable without voice.
- [ ] **Step 4:** Run focused tests and test on the user's PC; pass or document missing system voice.
- [ ] **Step 5:** Commit speech support.

### Task 9: Full Authored N4-Preparation Content

**Files:** Extend `src/content/{kana,grammar,vocabulary,sentences}/*.json`; create `docs/content-coverage.md`; update `scripts/validate-content.ts`, `tests/content.test.ts`.

**Interfaces:** All content conforms to Task 2's contract and retains stable IDs. Coverage document maps content topics to kana, N5, N4, reading, listening, and conversation goals.

- [ ] **Step 1:** Add tests for minimum inventory (1,200 words, 100 grammar/expressions, 300 original sentences/dialogues, 120 guided sets), unique IDs, no empty explanations, and all required topic categories.
- [ ] **Step 2:** Run tests; verify failures against the seed inventory.
- [ ] **Step 3:** Author content by topic in small reviewed batches. Validate Japanese readings, answer keys, distractors, and Korean explanations independently; update coverage document with each batch.
- [ ] **Step 4:** Run `npm run validate:content`, focused tests, and manual sample sessions across N5/N4; all pass.
- [ ] **Step 5:** Commit each reviewed content batch, then the final coverage map.

### Task 10: Installer and End-to-End Check

**Files:** Update `electron-builder.yml`, `package.json`, `README.md`; create `tests/app-smoke.test.ts` if automation is viable.

**Interfaces:** `npm run make` produces a Windows installer in `dist/` and the documented local progress path persists across relaunch.

- [ ] **Step 1:** Build a Windows NSIS installer and install on the available PC.
- [ ] **Step 2:** Walk through placement → daily set → streak → free set → relaunch → preserved progress; check missing-voice state and one voice-enabled case if available.
- [ ] **Step 3:** Run `npm run typecheck`, `npm test`, `npm run validate:content`, `npm run build`, `npm run make`; all pass.
- [ ] **Step 4:** Document installation, voice setup, local data path, backup, and the untested friend-PC limitation.
- [ ] **Step 5:** Commit final release artifacts/configuration (exclude generated installer binaries from Git).
