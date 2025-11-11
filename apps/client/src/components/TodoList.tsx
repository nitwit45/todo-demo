"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Todo } from "@todo/validation";
import { TodoItem } from "./TodoItem";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, ListTodo, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title?: string; description?: string }) => void;
}

type FilterType = "all" | "active" | "completed";

export function TodoList({ todos, onToggle, onDelete, onUpdate }: TodoListProps) {
  const [items, setItems] = useState<Todo[]>(todos);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Update items when todos change
  useMemo(() => {
    setItems(todos);
  }, [todos]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Filter and search
  const filteredTodos = useMemo(() => {
    return items.filter((todo) => {
      // Filter by status
      if (filter === "active" && todo.done) return false;
      if (filter === "completed" && !todo.done) return false;

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          todo.title.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [items, filter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: todos.length,
      active: todos.filter((t) => !t.done).length,
      completed: todos.filter((t) => t.done).length,
    };
  }, [todos]);

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ListTodo className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No todos yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating your first todo.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Press &apos;N&apos; to create a new todo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <ListTodo className="mx-auto h-5 w-5 text-muted-foreground" />
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <Circle className="mx-auto h-5 w-5 text-blue-500" />
          <p className="mt-2 text-2xl font-bold">{stats.active}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />
          <p className="mt-2 text-2xl font-bold">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={cn(filter === "all" && "shadow-sm")}
        >
          All
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
          className={cn(filter === "active" && "shadow-sm")}
        >
          Active
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
          className={cn(filter === "completed" && "shadow-sm")}
        >
          Completed
        </Button>
      </div>

      {/* Todo Items */}
      {filteredTodos.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No todos found matching your criteria.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTodos.map((t) => t._id || "")} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              <AnimatePresence>
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

