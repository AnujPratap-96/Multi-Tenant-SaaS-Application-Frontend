import api from "@/lib/axios";
import type { Department, DepartmentMember } from "@/types/domain";

// Department API surface (tenant-scoped via the axios tenant header).

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  managerId: string;
}

export interface AddMemberInput {
  userId: string;
  role?: "MANAGER" | "LEAD" | "MEMBER";
}

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  search?: string;
}

const unwrap = <T>(res: { data?: { data?: T } }): T | undefined => res.data?.data;

export const departmentsApi = {
  list: (params: DepartmentListParams = {}) =>
    api
      .get("/departments", { params })
      .then(
        (res) =>
          (unwrap<{ departments: Department[]; pagination: { total: number } }>(res) ?? {
            departments: [],
            pagination: { total: 0 },
          })
      ),

  get: (id?: string) => api.get(`/departments/${id}`).then((res) => unwrap<Department>(res) ?? null),

  create: (data: CreateDepartmentInput) =>
    api.post("/departments", data).then((res) => unwrap<Department>(res) ?? null),

  update: (id?: string, data: Partial<CreateDepartmentInput> = {}) =>
    api.patch(`/departments/${id}`, data).then((res) => unwrap<Department>(res) ?? null),

  remove: (id?: string) => api.delete(`/departments/${id}`),

  members: (id?: string, params: DepartmentListParams = {}) =>
    api
      .get(`/departments/${id}/members`, { params })
      .then(
        (res) =>
          (unwrap<{ members: DepartmentMember[]; pagination: { total: number } }>(res) ?? {
            members: [],
            pagination: { total: 0 },
          })
      ),

  addMember: (id?: string, data?: AddMemberInput) => api.post(`/departments/${id}/members`, data),

  removeMember: (id?: string, userId: string = "") =>
    api.delete(`/departments/${id}/members/${userId}`),
};
