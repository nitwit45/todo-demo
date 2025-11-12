"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "./KanbanCard";
import type { Todo, TodoStatus } from "@/lib/api";
import { useDroppable } from "@dnd-kit/core";

interface KanbanColumnProps {
  column: {
    id: TodoStatus;
    title: string;
    color: string;
  };
  todos: Todo[];
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
}

export function KanbanColumn({ column, todos, onStatusChange }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${column.color} rounded-t-lg p-4 border-b transition-all duration-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-base">{column.title}</h3>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-xs font-medium">
              {todos.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 p-4 bg-card/50 rounded-b-lg border border-t-0 min-h-[200px] overflow-y-auto max-h-[calc(100vh-350px)] transition-all duration-200 ${
          isOver ? "bg-primary/5 border-primary/50 ring-2 ring-primary/30" : ""
        }`}
      >
        {todos.map((todo) => (
          <KanbanCard key={todo._id} todo={todo} onStatusChange={onStatusChange} />
        ))}

        {todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">{isOver ? "Drop here" : "No tasks"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
