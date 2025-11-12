"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Todo } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EditTodoDialog } from "./EditTodoDialog";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, status: "TODO" | "IN_PROGRESS" | "DONE") => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title?: string; description?: string }) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo._id || "",
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={cn(
          "group relative flex items-start gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md",
          isDragging && "opacity-50 shadow-lg",
          todo.status === "DONE" && "opacity-75"
        )}
      >
        {/* Drag Handle */}
        <button
          className="mt-1 cursor-grab touch-none text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={todo.status === "DONE"}
          onCheckedChange={(checked) => onToggle(todo._id || "", checked ? "DONE" : "TODO")}
          className="mt-1"
        />

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h3
            className={cn(
              "font-medium leading-tight",
              todo.status === "DONE" && "text-muted-foreground line-through"
            )}
          >
            {todo.title}
          </h3>
          {todo.description && (
            <p
              className={cn(
                "text-sm text-muted-foreground",
                todo.status === "DONE" && "line-through"
              )}
            >
              {todo.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {new Date(todo.createdAt || "").toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditOpen(true)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo._id || "")}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <EditTodoDialog todo={todo} open={isEditOpen} onOpenChange={setIsEditOpen} />
    </>
  );
}
