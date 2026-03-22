# Pharmacy Frontend

## Learning Runtime Source Of Truth
- [CourseLearningArea](src/features/learning/components/CourseLearningArea.tsx)
- [VimeoLessonPlayer](src/features/learning/components/VimeoLessonPlayer.tsx)
- [InteractivePromptModal](src/features/learning/components/InteractivePromptModal.tsx)
- [learningApi](src/features/learning/services/learningApi.ts)
- [interactive-runtime](src/features/learning/interactive-runtime.ts)

## Verification
Run the Node-based repo-level learning/video verification runner from the workspace root:

```bash
node scripts/verify-interactive-regression.mjs
```

Thin wrappers still exist at `scripts\verify-interactive-regression.cmd` and `scripts\verify-interactive-regression.ps1`, but `verify-interactive-regression.mjs` is the source of truth.

This runs, in order:
1. `Pharmarcy-api` tests
2. `Pharmarcy-api` production build
3. `pharmacy-frontend` unit/component tests
4. `pharmacy-frontend` Playwright interactive tests
5. `pharmacy-frontend` production build
6. `backoffice` production build

## Smoke Checklist
Use the real-data smoke checklist at [`../scripts/interactive-learning-smoke-checklist.md`](../scripts/interactive-learning-smoke-checklist.md) before larger releases that touch learner video, Vimeo playback, or interactive questions.
