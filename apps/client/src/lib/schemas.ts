// Re-export types from api.ts
export type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  TodoStatus,
  TodoPriority
} from "./api";

// Validation schemas using Zod
import { z } from "zod";

/**
 * Schema for creating a new todo
 */
export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  description: z.string().max(1000, "Description must be 1000 characters or less").trim().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Schema for updating a todo
 */
export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim()
    .optional(),
  description: z.string().max(1000, "Description must be 1000 characters or less").trim().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

