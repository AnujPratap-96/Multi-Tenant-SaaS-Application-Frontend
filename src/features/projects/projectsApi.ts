import api from "@/lib/axios";
import type {
  Project,
  ProjectListResponse,
  ProjectMember,
} from "@/types/domain";

// F-03/F-04: project API surface.

export interface CreateProjectInput {
  name: string;
  description?: string;
  departmentIds?: string[];
}

export type UpdateProjectInput = CreateProjectInput;

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  isArchived?: boolean;
}

export interface ProjectDashboard {
  stats?: {
    totalTasks?: number;
    memberCount?: number;
    taskStats?: Record<string, number>;
  };
  userRole?: string;
  [key: string]: unknown;
}

const unwrap = <T>(res: { data?: { data?: T } }): T | undefined => res.data?.data;

export const projectsApi = {
  list: (params: ProjectListParams = {}) =>
    api
      .get("/projects", { params })
      .then(
        (res) =>
          (res.data?.data as ProjectListResponse | undefined) ?? {
            projects: [],
            pagination: { page: 1, totalPages: 1, total: 0 },
          }
      ),

  get: (projectId?: string) =>
    api.get(`/projects/${projectId}`).then((res) => unwrap<Project>(res) ?? null),

  create: (data: CreateProjectInput) =>
    api.post("/projects", data).then((res) => unwrap<Project>(res) ?? null),

  update: (projectId?: string, data: UpdateProjectInput = { name: "" }) =>
    api.patch(`/projects/${projectId}`, data).then((res) => unwrap<Project>(res) ?? null),

  remove: (projectId: string) => api.delete(`/projects/${projectId}`),

  dashboard: (projectId?: string) =>
    api
      .get(`/projects/${projectId}/dashboard`)
      .then((res) => (unwrap<ProjectDashboard>(res) ?? {}) as ProjectDashboard),

  members: (projectId?: string) =>
    api
      .get(`/projects/${projectId}/members`)
      .then((res) => (unwrap<ProjectMember[]>(res) ?? []) as ProjectMember[]),

  addMember: (projectId?: string, payload: { userId: string; role: string } = { userId: "", role: "MEMBER" }) =>
    api.post(`/projects/${projectId}/members`, payload),

  updateMemberRole: (projectId?: string, userId?: string, role: string = "MEMBER") =>
    api.patch(`/projects/${projectId}/members/${userId}`, { role }),

  removeMember: (projectId?: string, userId?: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
};
