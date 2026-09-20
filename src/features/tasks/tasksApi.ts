import api from "@/lib/axios";
import type { Task, TaskComment, TaskListResponse, TaskActivity, TimeEntry } from "@/types/domain";

// F-05/F-06: task API surface.

export interface CreateTaskInput {
  projectId?: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  status?: string;
  departmentIds?: string[];
  taskTypeId?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  statusNote?: string;
  dueDateNote?: string;
  blockedReason?: string;
  cancelledReason?: string;
};

export interface TaskListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;
}

export interface AddCommentInput {
  comment: string;
  parentId?: string;
  mentionIds?: string[];
}

const unwrap = <T>(res: { data?: { data?: T } }): T | undefined => res.data?.data;

export const tasksApi = {
  list: (params: TaskListParams = {}) =>
    api
      .get("/tasks", { params })
      .then(
        (res) =>
          (res.data?.data as TaskListResponse | undefined) ?? {
            tasks: [],
            pagination: { page: 1, totalPages: 1, total: 0 },
          }
      ),

  my: (params: { page?: number; limit?: number; status?: string } = {}) =>
    api
      .get("/tasks/my", { params })
      .then(
        (res) =>
          (res.data?.data as TaskListResponse | undefined) ?? {
            tasks: [],
            pagination: { page: 1, totalPages: 1, total: 0 },
          }
      ),

  get: (taskId?: string) =>
    api.get(`/tasks/${taskId}`).then((res) => unwrap<Task>(res) ?? null),

  comments: (taskId?: string) =>
    api
      .get(`/tasks/${taskId}/comments`)
      .then((res) => (unwrap<TaskComment[]>(res) ?? []) as TaskComment[]),

  activity: (taskId?: string, params: { page?: number; limit?: number } = {}) =>
    api
      .get(`/tasks/${taskId}/activity`, { params })
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        return (payload as { items: TaskActivity[]; total: number } | undefined) ?? { items: [], total: 0 };
      }),

  timeEntries: (taskId?: string, params: { page?: number; limit?: number } = {}) =>
    api
      .get(`/time-tracking/tasks/${taskId}/time-entries`, { params })
      .then((res) => {
        const payload = res.data?.data ?? res.data;
        return (payload as { items: TimeEntry[]; total: number } | undefined) ?? { items: [], total: 0 };
      }),

  create: (data: CreateTaskInput) =>
    api.post("/tasks", data).then((res) => unwrap<Task>(res) ?? null),

  update: (taskId?: string, data: UpdateTaskInput = {}) => {
    if (!taskId) throw new Error("Task id is required");
    return api.patch(`/tasks/${taskId}`, data).then((res) => unwrap<Task>(res) ?? null);
  },

  remove: (taskId: string) => api.delete(`/tasks/${taskId}`),

  addAssignee: (taskId?: string, userId: string = "") =>
    api.post(`/tasks/${taskId}/assignees`, { userId }),

  removeAssignee: (taskId?: string, userId: string = "", reason?: string) =>
    api.delete(`/tasks/${taskId}/assignees`, { data: { userId, reason } }),

  addComment: (taskId?: string, payload: AddCommentInput = { comment: "" }) =>
    api.post(`/tasks/${taskId}/comments`, payload),

  updateComment: (taskId?: string, commentId?: string, comment: string = "") =>
    api.patch(`/tasks/${taskId}/comments/${commentId}`, { comment }),

  deleteComment: (taskId?: string, commentId?: string) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),

  startTimer: (taskId?: string, payload: { startedAt?: string; description?: string } = {}) =>
    api.post(`/time-tracking/tasks/${taskId}/time-entries`, payload),

  stopTimer: (entryId?: string) =>
    api.patch(`/time-tracking/time-entries/${entryId}/stop`),

  deleteTimeEntry: (entryId?: string) => api.delete(`/time-tracking/time-entries/${entryId}`),
};
