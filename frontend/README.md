<div align="center">

# ⚡ TrackFlows

### A modern, AI-native project & sprint management workspace

Kanban boards with drag‑to‑reorder, a live analytics dashboard, a calendar, member onboarding, Keep‑style notes, and an AI assistant — built with an accessibility‑first design system.

<br />

<!-- Core stack -->
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-5-443E38?style=for-the-badge&logo=react&logoColor=white)

<!-- Libraries & tooling -->
![dnd kit](https://img.shields.io/badge/dnd--kit-6-000000?style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-3-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide_React-1-F56565?style=flat-square&logo=lucide&logoColor=white)
![SheetJS](https://img.shields.io/badge/SheetJS_(xlsx)-0.18-217346?style=flat-square&logo=microsoftexcel&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![PostCSS](https://img.shields.io/badge/PostCSS-8-DD3A0A?style=flat-square&logo=postcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

</div>

---

## 📖 Overview

**TrackFlows** is a single‑page web application for planning and tracking work across a sprint. It pairs a fast Kanban workflow with a real‑time analytics dashboard, a scheduling calendar, a full member‑onboarding flow, and a quick‑capture notes system — all wrapped in a Google‑Calendar‑inspired shell with light/dark theming.

The app runs entirely on the client (state is persisted to `localStorage`), so it works out of the box with no backend required — ideal as a product prototype, a design reference, or a foundation to wire to a real API.

> **Status:** Front‑end prototype. Authentication and the AI assistant are simulated for local development; everything else (boards, tasks, calendar, contacts, notes, analytics) is fully functional and persisted.

---

## ✨ Features

### 🗂️ Tasks & Kanban
- **Drag‑and‑drop** board with reordering **within and across** columns (`To Do · Doing · Done`), powered by `@dnd-kit/sortable`.
- **Kanban, Table, and Calendar** views of the same data.
- Rich task cards: project tag, **priority**, **due date**, overdue indicator, assignee avatar, and comment count.
- Task editor with **due date, priority, assignee, project tag, and a comments thread**.
- Search, project/tag filtering, and smart empty states (“no results → clear filters”).

### 📊 Data Insights
- Live dashboard derived **entirely from real task data** — summary stat cards, 7‑day completion trend (line), task distribution (donut), team performance, workload (bar), overdue list, sprint progress, and a custom **Gantt timeline**.
- Charts ship with screen‑reader text alternatives and keyboard‑navigable Gantt bars.

### 📅 Calendar
- Month grid combining tasks and **sticky notes**, with add / delete / pin and per‑day scheduling.

### 👥 Contacts & Onboarding
- **Invite flow** — invite by email with role & department; a real, copyable **accept link** (`?invite=<token>`).
- **Accept‑invite screen** that activates the member and routes them to sign‑in.
- **Bulk upload** from **CSV or Excel** (`.xlsx`/`.xls`) with validation preview and a downloadable template (SheetJS is lazy‑loaded only when needed).
- **Paginated members table** with search, status filters, and per‑row **accept / reject / revoke / remove** actions.

### 💡 Notes (Google‑Keep‑style)
- **Quick capture** from the bulb icon or the **`Q`** shortcut — auto‑saves on click‑away.
- **Masonry grid** with pinned section, color labels, **#tags**, **checklists** (toggle inline), full‑text search, and a soft‑delete **Trash** (restore / delete forever).

### 🤖 AI surfaces *(simulated)*
- **TrackFlow AI** assistant panel and a NotebookLM‑style **AI Writer** workspace with source‑grounded chat.

### 🎨 Platform & UX
- Light / dark **theming** via CSS variables, persisted across sessions.
- **Accessibility‑first**: a reusable accessible `Modal` (focus trap, `Esc`, scroll‑lock), a label‑required `IconButton`, global focus‑visible rings, `aria-live` toasts, `prefers-reduced-motion` support, and keyboard‑operable controls throughout.
- Session persistence — auth state and the active page survive a refresh.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| <kbd>/</kbd> | Focus the global search |
| <kbd>N</kbd> | Create a new task |
| <kbd>Q</kbd> | Open quick‑capture note |
| <kbd>Esc</kbd> | Close the active dialog / popover |
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>Enter</kbd> | Save a quick note |

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [React 19](https://react.dev) |
| **Language** | [TypeScript 6](https://www.typescriptlang.org) |
| **Build tool** | [Vite 8](https://vite.dev) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) + CSS variables |
| **State** | [Zustand 5](https://zustand-demo.pmnd.rs) (with `persist`) |
| **Drag & drop** | [@dnd-kit](https://dndkit.com) (`core` · `sortable` · `utilities`) |
| **Charts** | [Recharts 3](https://recharts.org) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Spreadsheets** | [SheetJS / xlsx](https://sheetjs.com) (lazy‑loaded) |
| **Linting** | [ESLint 10](https://eslint.org) + `typescript-eslint` + `eslint-plugin-react-hooks` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9 (or pnpm / yarn)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd frontend

# 2. Install dependencies
npm install

# 3. Start the dev server (http://localhost:5173)
npm run dev
```

### Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type‑check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets (favicon, icons)
├── src/
│   ├── components/
│   │   ├── ui/                # Design-system primitives
│   │   │   ├── Modal.tsx          # Accessible dialog (focus trap, Esc, scroll-lock)
│   │   │   ├── IconButton.tsx     # Label-required icon button + focus ring
│   │   │   └── ToastHost.tsx      # Global aria-live toast outlet
│   │   ├── auth/              # Sign in / sign up / OTP / accept flow
│   │   ├── contacts/         # Onboarding: invite, bulk upload, members table
│   │   ├── notes/            # Quick capture, note cards, editor, grid
│   │   ├── KanbanBoard.tsx   # Board + Table view
│   │   ├── CalendarView.tsx  # Month calendar with tasks + sticky notes
│   │   ├── DataInsightsView.tsx  # Analytics dashboard + Gantt
│   │   ├── AIPanel.tsx / AIWriterView.tsx  # AI surfaces
│   │   ├── HomeView.tsx      # Dashboard landing
│   │   ├── Sidebar.tsx       # Navigation + mini calendar + projects
│   │   ├── TaskCard.tsx      # Draggable task card
│   │   └── TaskModal.tsx     # Task create/edit + comments
│   ├── store/                # Zustand stores (persisted)
│   │   ├── boardStore.ts         # Tasks, users, theme, toasts
│   │   ├── contactsStore.ts      # Members & invitations
│   │   └── notesStore.ts         # Notes
│   ├── hooks/
│   │   └── useClickAway.ts   # Dismiss popovers on outside click / Esc
│   ├── utils/
│   │   └── date.ts           # Centralized date helpers (one source of "today")
│   ├── App.tsx               # Shell: header, sidebar, routing-by-section
│   ├── main.tsx              # Entry point
│   └── index.css             # Theme tokens + accessibility baseline
├── index.html
├── tsconfig*.json
├── vite.config.ts
└── eslint.config.js
```

---

## 🏛️ Architecture

- **State management** — three focused [Zustand](https://zustand-demo.pmnd.rs) stores (`board`, `contacts`, `notes`), each persisted to `localStorage` via the `persist` middleware. The board store also carries theme and a global toast.
- **Navigation** — a lightweight section switch in `App.tsx` (no router) keeps the bundle small; the active section is persisted so refreshes restore your place. Invite links are handled via a `?invite=` query param.
- **Design system** — shared primitives (`Modal`, `IconButton`, `ToastHost`) and a single source of truth for dates (`utils/date.ts`) and note colors keep behavior consistent and accessible.
- **Theming** — semantic CSS variables (`--bg-primary`, `--text-heading`, …) drive Tailwind utilities, enabling instant light/dark switching.
- **Performance** — the heavy `xlsx` parser is **code‑split** and dynamically imported only when a user uploads a spreadsheet, keeping it out of the main bundle.

---

## ♿ Accessibility

Accessibility is treated as a first‑class concern, not an afterthought:

- All dialogs use a shared `Modal` with `role="dialog"`, `aria-modal`, focus trapping, focus restoration, and `Esc` to close.
- Every icon‑only button has an accessible name; clickable cards, calendar cells, table rows, and Gantt bars are keyboard‑operable.
- Form fields use real `<label>`s, `aria-invalid` / `aria-describedby`, `role="alert"` errors, and `autoComplete`.
- Charts expose text‑alternative summaries; toasts announce via `aria-live`.
- A global `:focus-visible` ring and `prefers-reduced-motion` handling are applied app‑wide.

---

## 🗺️ Roadmap

- [x] Kanban with cross‑column drag‑reorder, table & calendar views
- [x] Live analytics dashboard + Gantt
- [x] Contacts onboarding (invite, accept‑link, CSV/Excel bulk upload)
- [x] Notes — quick capture, grid, colors, tags, checklists, trash
- [x] Accessibility pass + reusable design‑system primitives
- [ ] Notes ↔ tasks linking, backlinks, and checklist‑item → task
- [ ] Note templates (standup / retro / 1:1)
- [ ] Real backend (auth, persistence, collaboration)
- [ ] Live AI assistant (replace simulated responses)

---

## 🤝 Contributing

1. Fork the repo and create a feature branch: `git checkout -b feature/my-feature`
2. Run `npm run lint` and `npm run build` before committing.
3. Open a pull request describing the change.

---

## 📄 License

Released under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

<div align="center">
<br />
Built with ⚡ by the TrackFlows team
</div>
