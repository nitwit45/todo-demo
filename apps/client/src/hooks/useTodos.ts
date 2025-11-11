import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/lib/api";
import type { CreateTodoInput, UpdateTodoInput, TodoStatus, Todo } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const QUERY_KEY = ["todos"];

export function useTodos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: todoApi.getAll,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: todoApi.create,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Todo[]>(QUERY_KEY);

      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old) => [
        {
          _id: `temp-${Date.now()}`,
          title: newTodo.title,
          description: newTodo.description || "",
          status: newTodo.status || "TODO",
          priority: newTodo.priority || "MEDIUM",
          tags: newTodo.tags || [],
          user: "temp",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Todo,
        ...(old || []),
      ]);

      return { previousTodos };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error: any, _newTodo, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousTodos);
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoInput }) =>
      todoApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Todo[]>(QUERY_KEY);

      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old) =>
        old?.map((todo) =>
          todo._id === id ? { ...todo, ...data } : todo
        )
      );

      return { previousTodos };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: any, _variables, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousTodos);
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateTodoStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TodoStatus }) =>
      todoApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Todo[]>(QUERY_KEY);

      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old) =>
        old?.map((todo) =>
          todo._id === id ? { ...todo, status } : todo
        )
      );

      return { previousTodos };
    },
    onError: (error: any, _variables, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousTodos);
      toast({
        title: "Error",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: todoApi.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previousTodos = queryClient.getQueryData<Todo[]>(QUERY_KEY);

      queryClient.setQueryData<Todo[]>(QUERY_KEY, (old) =>
        old?.filter((todo) => todo._id !== id)
      );

      return { previousTodos };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error: any, _id, context) => {
      queryClient.setQueryData(QUERY_KEY, context?.previousTodos);
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
