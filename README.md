# Todo App

A clean, modern todo application with user authentication, dark mode, and drag-and-drop functionality.

## Features

- Create, edit, and delete todos
- User authentication with optional 2FA
- Dark/light mode toggle
- Keyboard shortcuts (N for new todo)
- Real-time search and filtering
- Drag and drop reordering
- Responsive design

## Quick Start

The easiest way to get started is with Docker:

```bash
# Start everything
pnpm docker:up

# Open http://localhost:3000 in your browser
```

That's it! The app will be running with a full database setup.

## Manual Setup

If you prefer to set things up manually:

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start MongoDB**
   ```bash
   docker run -d --name todo-mongodb -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
     mongo:7.0
   ```

3. **Configure environment** (create `apps/server/.env`)
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://admin:admin123@localhost:27017/todoapp?authSource=admin
   CORS_ORIGIN=http://localhost:3000
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   ```

4. **Start development**
   ```bash
   pnpm dev
   ```

## Usage

- Sign up for an account
- Create todos with titles and descriptions
- Use the search bar to find specific todos
- Drag todos to reorder them
- Toggle between light and dark mode
- Press `N` to quickly create a new todo

## Tech Stack

Built with Next.js, TypeScript, MongoDB, and modern React patterns.
