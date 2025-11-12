import { z } from "zod";

/**
 * Todo item schema for validation
 */
export const todoSchema = z.object({
  _id: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .trim()
    .optional(),
  done: z.boolean().default(false),
  createdAt: z.date().or(z.string()).optional(),
  updatedAt: z.date().or(z.string()).optional(),
});

/**
 * Schema for creating a new todo (excludes timestamps and id)
 */
export const createTodoSchema = todoSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for updating a todo (all fields optional except id)
 */
export const updateTodoSchema = todoSchema
  .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

/**
 * Schema for toggling todo done status
 */
export const toggleTodoSchema = z.object({
  done: z.boolean(),
});

/**
 * Type exports
 */
export type Todo = z.infer<typeof todoSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ToggleTodoInput = z.infer<typeof toggleTodoSchema>;
