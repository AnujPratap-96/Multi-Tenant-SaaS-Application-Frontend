import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  tenantApi,
  type CreateInviteInput,
  type CreateTenantInput,
  type InviteListParams,
  type MemberListParams,
  type MemberUpdateInput,
  type TenantSettings,
  type UpdateTenantInput,
} from "./tenantApi";
import { useTenantStore } from "./tenantStore";

// F-02/F-11/F-12/F-13: tenant-scoped query + mutation hooks.
// All hooks accept an optional tenantId and no-op safely when absent.

const handleError = (err: unknown) => {
  const message =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong";
  toast.error(message);
};

// ─── Tenant (org) CRUD ───────────────────────────────────────────

export const useTenant = (tenantId?: string) =>
  useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: () => tenantApi.get(tenantId),
    enabled: !!tenantId,
  });

export const useCreateTenant = () => {
  const qc = useQueryClient();
  const fetchTenants = useTenantStore((s) => s.fetchTenants);
  const setCurrentTenant = useTenantStore((s) => s.setCurrentTenant);
  return useMutation({
    mutationFn: (data: CreateTenantInput) => tenantApi.create(data),
    onSuccess: async (tenant) => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      await fetchTenants();
      if (tenant?.id) {
        await setCurrentTenant(tenant.id);
      }
      toast.success("Organization created");
    },
    onError: handleError,
  });
};

export const useUpdateTenant = (tenantId?: string) => {
  const qc = useQueryClient();
  const fetchTenants = useTenantStore((s) => s.fetchTenants);
  return useMutation({
    mutationFn: (data: UpdateTenantInput) => tenantApi.update(tenantId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant", tenantId] });
      fetchTenants();
      toast.success("Organization updated");
    },
    onError: handleError,
  });
};

export const useDeleteTenant = (tenantId?: string) => {
  const qc = useQueryClient();
  const clearTenants = useTenantStore((s) => s.clearTenants);
  return useMutation({
    mutationFn: () => {
      if (!tenantId) return Promise.resolve(null);
      return tenantApi.remove(tenantId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      if (tenantId) clearTenants();
      toast.success("Organization deleted");
    },
    onError: handleError,
  });
};

// ─── Settings ────────────────────────────────────────────────────

export const useTenantSettings = (tenantId?: string) =>
  useQuery({
    queryKey: ["tenant", tenantId, "settings"],
    queryFn: () => tenantApi.settings(tenantId),
    enabled: !!tenantId,
  });

export const useUpdateSettings = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { settings: TenantSettings }) => tenantApi.updateSettings(tenantId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenant", tenantId, "settings"] });
      qc.invalidateQueries({ queryKey: ["tenant", tenantId] });
      toast.success("Settings saved");
    },
    onError: handleError,
  });
};

// ─── Members ─────────────────────────────────────────────────────

export const useMembers = (tenantId?: string, params: MemberListParams = {}) =>
  useQuery({
    queryKey: ["tenants", tenantId, "members", params],
    queryFn: () => tenantApi.members(tenantId, params),
    enabled: !!tenantId,
  });

export const useUpdateMember = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; data: MemberUpdateInput }) =>
      tenantApi.updateMember(tenantId, payload.userId, payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants", tenantId, "members"] });
      toast.success("Member updated");
    },
    onError: handleError,
  });
};

export const useRemoveMember = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => tenantApi.removeMember(tenantId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants", tenantId, "members"] });
      toast.success("Member removed");
    },
    onError: handleError,
  });
};

export const useSuspendMember = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => tenantApi.suspendMember(tenantId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants", tenantId, "members"] });
      toast.success("Member suspended");
    },
    onError: handleError,
  });
};

export const useRestoreMember = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => tenantApi.restoreMember(tenantId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants", tenantId, "members"] });
      toast.success("Member restored");
    },
    onError: handleError,
  });
};

// ─── Invites ─────────────────────────────────────────────────────

export const useInvites = (tenantId?: string, params: InviteListParams = {}) =>
  useQuery({
    queryKey: ["tenants", tenantId, "invites", params],
    queryFn: () => tenantApi.invites(tenantId, params),
    enabled: !!tenantId,
  });

export const useCreateInvite = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInviteInput) => tenantApi.createInvite(tenantId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants", tenantId, "invites"] });
      qc.invalidateQueries({ queryKey: ["tenants", tenantId, "members"] });
      toast.success("Invite sent");
    },
    onError: handleError,
  });
};

export const useCancelInvite = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => tenantApi.cancelInvite(tenantId, inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants", tenantId, "invites"] });
      toast.success("Invite cancelled");
    },
    onError: handleError,
  });
};

export const useResendInvite = (tenantId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => tenantApi.resendInvite(tenantId, inviteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tenants", tenantId, "invites"] });
      toast.success("Invite resent");
    },
    onError: handleError,
  });
};

export const useAcceptInvite = () => {
  const qc = useQueryClient();
  const fetchTenants = useTenantStore((s) => s.fetchTenants);
  const setCurrentTenant = useTenantStore((s) => s.setCurrentTenant);
  return useMutation({
    mutationFn: (token: string) => tenantApi.acceptInvite(token),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["tenants"] });
      await fetchTenants();
      const state = useTenantStore.getState();
      if (state.tenants[0]) await setCurrentTenant(state.tenants[0].id);
      toast.success("Invite accepted");
    },
    onError: handleError,
  });
};
