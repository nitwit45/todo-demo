# Full Stack TODO Application

A production-ready todo application demonstrating modern full-stack development practices. Built with Next.js 14, Express.js, TypeScript, and MongoDB in a monorepo architecture.

## Overview

This project showcases professional development standards including type-safe API contracts, optimistic UI updates, comprehensive validation, and a polished user experience. The codebase is organized as a monorepo using pnpm workspaces with shared packages for consistency across frontend and backend.

## Tech Stack

**Frontend**
- Next.js 14 with App Router and TypeScript
- TanStack Query for data fetching and caching
- shadcn/ui and Tailwind CSS for UI components
- React Hook Form with Zod validation
- Framer Motion for animations
- dnd-kit for drag and drop functionality

**Backend**
- Express.js with TypeScript
- MongoDB with Mongoose ODM
- JWT authentication with refresh tokens
- TOTP-based two-factor authentication
- Zod for runtime validation
- Helmet for security headers
- CORS and Morgan middleware

**Development**
- pnpm workspaces for monorepo management
- Docker and Docker Compose for containerization
- ESLint and Prettier for code quality
- Shared validation package for type safety

## Features

**Core Functionality**
- View all todo items
- Create new todos with title and description
- Edit existing todos
- Toggle completion status
- Delete todos

**Advanced Capabilities**
- User authentication with JWT tokens
- Optional two-factor authentication (2FA) with TOTP
- Optimistic UI updates for instant feedback
- Dark mode support
- Keyboard shortcuts (N for new todo, Esc to close)
- Real-time search and filtering
- Drag and drop reordering
- Toast notifications for user feedback
- Real-time validation with inline errors
- Loading states and error handling
- Responsive design for all screen sizes
- Accessibility features with ARIA labels

## Project Structure

```
todo-app/
├── apps/
│   ├── client/              Frontend application
│   └── server/              Backend API
├── packages/
│   └── validation/          Shared validation schemas
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Docker and Docker Compose (optional)

### Quick Start with Docker

```bash
# Start all services (recommended)
pnpm docker:up

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: mongodb://localhost:27017

# Stop services
pnpm docker:down
```

### Manual Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start MongoDB (using Docker):
```bash
docker run -d \
  --name todo-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

3. Configure environment variables:

Create `apps/server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/todoapp?authSource=admin
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

4. Start development servers:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`. After registering, users can optionally enable two-factor authentication in their account settings for enhanced security.

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/login/2fa` | Verify 2FA code during login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user info |
| POST | `/api/auth/2fa/setup` | Setup 2FA (returns QR code) |
| POST | `/api/auth/2fa/verify` | Enable 2FA after setup |
| POST | `/api/auth/2fa/disable` | Disable 2FA |

### Todo Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Retrieve all todos |
| POST | `/api/todos` | Create a new todo |
| PUT | `/api/todos/:id` | Update a todo |
| PATCH | `/api/todos/:id/done` | Toggle completion status |
| DELETE | `/api/todos/:id` | Delete a todo |

### Example Usage

**Authentication:**

Register user:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

Setup 2FA:
```bash
curl -X POST http://localhost:5000/api/auth/2fa/setup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Todos:**

Create a todo:
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Task name", "description": "Task details"}'
```

Get all todos:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/todos
```

Toggle status:
```bash
curl -X PATCH http://localhost:5000/api/todos/<id>/done \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"done": true}'
```

## Development

### Available Commands

```bash
# Development
pnpm dev              # Start all applications
pnpm dev:client       # Start frontend only
pnpm dev:server       # Start backend only

# Building
pnpm build            # Build all packages
pnpm build:client     # Build frontend
pnpm build:server     # Build backend

# Production
pnpm start            # Start production servers

# Code Quality
pnpm lint             # Run linters
pnpm format           # Format code
pnpm type-check       # Type check all packages

# Docker
pnpm docker:up        # Start services
pnpm docker:down      # Stop services
pnpm docker:logs      # View logs

# Cleanup
pnpm clean            # Remove build artifacts
```

## Architecture Decisions

### Monorepo Structure

The project uses pnpm workspaces to share code between frontend and backend. The shared validation package ensures consistent data validation and type safety across the entire stack.

### Optimistic Updates

TanStack Query is configured to update the UI immediately before server confirmation, with automatic rollback on errors. This provides a responsive user experience while maintaining data consistency.

### Type Safety

TypeScript is used throughout with strict mode enabled. Zod schemas define the data structure and are shared between client and server, ensuring type-safe API contracts.

### Performance

The application includes several performance optimizations:
- Efficient re-renders with React Query caching
- MongoDB indexes for fast queries
- Code splitting with Next.js
- Optimized bundle size

## Additional Documentation

For detailed setup and development instructions:
- See `apps/client/README.md` for frontend-specific documentation
- See `apps/server/README.md` for backend-specific documentation

## Notes

This project was created as a full-stack development assessment. It demonstrates production-ready patterns including error handling, validation, security best practices, and modern development workflows.
