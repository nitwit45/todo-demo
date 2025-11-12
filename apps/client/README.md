# Frontend

The React frontend for the todo app, built with Next.js and TypeScript.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Features

- Fast, responsive interface
- Dark mode support
- Keyboard shortcuts (press `N` to create a todo)
- Search and filter todos
- Drag and drop reordering
- Mobile-friendly design

## Development

### Available Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run linter
pnpm type-check # Check TypeScript types
```

### Environment

Create a `.env.local` file if you need to change the API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Tech Stack

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui components
- TanStack Query for data fetching
- React Hook Form for forms
