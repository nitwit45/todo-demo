# Backend API

Express.js REST API for the todo application. Built with TypeScript, MongoDB, and comprehensive validation.

## Technology Stack

- Express.js 4.x with TypeScript
- MongoDB 7.x with Mongoose ODM
- Zod for runtime validation
- Helmet for security headers
- Morgan for request logging
- CORS middleware

## Project Structure

```
src/
├── config/
│   └── database.ts          MongoDB connection
├── controllers/
│   └── todo.controller.ts   Request handlers
├── middleware/
│   └── errorHandler.ts      Error handling
├── models/
│   └── todo.model.ts        Mongoose schema
├── routes/
│   └── todo.routes.ts       API routes
└── index.ts                 Application entry point
```

## Getting Started

### Installation

From the project root:

```bash
pnpm install
```

### Environment Variables

Create `.env` in this directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/todoapp?authSource=admin
CORS_ORIGIN=http://localhost:3000
```

### MongoDB Setup

#### Using Docker (Recommended)

```bash
docker run -d \
  --name todo-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:7.0
```

#### Using MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in `.env`

#### Local Installation

Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

### Development

```bash
# From project root
pnpm dev:server

# Or from this directory
pnpm dev
```

The API will start at `http://localhost:5000`

### Building

```bash
# From project root
pnpm build:server

# Or from this directory
pnpm build
pnpm start
```

## API Documentation

### Endpoints

**GET /api/todos**

Retrieve all todos, sorted by creation date (newest first).

Response:

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Task name",
    "description": "Task details",
    "done": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**POST /api/todos**

Create a new todo.

Request:

```json
{
  "title": "Task name",
  "description": "Task details (optional)"
}
```

Response: `201 Created` with the created todo object

**PUT /api/todos/:id**

Update a todo's title and/or description.

Request:

```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

Response: `200 OK` with the updated todo object

**PATCH /api/todos/:id/done**

Toggle a todo's completion status.

Request:

```json
{
  "done": true
}
```

Response: `200 OK` with the updated todo object

**DELETE /api/todos/:id**

Delete a todo.

Response: `204 No Content`

### Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

Status codes:

- `400` - Validation error or bad request
- `404` - Todo not found
- `500` - Internal server error

### Health Check

**GET /health**

Check API status.

Response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Database Schema

### Todo Model

```typescript
{
  title: string; // Required, max 200 characters
  description: string; // Optional, max 1000 characters
  done: boolean; // Default: false
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

Indexes:

- `done` field for filtering
- `createdAt` field for sorting

## Validation

The API uses Zod schemas from the shared `@todo/validation` package. This ensures validation rules match between frontend and backend.

Validation occurs at two levels:

1. Zod runtime validation in controllers
2. Mongoose schema validation in the database layer

## Middleware

### Security

Helmet is configured to set security headers:

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### CORS

CORS is enabled for the frontend origin specified in `CORS_ORIGIN` environment variable. Credentials are supported for future authentication implementation.

### Logging

Morgan logs all HTTP requests in development mode with the "dev" format.

### Error Handling

Global error handler catches all unhandled errors and returns appropriate responses. In production, error details are hidden from clients.

## Error Handling

The application includes comprehensive error handling:

- Zod validation errors return 400 with detailed field-level messages
- MongoDB errors are caught and logged
- 404 handler for undefined routes
- Global error handler for unexpected errors

## MongoDB Connection

The database connection includes:

- Automatic reconnection on disconnect
- Connection error logging
- Graceful shutdown on SIGINT

## Development Tools

### Type Checking

```bash
pnpm type-check
```

### Linting

```bash
pnpm lint
```

### Hot Reload

The development server uses `tsx watch` for automatic restart on file changes.

## Docker

A Dockerfile is included for containerized deployment. The image installs dependencies and runs the development server.

```bash
docker build -t todo-server .
docker run -p 5000:5000 -e MONGODB_URI=<uri> todo-server
```

## Testing

To test the API manually:

```bash
# Get all todos
curl http://localhost:5000/api/todos

# Create a todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","description":"Test description"}'

# Update a todo
curl -X PUT http://localhost:5000/api/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated task"}'

# Toggle status
curl -X PATCH http://localhost:5000/api/todos/<id>/done \
  -H "Content-Type: application/json" \
  -d '{"done":true}'

# Delete a todo
curl -X DELETE http://localhost:5000/api/todos/<id>
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Set secure CORS origin
4. Enable HTTPS
5. Implement rate limiting
6. Add authentication middleware
7. Set up monitoring and logging

## Notes

The API is designed to be stateless and can be horizontally scaled. All state is stored in MongoDB.

Connection pooling is handled automatically by Mongoose. The default pool size is sufficient for most use cases.

For high-traffic scenarios, consider:

- Adding Redis for caching
- Implementing request rate limiting
- Using a load balancer
- Enabling MongoDB replica sets
