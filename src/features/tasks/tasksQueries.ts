import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  tasksApi,
  type CreateTaskInput,
  type TaskListParams,
  type UpdateTaskInput,
} from "./tasksApi";

// F-05/F-06: task query + mutation hooks. Mutations with optional ids
// guard their invalidations so they are safe with undefined task ids.

const handleError = (err: unknown) => {
  const message =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong";
  toast.error(message);
};

export const useTasks = (projectId?: string, params: TaskListParams = {}) =>
  useQuery({
    queryKey: ["tasks", projectId, params],
    queryFn: () => tasksApi.list({ ...params, projectId }),
  });

export const useTask = (taskId?: string) =>
  useQuery({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.get(taskId),
    enabled: !!taskId,
  });

export const useTaskComments = (taskId?: string) =>
  useQuery({
    queryKey: ["task", taskId, "comments"],
    queryFn: () => tasksApi.comments(taskId),
    enabled: !!taskId,
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (variables.projectId) {
        qc.invalidateQueries({ queryKey: ["project", variables.projectId, "dashboard"] });
      }
      toast.success("Task created");
    },
    onError: handleError,
  });
};

export const useUpdateTask = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTaskInput & { projectId?: string; id?: string }) => {
      const id = data.id ?? taskId;
      if (!id) throw new Error("Task id is required");
      const body: UpdateTaskInput = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
      };
      return tasksApi.update(id, { ...body, projectId: undefined });
    },
    onSuccess: (_, variables) => {
      const id = variables.id ?? taskId;
      if (id) {
        qc.invalidateQueries({ queryKey: ["task", id] });
        qc.invalidateQueries({ queryKey: ["task", id, "comments"] });
      }
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (variables.projectId) {
        qc.invalidateQueries({ queryKey: ["project", variables.projectId, "dashboard"] });
      }
      toast.success("Task updated");
    },
    onError: handleError,
  });
};

export const useDeleteTask = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.remove(taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      if (projectId) {
        qc.invalidateQueries({ queryKey: ["project", projectId, "dashboard"] });
      }
      toast.success("Task deleted");
    },
    onError: handleError,
  });
};

export const useAddAssignee = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => tasksApi.addAssignee(taskId, userId),
    onSuccess: () => {
      if (taskId) {
        qc.invalidateQueries({ queryKey: ["task", taskId] });
        qc.invalidateQueries({ queryKey: ["tasks"] });
      }
      toast.success("Assignee added");
    },
    onError: handleError,
  });
};

export const useAddComment = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) => tasksApi.addComment(taskId, comment),
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: ["task", taskId, "comments"] });
      toast.success("Comment added");
    },
    onError: handleError,
  });
};
