import { Response } from "express";
import { TodoModel } from "../models/todo.model";
import { ZodError } from "zod";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

// Updated validation schemas for new todo structure
const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional().default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Get all todos for the authenticated user
 * GET /api/todos
 */
export const getTodos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const todos = await TodoModel.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
};

/**
 * Create a new todo
 * POST /api/todos
 */
export const createTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const validatedData = createTodoSchema.parse(req.body);
    const todo = await TodoModel.create({
      ...validatedData,
      user: req.user.userId,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    });
    res.status(201).json(todo);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
};

/**
 * Update a todo
 * PUT /api/todos/:id
 */
export const updateTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const validatedData = updateTodoSchema.parse(req.body);

    // Check ownership
    const existingTodo = await TodoModel.findOne({ _id: id, user: req.user.userId });
    if (!existingTodo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    const updateData: any = { ...validatedData };
    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }

    const todo = await TodoModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(todo);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
};

/**
 * Update todo status (for drag and drop between columns)
 * PATCH /api/todos/:id/status
 */
export const updateTodoStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    // Check ownership
    const todo = await TodoModel.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      { status },
      { new: true }
    );

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(todo);
  } catch (error) {
    console.error("Error updating todo status:", error);
    res.status(500).json({ error: "Failed to update todo status" });
  }
};

/**
 * Delete a todo
 * DELETE /api/todos/:id
 */
export const deleteTodo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    // Check ownership before deleting
    const todo = await TodoModel.findOneAndDelete({ _id: id, user: req.user.userId });

    if (!todo) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
};
