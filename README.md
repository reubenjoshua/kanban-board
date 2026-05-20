# Kanban Board

A polished, portfolio-ready kanban app built with React, TypeScript, and Vite. Organize work across multiple boards with drag-and-drop, labels, search, dark mode, and local persistence.

## Features

- **Drag and drop** — reorder tasks within columns or move between columns (`@dnd-kit`)
- **Multiple boards** — create, rename, switch, and delete boards
- **Task details** — title, description, labels, optional due date, duplicate and delete
- **Busy columns** — compact view, collapsible columns, “show more” pagination, soft WIP limits
- **Search** — filter tasks by title or description (`/` to focus)
- **Keyboard** — `Esc` closes modals or clears search
- **Dark mode** — system-aware theme with no flash on load
- **Celebrations** — toasts when moving tasks to In Progress or Done
- **Persistence** — Zustand + `localStorage` with v1 → v2 migration

## Tech stack

- React 19, TypeScript, Vite 8
- Tailwind CSS 4
- Zustand (persisted state)
- Framer Motion (modals, theme toggle)
- Vitest (unit tests)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run test` | Run unit tests (Vitest)  |
| `npm run lint` | ESLint                   |

## Deploy

Works on any static host. For Vercel, `vercel.json` is included for SPA routing.

```bash
npm run build
```

Deploy the `dist` folder.

## License

MIT
