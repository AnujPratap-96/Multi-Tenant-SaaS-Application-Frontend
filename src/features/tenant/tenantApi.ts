import api from "@/lib/axios";
import type { Invite, InvitesResponse, Member, MembersResponse, Tenant } from "@/types/domain";

// F-02/F-11/F-12/F-13: tenant-scoped API surface (members, invites, settings).

export interface CreateTenantInput {
  name: string;
  plan?: string;
}

export interface UpdateTenantInput {
  name?: string;
  plan?: string;
}

export interface MemberUpdateInput {
  role?: string;
}

export interface MemberListParams {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
}

export interface InviteListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreateInviteInput {
  email: string;
  role: string;
}

export interface TenantSettings {
  allowPublicSignup?: boolean;
  defaultRole?: string;
  maxMembers?: number;
  [key: string]: unknown;
}

const unwrap = <T>(res: { data?: { data?: T } }): T | undefined => res.data?.data;

export const tenantApi = {
  list: () => api.get("/tenants/my").then((res) => unwrap<Tenant[]>(res) ?? []),

  get: (tenantId?: string) =>
    api.get(`/tenants/${tenantId}`).then((res) => unwrap<Tenant>(res) ?? null),

  create: (data: CreateTenantInput) =>
    api.post("/tenants", data).then((res) => unwrap<Tenant>(res) ?? null),

  update: (tenantId?: string, data: UpdateTenantInput = {}) =>
    api.patch(`/tenants/${tenantId}`, data).then((res) => unwrap<Tenant>(res) ?? null),

  remove: (tenantId?: string) => api.delete(`/tenants/${tenantId}`),

  settings: (tenantId?: string) =>
    api
      .get(`/tenants/${tenantId}/settings`)
      .then((res) => (res.data?.data as TenantSettings | undefined) ?? {}),

  updateSettings: (tenantId?: string, data: { settings: TenantSettings } = { settings: {} }) =>
    api.patch(`/tenants/${tenantId}/settings`, data),

  members: (tenantId?: string, params: MemberListParams = {}) =>
    api.get(`/tenants/${tenantId}/members`, { params }).then((res) => {
      const d = res.data?.data as
        | { members?: Member[]; total?: number; page?: number; totalPages?: number }
        | undefined;
      return {
        members: d?.members ?? [],
        total: d?.total ?? 0,
        pagination: {
          page: d?.page ?? 1,
          totalPages: d?.totalPages ?? 1,
          total: d?.total ?? 0,
        },
      } satisfies MembersResponse;
    }),

  updateMember: (tenantId?: string, userId?: string, data: MemberUpdateInput = {}) =>
    api.patch(`/tenants/${tenantId}/members/${userId}`, data),

  removeMember: (tenantId?: string, userId?: string) =>
    api.delete(`/tenants/${tenantId}/members/${userId}`),

  suspendMember: (tenantId?: string, userId?: string) =>
    api.post(`/tenants/${tenantId}/members/${userId}/suspend`),

  restoreMember: (tenantId?: string, userId?: string) =>
    api.post(`/tenants/${tenantId}/members/${userId}/restore`),

  invites: (tenantId?: string, params: InviteListParams = {}) =>
    api.get(`/tenants/${tenantId}/invites`, { params }).then((res) => {
      const d = res.data?.data as
        | { invites?: Invite[]; total?: number; page?: number; totalPages?: number }
        | undefined;
      return {
        invites: d?.invites ?? [],
        total: d?.total ?? 0,
        pagination: {
          page: d?.page ?? 1,
          totalPages: d?.totalPages ?? 1,
          total: d?.total ?? 0,
        },
      } satisfies InvitesResponse;
    }),

  createInvite: (tenantId?: string, data: CreateInviteInput = { email: "", role: "USER" }) =>
    api.post(`/tenants/${tenantId}/invites`, data),

  cancelInvite: (tenantId?: string, inviteId?: string) =>
    api.post(`/tenants/${tenantId}/invites/${inviteId}/cancel`),

  resendInvite: (tenantId?: string, inviteId?: string) =>
    api.post(`/tenants/${tenantId}/invites/${inviteId}/resend`),

  acceptInvite: (token: string) => api.post("/invites/accept", { token }),
};
