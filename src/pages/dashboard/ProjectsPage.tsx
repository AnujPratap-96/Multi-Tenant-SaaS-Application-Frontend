import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  Edit,
  Trash2,
  Users,
  AlignLeft,
  Archive,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/projectsQueries";
import { useDepartments } from "@/features/departments/departmentsQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import PageLoader from "@/components/ui/PageLoader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Project } from "@/types/domain";

const FORM_DEFAULTS = { name: "", description: "", departmentIds: [] as string[] };

const FILTER_OPTIONS: { value: boolean; label: string; icon: LucideIcon }[] = [
  { value: false, label: "Active", icon: RotateCcw },
  { value: true, label: "Archived", icon: Archive },
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isArchived, setIsArchived] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: departmentsData } = useDepartments({ limit: 100 });

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((archived: boolean) => {
    setIsArchived(archived);
    setPage(1);
  }, []);

  const params = { page, limit: 20, search: debouncedSearch || undefined, isArchived };
  const { data, isLoading } = useProjects(params);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject(editing?.id);
  const deleteProject = useDeleteProject();

  const openCreate = () => {
    setEditing(null);
    setForm(FORM_DEFAULTS);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description || "",
      departmentIds: (project.departments ?? []).map((d) => d.departmentId),
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = "Project name is required";
    else if (form.name.trim().length < 3) errs.name = "Name must be at least 3 characters";
    if (!editing && (!form.departmentIds || form.departmentIds.length === 0))
      errs.departments = "Select at least one department";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      ...(editing ? {} : { departmentIds: form.departmentIds }),
    };
    if (editing) {
      updateProject.mutate(payload, {
        onSuccess: () => {
          setModalOpen(false);
          setEditing(null);
        },
      });
    } else {
      createProject.mutate(payload, {
        onSuccess: (project) => {
          setModalOpen(false);
          navigate(`/dashboard/projects/${project?.id ?? ""}`);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProject.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  const projects = data?.projects ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        {!isArchived && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" /> New Project
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search projects..."
          className="w-72"
        />
        <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
          {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => handleFilterChange(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isArchived === value
                  ? value
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 shadow-sm"
                    : "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        {pagination.total > 0 && (
          <span className="text-sm text-gray-400 ml-auto">
            {pagination.total} project{pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <FolderKanban className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
            {search ? "No matching projects" : isArchived ? "No archived projects" : "No projects yet"}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {search
              ? "Try a different search term."
              : isArchived
                ? "Archived projects will appear here."
                : "Create your first project to get started."}
          </p>
          {!isArchived && !search && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const counts = (project._count as { members?: number; tasks?: number } | undefined) ?? {};
            return (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1">
                    {project.name}
                  </h3>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(project);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(project);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {project.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {counts.members ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <AlignLeft className="h-3.5 w-3.5" />
                    {counts.tasks ?? 0} task{counts.tasks !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Project" : "Create Project"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter project name"
              error={errors.name}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the project"
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors"
            />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Departments <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {(departmentsData?.departments ?? []).length === 0 && (
                  <p className="text-xs text-gray-400">Create a department first</p>
                )}
                {(departmentsData?.departments ?? []).map((d) => {
                  const active = form.departmentIds.includes(d.id);
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          departmentIds: active
                            ? f.departmentIds.filter((x) => x !== d.id)
                            : [...f.departmentIds, d.id],
                        }))
                      }
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        active
                          ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
              {errors.departments && (
                <p className="text-xs text-red-500 mt-1">{errors.departments}</p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createProject.isPending || updateProject.isPending}>
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteProject.isPending}
      />
    </div>
  );
}
