## 🚀 Description

Built a full-stack todo application with user authentication and kanban-style task management. The app features drag-and-drop functionality, real-time search/filtering, priority management, and dark mode support.

**Core Features Implemented:**

- RESTful API with all required endpoints (GET, POST, PUT, PATCH, DELETE)
- User authentication with JWT and optional 2FA
- Kanban board with three columns (To Do, In Progress, Done)
- Drag-and-drop task reordering between columns
- Priority levels (Low, Medium, High, Urgent) with visual indicators
- Real-time search across titles, descriptions, and tags
- Dark/light theme toggle with system preference detection
- Keyboard shortcuts (N for quick task creation)

**Tech Stack:**

- Frontend: Next.js 14 with TypeScript, shadcn/ui, TailwindCSS, dnd-kit
- Backend: Node.js + Express with TypeScript
- Database: MongoDB with Mongoose ODM
- Monorepo structure with pnpm workspaces

---

## 💡 Solution Rationale & User Value

**Architecture Decisions:**

I opted for a monorepo structure using pnpm workspaces to keep the codebase organized and enable shared validation schemas between frontend and backend. This eliminates type mismatches and reduces duplication.

The kanban board over a simple list view was chosen because it provides better visual organization and makes task workflow more intuitive. Users can instantly see the status of all their tasks and move them between stages with simple drag-and-drop.

**What I Optimized For:**

1. **User Experience**: Implemented optimistic UI updates so actions feel instant, even before server confirmation. Added keyboard shortcuts and smooth animations to make the app feel polished.

2. **Developer Experience**: Strong TypeScript typing throughout, Zod validation on both ends, and comprehensive error handling. The code is structured to be maintainable and easy to extend.

3. **Performance**: Used React Query for efficient data fetching with automatic caching and background refetching. Implemented proper loading states and error boundaries.

**User Value:**

The kanban approach helps users organize tasks by workflow stage, not just completion status. Priority levels with color coding make urgent tasks immediately visible. The search and filter system helps users quickly find what they need as their task list grows. Dark mode and keyboard shortcuts show attention to daily usability details that matter to power users.

---

## 🎥 Demo Video

[YOUR GOOGLE DRIVE LINK HERE]

---

## 🛠️ Setup Instructions (if different from README)

Quick start with Docker:

```bash
pnpm docker:up
```

Then open http://localhost:3000

See the root README for manual setup details.

---

## 📌 Known Limitations / Assumptions

- 2FA is optional and implemented as a stretch feature
- Due dates are supported in the data model but UI for date picking is simplified
- Tags are stored but no autocomplete/suggestions implemented yet
- Assumes MongoDB connection is available (provided via Docker or local instance)
- No file attachments or subtasks (kept scope focused on core requirements)

---

## ✅ Checklist

- [x] Frontend is built using React
- [x] Database tech is connected and data persists correctly
- [x] Tasks can be viewed
- [x] Tasks can be created
- [x] Tasks can be edited
- [x] Tasks can be marked as done/undone
- [x] Tasks can be deleted
- [x] API endpoints match the spec
- [x] Demo video included
- [x] Solution rationale & user value explained

---
