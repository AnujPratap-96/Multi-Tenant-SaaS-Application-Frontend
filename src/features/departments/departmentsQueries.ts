import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { departmentsApi, type CreateDepartmentInput, type AddMemberInput } from "./departmentsApi";
import { useTenantStore } from "@/features/tenant/tenantStore";

// Department query + mutation hooks. C7: tenant-scoped cache keys.

const tenantId = () => useTenantStore.getState().currentTenant?.id ?? "none";

const handleError = (err: unknown) => {
  const message =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong";
  toast.error(message);
};

export const useDepartments = (params: { page?: number; limit?: number; search?: string } = {}) =>
  useQuery({
    queryKey: ["departments", tenantId(), params],
    queryFn: () => departmentsApi.list(params),
  });

export const useDepartment = (id?: string) =>
  useQuery({
    queryKey: ["department", tenantId(), id],
    queryFn: () => departmentsApi.get(id),
    enabled: !!id,
  });

export const useDepartmentMembers = (id?: string, params: { page?: number; limit?: number; search?: string } = {}) =>
  useQuery({
    queryKey: ["department", tenantId(), id, "members", params],
    queryFn: () => departmentsApi.members(id, params),
    enabled: !!id,
  });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDepartmentInput) => departmentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments", tenantId()] });
      toast.success("Department created");
    },
    onError: handleError,
  });
};

export const useUpdateDepartment = (id?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateDepartmentInput>) => departmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments", tenantId()] });
      qc.invalidateQueries({ queryKey: ["department", tenantId(), id] });
      toast.success("Department updated");
    },
    onError: handleError,
  });
};

export const useDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments", tenantId()] });
      toast.success("Department deleted");
    },
    onError: handleError,
  });
};

export const useAddDepartmentMember = (id?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemberInput) => departmentsApi.addMember(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["department", tenantId(), id, "members"] });
      qc.invalidateQueries({ queryKey: ["departments", tenantId()] });
      toast.success("Member added");
    },
    onError: handleError,
  });
};

export const useRemoveDepartmentMember = (id?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => departmentsApi.removeMember(id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["department", tenantId(), id, "members"] });
      qc.invalidateQueries({ queryKey: ["departments", tenantId()] });
      toast.success("Member removed");
    },
    onError: handleError,
  });
};
