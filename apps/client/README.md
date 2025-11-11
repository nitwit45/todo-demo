# Frontend Application

Next.js 14 application providing the user interface for the todo application. Built with TypeScript, React, and modern UI libraries.

## Technology Stack

- Next.js 14 with App Router
- TypeScript for type safety
- TanStack Query for server state management
- shadcn/ui component library
- Tailwind CSS for styling
- React Hook Form with Zod validation
- Framer Motion for animations
- dnd-kit for drag and drop
- next-themes for dark mode support

## Project Structure

```
src/
├── app/                  Next.js app router
│   ├── layout.tsx       Root layout with providers
│   ├── page.tsx         Home page component
│   └── globals.css      Global styles
├── components/
│   ├── ui/              shadcn/ui components
│   ├── TodoList.tsx     Main todo list component
│   ├── TodoItem.tsx     Individual todo item
│   ├── TodoForm.tsx     Form for creating/editing
│   ├── CreateTodoDialog.tsx
│   ├── EditTodoDialog.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   ├── useTodos.ts      React Query hooks
│   └── useKeyboardShortcuts.ts
├── lib/
│   ├── api.ts           API client
│   └── utils.ts         Utility functions
└── providers/
    └── Providers.tsx    React Query and theme providers
```

## Getting Started

### Installation

From the project root:
```bash
pnpm install
```

### Environment Variables

Create `.env.local` in this directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

This is optional as the application defaults to `http://localhost:5000`.

### Development

```bash
# From project root
pnpm dev:client

# Or from this directory
pnpm dev
```

The application will start at `http://localhost:3000`

### Building

```bash
# From project root
pnpm build:client

# Or from this directory
pnpm build
pnpm start
```

## Key Features

### Optimistic Updates

The application uses TanStack Query's optimistic update pattern. When users perform actions like creating or updating todos, the UI updates immediately before receiving server confirmation. If the server request fails, the UI automatically rolls back to the previous state.

### Keyboard Shortcuts

- `N` - Open create todo dialog
- `Esc` - Close active dialog

### Search and Filtering

The todo list includes real-time search across titles and descriptions, plus filtering by status (all, active, completed).

### Drag and Drop

Users can reorder todos by dragging. The implementation uses dnd-kit for accessibility and touch support.

## Component Architecture

### Data Fetching

Custom hooks in `hooks/useTodos.ts` wrap TanStack Query mutations and queries:
- `useTodos` - Fetch all todos
- `useCreateTodo` - Create with optimistic update
- `useUpdateTodo` - Update with optimistic update
- `useToggleTodo` - Toggle status with optimistic update
- `useDeleteTodo` - Delete with optimistic update

### Form Validation

Forms use React Hook Form with Zod resolvers. Validation schemas are imported from the shared `@todo/validation` package, ensuring consistency with backend validation.

### UI Components

All UI components are from shadcn/ui, built on Radix UI primitives with Tailwind CSS. These provide accessibility features out of the box including keyboard navigation, focus management, and ARIA attributes.

## Styling

The application uses Tailwind CSS with a custom theme defined in `tailwind.config.ts`. Dark mode is implemented using next-themes with CSS variables for colors.

Color tokens are defined in `globals.css` for both light and dark modes, allowing seamless theme switching.

## API Integration

The API client in `lib/api.ts` provides typed methods for all backend endpoints. It includes error handling and transforms responses to match expected types.

```typescript
todoApi.getAll()           // GET /api/todos
todoApi.create(data)       // POST /api/todos
todoApi.update(id, data)   // PUT /api/todos/:id
todoApi.toggleDone(id, done) // PATCH /api/todos/:id/done
todoApi.delete(id)         // DELETE /api/todos/:id
```

## Performance Considerations

- TanStack Query caches server responses and deduplicates requests
- React components use proper memoization where needed
- Next.js automatically code-splits routes
- Images and fonts are optimized by Next.js

## Accessibility

The application follows WCAG guidelines:
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Sufficient color contrast ratios

## Development Tools

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

### Code Formatting

Prettier is configured at the workspace level. Format code with:
```bash
pnpm format
```

## Docker

A Dockerfile is included for containerized deployment. The image installs dependencies and runs the development server with hot reload enabled.

```bash
docker build -t todo-client .
docker run -p 3000:3000 todo-client
```

For production, update the Dockerfile to run `pnpm build && pnpm start`.

## Notes

The frontend is designed to work independently from the backend during development. If the backend is unavailable, the application displays appropriate error states.

All TypeScript types are derived from Zod schemas in the shared validation package, providing end-to-end type safety from database to UI.

