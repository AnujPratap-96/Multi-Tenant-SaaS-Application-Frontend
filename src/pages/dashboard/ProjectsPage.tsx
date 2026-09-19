import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FolderKanban,
  Edit,
  Trash2,
  Users,
  Archive,
  RotateCcw,
  Search,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from "lucide-react";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/projectsQueries";
import { useDepartments } from "@/features/departments/departmentsQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";
import PageLoader from "@/components/ui/PageLoader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Project } from "@/types/domain";

const FORM_DEFAULTS = { name: "", description: "", departmentIds: [] as string[] };

const PROJECT_GRADIENTS = [
  "from-accent-cyan to-accent-blue",
  "from-accent-blue to-accent-indigo",
  "from-accent-indigo to-accent-violet",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
];

function getProjectGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROJECT_GRADIENTS.length;
  return PROJECT_GRADIENTS[index];
}

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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((archived: boolean) => {
    setIsArchived(archived);
    setPage(1);
  }, []);

  const params = { page, limit: 12, search: debouncedSearch || undefined, isArchived };
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
  const departments = departmentsData?.departments ?? [];

  return (
    <div className="space-y-6 max-w-full pb-10">
      {/* ============================================================
          PAGE HEADER
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass p-6 rounded-2xl border-glass-border/60 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-1">
            <FolderKanban className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Workspace Hub</span>
            <span>•</span>
            <span className="text-accent-cyan font-mono">{pagination.total} Total</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-text-primary tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Organize teams, sprint tasks, and roadmap deliverables
          </p>
        </div>

        {!isArchived && (
          <GlassButton
            variant="primary"
            size="md"
            onClick={openCreate}
            className="font-bold shadow-md shadow-accent-cyan/20 self-start sm:self-auto"
            leadingIcon={<Plus className="h-4 w-4" />}
          >
            New Project
          </GlassButton>
        )}
      </div>

      {/* ============================================================
          FILTER & SEARCH TOOLBAR
          ============================================================ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search projects by name..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl glass border-glass-border/60 focus:border-accent-cyan/60 text-text-primary placeholder:text-text-muted focus:outline-none transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-xl glass border-glass-border/60">
            <button
              onClick={() => handleFilterChange(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isArchived
                  ? "bg-accent-cyan text-midnight-950 font-bold shadow"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Active
            </button>
            <button
              onClick={() => handleFilterChange(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isArchived
                  ? "bg-warning-500 text-midnight-950 font-bold shadow"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              Archived
            </button>
          </div>
        </div>

        {pagination.total > 0 && (
          <span className="text-xs font-mono text-text-muted self-end sm:self-auto">
            Showing {projects.length} of {pagination.total}
          </span>
        )}
      </div>

      {/* ============================================================
          PROJECTS GRID
          ============================================================ */}
      {isLoading ? (
        <PageLoader />
      ) : projects.length === 0 ? (
        <GlassCard variant="strong" padding="lg" className="text-center py-16">
          <FolderKanban className="h-12 w-12 mx-auto text-accent-cyan/30 mb-4" />
          <h3 className="text-base font-bold text-text-primary">
            {search ? "No matching projects found" : isArchived ? "No archived projects" : "No projects in this organization"}
          </h3>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
            {search
              ? "Try adjusting your search criteria"
              : isArchived
              ? "Archived projects will be displayed here"
              : "Create your first project to start organizing tasks and collaborating"}
          </p>
          {!isArchived && !search && (
            <div className="mt-6">
              <GlassButton variant="primary" size="sm" onClick={openCreate} leadingIcon={<Plus className="h-4 w-4" />}>
                Create Your First Project
              </GlassButton>
            </div>
          )}
        </GlassCard>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {projects.map((project) => {
              const counts = (project._count as { members?: number; tasks?: number } | undefined) ?? {};
              const memberCount = project.members?.length ?? counts.members ?? 1;
              const taskCount = counts.tasks ?? 0;
              const gradient = getProjectGradient(project.name);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard
                    variant="elevated"
                    padding="none"
                    className="h-full flex flex-col justify-between overflow-hidden border-glass-border/60 hover:border-accent-cyan/40 transition-all glow-border-interactive group cursor-pointer"
                    onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  >
                    {/* Card Body */}
                    <div className="p-5 flex-1">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base shadow flex-shrink-0`}>
                            {project.name[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-base text-text-primary group-hover:text-accent-cyan transition-colors truncate">
                              {project.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted">
                              <Calendar className="h-3 w-3" />
                              {project.createdAt ? new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Active"}
                            </span>
                          </div>
                        </div>

                        {/* Hover Action Menu */}
                        <div
                          className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openEdit(project)}
                            className="p-1.5 rounded-lg glass hover:bg-tint text-text-muted hover:text-text-primary transition-colors"
                            title="Edit Project"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(project)}
                            className="p-1.5 rounded-lg glass hover:bg-danger-500/15 text-text-muted hover:text-danger-400 transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed">
                        {project.description || "No description provided for this workspace."}
                      </p>

                      {/* Departments Tags */}
                      {project.departments && project.departments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.departments.slice(0, 2).map((d) => (
                            <span
                              key={d.departmentId}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-surface-900 text-text-secondary border border-glass-border"
                            >
                              {d.department?.name || "Dept"}
                            </span>
                          ))}
                          {project.departments.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-text-muted">
                              +{project.departments.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Metrics */}
                    <div className="px-5 py-3 border-t border-glass-border/40 bg-surface-950/40 flex items-center justify-between text-xs text-text-muted">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-accent-cyan" />
                          <span className="font-semibold text-text-primary">{memberCount}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent-blue" />
                          <span className="font-semibold text-text-primary">{taskCount}</span> tasks
                        </span>
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-semibold text-accent-cyan group-hover:translate-x-0.5 transition-transform">
                        Open Workspace <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
      )}

      {/* ============================================================
          CREATE / EDIT MODAL
          ============================================================ */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Project Workspace" : "Create New Project"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Project Name *
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Core Infrastructure v2.0"
              error={errors.name}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Outline project objectives, milestones, and scope..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl glass border-glass-border/60 focus:border-accent-cyan/60 text-text-primary placeholder:text-text-muted focus:outline-none text-sm transition-all resize-none"
            />
          </div>

          {!editing && departments.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Assign Departments *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 glass rounded-xl border border-glass-border/60 scrollbar-thin">
                {departments.map((dept) => {
                  const isChecked = form.departmentIds.includes(dept.id);
                  return (
                    <label
                      key={dept.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                        isChecked ? "bg-accent-cyan/15 text-accent-cyan font-bold" : "hover:bg-tint text-text-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setForm((prev) => ({
                            ...prev,
                            departmentIds: isChecked
                              ? prev.departmentIds.filter((id) => id !== dept.id)
                              : [...prev.departmentIds, dept.id],
                          }));
                        }}
                        className="rounded border-glass-border text-accent-cyan focus:ring-accent-cyan"
                      />
                      <span className="truncate">{dept.name}</span>
                    </label>
                  );
                })}
              </div>
              {errors.departments && (
                <p className="text-xs text-danger-400 mt-1">{errors.departments}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-glass-border/40">
            <GlassButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={createProject.isPending || updateProject.isPending}
              className="font-bold shadow"
            >
              {createProject.isPending || updateProject.isPending
                ? "Saving..."
                : editing
                ? "Update Project"
                : "Create Project"}
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project Workspace"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All associated tasks and assignments will be archived.`}
        confirmLabel="Delete Project"
        isLoading={deleteProject.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
