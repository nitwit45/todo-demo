import { Router } from "express";
import {
  getTodos,
  createTodo,
  updateTodo,
  updateTodoStatus,
  deleteTodo,
} from "../controllers/todo.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * Todo routes - All require authentication
 */
router.use(authenticate);

router.get("/todos", getTodos);
router.post("/todos", createTodo);
router.put("/todos/:id", updateTodo);
router.patch("/todos/:id/status", updateTodoStatus);
router.delete("/todos/:id", deleteTodo);

export default router;

