# TaskFlow Setup Guide

TaskFlow is a full-stack task management application with user authentication, 2FA, and a Kanban-style board interface.

## Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Docker and Docker Compose

## Installation

### Install Dependencies

```bash
cd todo-app
pnpm install
```

### Start Database

Using Docker Compose:

```bash
pnpm docker:up
```

Or using Docker directly:

```bash
docker run -d --name todo-mongodb -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

### Environment Configuration

Backend environment:

```bash
cd apps/server
cp .env.example .env
```

Frontend environment:

```bash
cd apps/client
cp .env.local.example .env.local
```

### Start Application

From the root directory:

```bash
# Start both services
pnpm dev
```

This starts the backend API on port 5000 and frontend on port 3000.

Or run services separately:

```bash
pnpm dev:server  # Backend only
pnpm dev:client  # Frontend only
```

## Usage

1. Navigate to http://localhost:3000 and create an account
2. Enable 2FA in Settings for additional security (optional)
3. Create tasks using the "Create Task" button or pressing 'N'
4. Organize tasks on the Kanban board with drag-and-drop
5. Use search and filters to find specific tasks

## Architecture

### Backend

- Express.js with TypeScript
- MongoDB with Mongoose
- JWT authentication with refresh tokens
- TOTP-based 2FA
- bcrypt password hashing

### Frontend

- Next.js 14 with App Router
- React Query for data management
- Tailwind CSS and shadcn/ui components
- React Hook Form for validation

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/login/2fa` - 2FA verification
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/me` - Current user info
- `POST /api/auth/2fa/setup` - 2FA setup
- `POST /api/auth/2fa/verify` - Enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA

### Tasks (Authenticated)

- `GET /api/todos` - List tasks
- `POST /api/todos` - Create task
- `PUT /api/todos/:id` - Update task
- `PATCH /api/todos/:id/status` - Update status
- `DELETE /api/todos/:id` - Delete task

## Development

```bash
pnpm lint          # Run linters
pnpm type-check    # Type checking
pnpm build         # Production build
pnpm start         # Production server
pnpm clean         # Clean build artifacts
```

## Docker

```bash
pnpm docker:up     # Start services
pnpm docker:down   # Stop services
pnpm docker:logs   # View logs
```

## Production Security

- Use strong, random JWT secrets
- Store all sensitive data as environment variables
- Enable HTTPS
- Use managed database services
- Configure CORS properly
- Implement rate limiting
- Run regular security audits

## Troubleshooting

### Ports in use

Update ports in environment files if 3000/5000 are occupied:

- `apps/server/.env` (PORT)
- `apps/client/.env.local` (NEXT_PUBLIC_API_URL)

### Database connection

Check MongoDB is running: `docker ps | grep mongo`
If not running: `pnpm docker:up`

### Authentication issues

- Verify JWT secrets in `apps/server/.env`
- Clear browser storage
- Restart backend server

### 2FA setup

Install QR code package: `cd apps/server && pnpm install`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
