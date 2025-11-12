"use client";

import { useMemo } from "react";
import { Loader2, AlertCircle, Inbox } from "lucide-react";
import { useTodos, useUpdateTodoStatus } from "@/hooks/useTodos";
import { KanbanColumn } from "./KanbanColumn";
import type { Todo, TodoStatus } from "@/lib/api";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useState } from "react";
import { KanbanCard } from "./KanbanCard";

interface KanbanBoardProps {
  searchQuery: string;
  selectedPriority: string | null;
}

export function KanbanBoard({ searchQuery, selectedPriority }: KanbanBoardProps) {
  const { data: todos, isLoading, error } = useTodos();
  const updateStatusMutation = useUpdateTodoStatus();
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns: { id: TodoStatus; title: string; color: string }[] = [
    { id: "TODO", title: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900/20" },
    { id: "DONE", title: "Done", color: "bg-green-100 dark:bg-green-900/20" },
  ];

  const filteredAndGroupedTodos = useMemo(() => {
    if (!todos) return { TODO: [], IN_PROGRESS: [], DONE: [] };

    let filtered = todos;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.description.toLowerCase().includes(query) ||
          todo.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply priority filter
    if (selectedPriority) {
      filtered = filtered.filter((todo) => todo.priority === selectedPriority);
    }

    // Group by status
    const grouped: Record<TodoStatus, Todo[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };

    filtered.forEach((todo) => {
      grouped[todo.status].push(todo);
    });

    return grouped;
  }, [todos, searchQuery, selectedPriority]);

  const handleStatusChange = (todoId: string, newStatus: TodoStatus) => {
    updateStatusMutation.mutate({ id: todoId, status: newStatus });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = todos?.find((t) => t._id === active.id);
    if (todo) {
      setActiveTodo(todo);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;

    const todoId = active.id as string;
    const newStatus = over.id as TodoStatus;

    const todo = todos?.find((t) => t._id === todoId);
    if (todo && todo.status !== newStatus) {
      handleStatusChange(todoId, newStatus);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading your board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/5 py-24">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <p className="text-lg font-medium text-destructive mb-2">Failed to load tasks</p>
        <p className="text-sm text-muted-foreground">
          Make sure the server is running and try refreshing the page
        </p>
      </div>
    );
  }

  const totalTasks = todos?.length || 0;
  const filteredCount = Object.values(filteredAndGroupedTodos).flat().length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{totalTasks}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">To Do</p>
              <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                {filteredAndGroupedTodos.TODO.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredAndGroupedTodos.IN_PROGRESS.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Done</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filteredAndGroupedTodos.DONE.length}
              </p>
            </div>
          </div>
          {(searchQuery || selectedPriority) && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredCount} of {totalTasks} tasks
            </div>
          )}
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              todos={filteredAndGroupedTodos[column.id]}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {totalTasks === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-24 mt-12">
            <Inbox className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">No tasks yet</p>
            <p className="text-sm text-muted-foreground">Create your first task to get started</p>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeTodo ? (
          <div className="rotate-3 opacity-80">
            <KanbanCard todo={activeTodo} onStatusChange={handleStatusChange} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
