import api from "@/lib/axios";
import type { Task, TaskComment, TaskListResponse } from "@/types/domain";

// F-05/F-06: task API surface.

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  status?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;
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

  get: (taskId?: string) =>
    api.get(`/tasks/${taskId}`).then((res) => unwrap<Task>(res) ?? null),

  comments: (taskId?: string) =>
    api
      .get(`/tasks/${taskId}/comments`)
      .then((res) => (unwrap<TaskComment[]>(res) ?? []) as TaskComment[]),

  create: (data: CreateTaskInput) =>
    api.post("/tasks", data).then((res) => unwrap<Task>(res) ?? null),

  update: (taskId?: string, data: UpdateTaskInput = {}) => {
    if (!taskId) throw new Error("Task id is required");
    return api.patch(`/tasks/${taskId}`, data).then((res) => unwrap<Task>(res) ?? null);
  },

  remove: (taskId: string) => api.delete(`/tasks/${taskId}`),

  addAssignee: (taskId?: string, userId: string = "") =>
    api.post(`/tasks/${taskId}/assignees`, { userId }),

  addComment: (taskId?: string, comment: string = "") =>
    api.post(`/tasks/${taskId}/comments`, { comment }),
};
