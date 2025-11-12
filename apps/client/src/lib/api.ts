import { authFetch } from "./auth";

// New Todo types for Jira-like features
export type TodoStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TodoPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Todo {
  _id: string;
  title: string;
  description: string;
  status: TodoStatus;
  priority: TodoPriority;
  user: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
  tags?: string[];
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(error.error || "Request failed", response.status, error.details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const todoApi = {
  async getAll(): Promise<Todo[]> {
    const response = await authFetch("/api/todos");
    return handleResponse<Todo[]>(response);
  },

  async create(data: CreateTodoInput): Promise<Todo> {
    const response = await authFetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<Todo>(response);
  },

  async update(id: string, data: UpdateTodoInput): Promise<Todo> {
    const response = await authFetch(`/api/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return handleResponse<Todo>(response);
  },

  async updateStatus(id: string, status: TodoStatus): Promise<Todo> {
    const response = await authFetch(`/api/todos/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return handleResponse<Todo>(response);
  },

  async delete(id: string): Promise<void> {
    const response = await authFetch(`/api/todos/${id}`, {
      method: "DELETE",
    });
    return handleResponse<void>(response);
  },
};
