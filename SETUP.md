# TaskFlow - Complete Setup Guide

## 🚀 What's New

This is now a **full-featured project management app** inspired by Jira with:

### ✨ Features
- ✅ **User Authentication** - Secure signup/login with JWT tokens
- 🔐 **Two-Factor Authentication (2FA)** - Optional TOTP-based 2FA using authenticator apps
- 📊 **Kanban Board** - Beautiful Jira-like board with drag-and-drop columns (To Do, In Progress, Done)
- 🎯 **Priority Management** - Urgent, High, Medium, Low priority levels
- 🏷️ **Tags & Labels** - Organize tasks with custom tags
- 📅 **Due Dates** - Set deadlines for your tasks
- 🔍 **Search & Filter** - Find tasks quickly by title, description, or priority
- 👤 **User Profiles** - Personal account management and settings
- 🎨 **Modern UI** - Beautiful gradient designs and smooth animations
- 🌓 **Dark Mode** - Built-in dark mode support
- 🔒 **Secure** - Industry-standard security practices

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** 18 or higher
- **pnpm** 8 or higher
- **Docker** and **Docker Compose** (for database)

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
cd todo-app
pnpm install
```

This will install all dependencies for the frontend, backend, and shared packages.

### 2. Start MongoDB

You have two options:

**Option A: Using Docker Compose (Recommended)**
```bash
pnpm docker:up
```

**Option B: Using Docker directly**
```bash
docker run -d \
  --name todo-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

### 3. Configure Environment Variables

**Backend (.env)**
```bash
cd apps/server
cp .env.example .env
```

Edit `apps/server/.env` if needed. Default values are:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/todoapp?authSource=admin
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

**Frontend (.env.local)**
```bash
cd apps/client
cp .env.local.example .env.local
```

Content should be:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start the Application

From the root `todo-app` directory:

```bash
# Start both frontend and backend
pnpm dev
```

This will start:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000

Or start them separately:
```bash
# Backend only
pnpm dev:server

# Frontend only  
pnpm dev:client
```

## 👥 Using the Application

### First Time Setup

1. **Navigate to** http://localhost:3000
2. You'll be redirected to the **login page**
3. Click **"Sign up"** to create a new account
4. Fill in your details:
   - Full name
   - Email address
   - Password (min 8 characters)
5. Click **"Create account"**
6. You'll be automatically logged in and taken to your dashboard

### Setting Up 2FA (Optional but Recommended)

1. Click on your **avatar** in the top right
2. Select **"Settings"**
3. In the "Two-Factor Authentication" section, click **"Enable"**
4. Scan the QR code with an authenticator app:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
   - Or any TOTP-compatible app
5. Enter the 6-digit code to verify
6. 2FA is now enabled! Next time you log in, you'll need your authenticator code

### Creating Tasks

1. Click the **"Create Task"** button (or press **N** key)
2. Fill in the task details:
   - **Title** (required)
   - **Description** (optional)
   - **Priority**: Low, Medium, High, or Urgent
   - **Due Date** (optional)
   - **Tags** (comma-separated, optional)
3. Click **"Create Task"**

### Managing Tasks on the Kanban Board

- **View** tasks organized in three columns: To Do, In Progress, Done
- **Click** on a task to see more details
- **Use the menu** (three dots) to:
  - Edit the task
  - Move between columns
  - Delete the task
- **Search** for tasks using the search bar
- **Filter** by priority using the filter dropdown

## 🏗️ Architecture

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** authentication with refresh tokens
- **Speakeasy** for 2FA (TOTP)
- **bcrypt** for password hashing
- **QR Code** generation for 2FA setup

### Frontend
- **Next.js 14** with App Router
- **React Query** for data fetching and caching
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Hook Form** for form handling
- **date-fns** for date formatting

### Security Features
- Password hashing with bcrypt (12 rounds)
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 day expiry)
- TOTP-based 2FA with QR codes
- CORS protection
- Helmet security headers
- User-specific data isolation

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/login/2fa` - Verify 2FA code
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/2fa/verify` - Enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA

### Tasks (All require authentication)
- `GET /api/todos` - Get all user's tasks
- `POST /api/todos` - Create new task
- `PUT /api/todos/:id` - Update task
- `PATCH /api/todos/:id/status` - Update task status
- `DELETE /api/todos/:id` - Delete task

## 🎨 UI Highlights

- **Beautiful gradient backgrounds** inspired by modern design systems
- **Smooth animations** for all interactions
- **Responsive design** works on all screen sizes
- **Professional Kanban board** with column-based layout
- **Priority badges** with color coding
- **Tag management** for organization
- **Due date indicators** for time management
- **User avatar** with initials fallback
- **Toast notifications** for feedback

## 🔧 Development

```bash
# Run linters
pnpm lint

# Type checking
pnpm type-check

# Build for production
pnpm build

# Start production server
pnpm start

# Clean build artifacts
pnpm clean
```

## 🐳 Docker Commands

```bash
# Start all services
pnpm docker:up

# Stop all services
pnpm docker:down

# View logs
pnpm docker:logs

# Restart services
pnpm docker:down && pnpm docker:up
```

## 🔐 Security Best Practices

For production deployment:

1. **Change JWT secrets** in `.env` to long, random strings
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** for all connections
4. **Use a managed MongoDB** service (MongoDB Atlas, etc.)
5. **Set up proper CORS** origins
6. **Enable rate limiting** for API endpoints
7. **Regular security audits** with `pnpm audit`

## 🐛 Troubleshooting

### Port already in use
If ports 3000 or 5000 are already in use, update the ports in:
- `apps/server/.env` (PORT)
- `apps/client/.env.local` (NEXT_PUBLIC_API_URL)

### MongoDB connection failed
Ensure MongoDB is running:
```bash
docker ps | grep mongo
```

If not running, start it:
```bash
pnpm docker:up
```

### Authentication not working
1. Check that JWT secrets are set in `apps/server/.env`
2. Clear browser local storage
3. Restart the backend server

### 2FA QR code not showing
Ensure the `qrcode` package is installed:
```bash
cd apps/server
pnpm install
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🎉 Enjoy TaskFlow!

You now have a fully-featured, secure, and beautiful task management application. Start organizing your work like a pro!

