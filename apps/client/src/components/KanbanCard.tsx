"use client";

import { useState } from "react";
import { MoreHorizontal, Calendar, Tag, Trash2, Edit, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteTodo } from "@/hooks/useTodos";
import { EditTodoDialog } from "./EditTodoDialog";
import type { Todo, TodoStatus } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface KanbanCardProps {
  todo: Todo;
  onStatusChange: (todoId: string, newStatus: TodoStatus) => void;
}

const priorityConfig = {
  URGENT: { label: "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: "🔴" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: "🟠" },
  MEDIUM: { label: "Medium", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: "🟡" },
  LOW: { label: "Low", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: "🟢" },
};

export function KanbanCard({ todo, onStatusChange }: KanbanCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteTodo();

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo._id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = priorityConfig[todo.priority];

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(todo._id);
    }
  };

  const getNextStatus = (): TodoStatus | null => {
    if (todo.status === "TODO") return "IN_PROGRESS";
    if (todo.status === "IN_PROGRESS") return "DONE";
    return null;
  };

  const getPrevStatus = (): TodoStatus | null => {
    if (todo.status === "DONE") return "IN_PROGRESS";
    if (todo.status === "IN_PROGRESS") return "TODO";
    return null;
  };

  const nextStatus = getNextStatus();
  const prevStatus = getPrevStatus();

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: isDragging ? 1 : 1.02, y: isDragging ? 0 : -2 }}
        transition={{ duration: 0.2 }}
        className={`group bg-white dark:bg-slate-800 border rounded-lg p-4 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-200 cursor-grab active:cursor-grabbing ${
          isDragging ? "z-50 rotate-2" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="font-medium text-sm leading-snug flex-1 group-hover:text-primary transition-colors">
            {todo.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {prevStatus && (
                <DropdownMenuItem onClick={() => onStatusChange(todo._id, prevStatus)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Move to {prevStatus.replace("_", " ")}
                </DropdownMenuItem>
              )}
              {nextStatus && (
                <DropdownMenuItem onClick={() => onStatusChange(todo._id, nextStatus)}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Move to {nextStatus.replace("_", " ")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {todo.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
            <span>{priority.icon}</span>
            <span>{priority.label}</span>
          </span>

          {todo.tags.length > 0 && (
            <>
              {todo.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
              {todo.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{todo.tags.length - 2}
                </span>
              )}
            </>
          )}
        </div>

        {todo.dueDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(todo.dueDate), "MMM dd, yyyy")}</span>
          </div>
        )}
      </motion.div>

      <EditTodoDialog
        todo={todo}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}

