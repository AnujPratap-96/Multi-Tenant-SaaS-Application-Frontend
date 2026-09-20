import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  tasksApi,
  type CreateTaskInput,
  type TaskListParams,
  type UpdateTaskInput,
} from "./tasksApi";
import { useTenantStore } from "@/features/tenant/tenantStore";

// F-05/F-06: task query + mutation hooks. Mutations with optional ids
// guard their invalidations so they are safe with undefined task ids.
// C7: all keys are tenant-scoped to prevent cross-tenant cache leakage.

const tenantId = () => useTenantStore.getState().currentTenant?.id ?? "none";

const handleError = (err: unknown) => {
  const message =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong";
  toast.error(message);
};

export const useTasks = (projectId?: string, params: TaskListParams = {}) =>
  useQuery({
    queryKey: ["tasks", tenantId(), projectId, params],
    queryFn: () => tasksApi.list({ ...params, projectId }),
    enabled: !!projectId,
  });

export const useTask = (taskId?: string) =>
  useQuery({
    queryKey: ["task", tenantId(), taskId],
    queryFn: () => tasksApi.get(taskId),
    enabled: !!taskId,
  });

export const useTaskComments = (taskId?: string) =>
  useQuery({
    queryKey: ["task", tenantId(), taskId, "comments"],
    queryFn: () => tasksApi.comments(taskId),
    enabled: !!taskId,
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["tasks", tenantId()] });
      if (variables.projectId) {
        qc.invalidateQueries({ queryKey: ["project", tenantId(), variables.projectId, "dashboard"] });
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
        qc.invalidateQueries({ queryKey: ["task", tenantId(), id] });
        qc.invalidateQueries({ queryKey: ["task", tenantId(), id, "comments"] });
      }
      qc.invalidateQueries({ queryKey: ["tasks", tenantId()] });
      if (variables.projectId) {
        qc.invalidateQueries({ queryKey: ["project", tenantId(), variables.projectId, "dashboard"] });
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
      qc.invalidateQueries({ queryKey: ["tasks", tenantId()] });
      if (projectId) {
        qc.invalidateQueries({ queryKey: ["project", tenantId(), projectId, "dashboard"] });
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
        qc.invalidateQueries({ queryKey: ["task", tenantId(), taskId] });
        qc.invalidateQueries({ queryKey: ["tasks", tenantId()] });
      }
      toast.success("Assignee added");
    },
    onError: handleError,
  });
};

export const useAddComment = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { comment: string; parentId?: string; mentionIds?: string[] }) =>
      tasksApi.addComment(taskId, payload),
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: ["task", tenantId(), taskId, "comments"] });
      toast.success("Comment added");
    },
    onError: handleError,
  });
};

// Generic add-assignee used when the task id is only known after creation.
export const useAddAssigneeToTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      tasksApi.addAssignee(taskId, userId),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["task", tenantId(), v.taskId] });
      qc.invalidateQueries({ queryKey: ["tasks", tenantId()] });
    },
    onError: handleError,
  });
};

export const useMyTasks = (params: { page?: number; limit?: number; status?: string } = {}) =>
  useQuery({
    queryKey: ["my-tasks", tenantId(), params],
    queryFn: () => tasksApi.my(params),
  });

export const useRemoveAssignee = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      tasksApi.removeAssignee(taskId, userId, reason),
    onSuccess: () => {
      if (taskId) {
        qc.invalidateQueries({ queryKey: ["task", tenantId(), taskId] });
        qc.invalidateQueries({ queryKey: ["tasks", tenantId()] });
      }
      toast.success("Assignee removed");
    },
    onError: handleError,
  });
};

export const useUpdateComment = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, comment }: { commentId: string; comment: string }) =>
      tasksApi.updateComment(taskId, commentId, comment),
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: ["task", tenantId(), taskId, "comments"] });
      toast.success("Comment updated");
    },
    onError: handleError,
  });
};

export const useTaskActivity = (taskId?: string, params: { page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: ["task", tenantId(), taskId, "activity", params],
    queryFn: () => tasksApi.activity(taskId, params),
    enabled: !!taskId,
  });

export const useTimeEntries = (taskId?: string, params: { page?: number; limit?: number } = {}) =>
  useQuery({
    queryKey: ["task", tenantId(), taskId, "time-entries", params],
    queryFn: () => tasksApi.timeEntries(taskId, params),
    enabled: !!taskId,
  });

export const useStartTimer = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { startedAt?: string; description?: string } = {}) =>
      tasksApi.startTimer(taskId, payload),
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: ["task", tenantId(), taskId, "time-entries"] });
      toast.success("Timer started");
    },
    onError: handleError,
  });
};

export const useDeleteComment = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => tasksApi.deleteComment(taskId, commentId),
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: ["task", tenantId(), taskId, "comments"] });
      toast.success("Comment deleted");
    },
    onError: handleError,
  });
};

export const useStopTimer = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => tasksApi.stopTimer(entryId),
    onSuccess: (_data, entryId) => {
      if (taskId) qc.invalidateQueries({ queryKey: ["task", tenantId(), taskId, "time-entries"] });
      qc.invalidateQueries({ queryKey: ["task", tenantId()] });
      qc.invalidateQueries({ queryKey: ["time-entry", tenantId(), entryId] });
      toast.success("Timer stopped and hours logged");
    },
    onError: handleError,
  });
};

export const useDeleteTimeEntry = (taskId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => tasksApi.deleteTimeEntry(entryId),
    onSuccess: () => {
      if (taskId)
        qc.invalidateQueries({ queryKey: ["task", tenantId(), taskId, "time-entries"] });
      toast.success("Time entry deleted");
    },
    onError: handleError,
  });
};
