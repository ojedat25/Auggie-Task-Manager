# Auggie Task Manager — Frontend

Electron + React. Folder structure guide.

## Layout

- **`src/main/`** — Electron main process (windows, menus). `main.ts` entry, `menu.ts` for native app menu.
- **`src/preload/`** — Bridge to renderer via `contextBridge` → `window.electronAPI`.
- **`src/renderer/`** — React app (see below).
- **`src/config.ts`** — Shared config (e.g. `API_BASE`).

## Renderer structure

```
renderer/
├── api/          → axiosInstance, endpoints (Django routes)
├── assets/       → images, icons
├── components/
│   ├── common/   → Button, Input, Spinner, etc.
│   └── layout/   → Sidebar, Navbar, TitleBar
├── features/     → One folder per feature (auth, tasks, settings)
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       └── services/   → API calls for this feature
├── hooks/        → Global shared hooks
├── store/        → Global state (Zustand/Redux)
├── types/        → TS types (task, user, global.d.ts)
├── utils/        → Formatters, validators, helpers
├── App.tsx       → Root + routing/providers
├── renderer.tsx  → Entry
└── index.css     → Global styles
```

**Rule:** Feature-specific code → `features/<name>/`. Shared UI → `components/`.

## Where to put things

- Sign-up / login → `features/auth/`
- Tasks (list, form, filters) → `features/tasks/`
- Settings / profile → `features/settings/`
- Shared UI (buttons, inputs, layout) → `components/common/`, `components/layout/`
- New API route → `api/endpoints.ts` + feature’s `services/`
- New shared hook → `hooks/` or feature’s `hooks/`
- Global state → `store/`
- New type → `types/`

## Scripts

`npm run start` | `npm run lint` | `npm run format`
