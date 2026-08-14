import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  projectsApi,
  type CreateProjectInput,
  type ProjectListParams,
  type UpdateProjectInput,
} from "./projectsApi";

// F-03/F-04: project query + mutation hooks. Mutations with optional ids
// guard their invalidations so they are safe with undefined project ids.

const handleError = (err: unknown) => {
  const message =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong";
  toast.error(message);
};

export const useProjects = (params: ProjectListParams = {}) =>
  useQuery({
    queryKey: ["projects", params],
    queryFn: () => projectsApi.list(params),
  });

export const useProject = (projectId?: string) =>
  useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.get(projectId),
    enabled: !!projectId,
  });

export const useProjectDashboard = (projectId?: string) =>
  useQuery({
    queryKey: ["project", projectId, "dashboard"],
    queryFn: () => projectsApi.dashboard(projectId),
    enabled: !!projectId,
  });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
    },
    onError: handleError,
  });
};

export const useUpdateProject = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectInput) => projectsApi.update(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      if (projectId) {
        qc.invalidateQueries({ queryKey: ["project", projectId] });
        qc.invalidateQueries({ queryKey: ["project", projectId, "dashboard"] });
      }
      toast.success("Project updated");
    },
    onError: handleError,
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectsApi.remove(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: handleError,
  });
};

// ─── Project members ─────────────────────────────────────────────

export const useAddMember = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; role: string }) =>
      projectsApi.addMember(projectId, payload),
    onSuccess: () => {
      if (projectId) {
        qc.invalidateQueries({ queryKey: ["project", projectId] });
        qc.invalidateQueries({ queryKey: ["project", projectId, "dashboard"] });
      }
      toast.success("Member added");
    },
    onError: handleError,
  });
};

export const useUpdateMemberRole = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; role: string }) =>
      projectsApi.updateMemberRole(projectId, payload.userId, payload.role),
    onSuccess: () => {
      if (projectId) qc.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member role updated");
    },
    onError: handleError,
  });
};

export const useRemoveMember = (projectId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      if (projectId) {
        qc.invalidateQueries({ queryKey: ["project", projectId] });
        qc.invalidateQueries({ queryKey: ["project", projectId, "dashboard"] });
      }
      toast.success("Member removed");
    },
    onError: handleError,
  });
};
