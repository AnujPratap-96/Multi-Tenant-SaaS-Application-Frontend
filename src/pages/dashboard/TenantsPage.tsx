import { useState } from "react";
import { Plus, Building2, Trash2, Pencil, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { useDeleteTenant } from "@/features/tenant/tenantQueries";
import Badge from "@/components/ui/Badge";
import SearchInput from "@/components/ui/SearchInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
import CreateTenantModal from "./tenant/CreateTenantModal";
import EditTenantModal from "./tenant/EditTenantModal";
import type { Tenant } from "@/types/domain";

interface TenantCardProps {
  tenant: Tenant;
  isCurrent: boolean;
  onSwitch: (tenantId: string) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

function TenantCard({ tenant, isCurrent, onSwitch, onEdit, onDelete }: TenantCardProps) {
  return (
    <GlassCard
      className={`p-5 flex flex-col justify-between transition-all duration-300 ${
        isCurrent
          ? "border-brand-500/50 shadow-md shadow-brand-500/5 ring-1 ring-brand-500/20"
          : "hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm"
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm ${
                isCurrent
                  ? "bg-gradient-to-tr from-brand-600 to-indigo-600 text-white"
                  : "bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200"
              }`}
            >
              {tenant.name?.[0]?.toUpperCase() || "O"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-base text-neutral-900 dark:text-white truncate">{tenant.name}</p>
              <p className="text-xs font-mono text-neutral-400 truncate">/{tenant.slug}</p>
            </div>
          </div>
          {isCurrent ? (
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Active
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {tenant.plan || "Free"}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge label={tenant.plan || "Free"} variant="default" />
          <Badge
            label={tenant.isActive ? "Operational" : "Inactive"}
            variant={tenant.isActive ? "active" : "removed"}
          />
          {tenant.userRole && (
            <Badge
              label={tenant.userRole}
              variant={
                tenant.userRole === "admin" || tenant.userRole === "OWNER"
                  ? "admin"
                  : tenant.userRole === "manager"
                  ? "manager"
                  : "user"
              }
            />
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-white/5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(tenant)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
            title="Edit Organization"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(tenant)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete Organization"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {isCurrent ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Selected
          </span>
        ) : (
          <button
            onClick={() => onSwitch(tenant.id)}
            className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
          >
            Switch to Tenant <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </GlassCard>
  );
}

export default function TenantsPage() {
  const navigate = useNavigate();
  const { tenants, currentTenant, setCurrentTenant } = useTenantStore();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Tenant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null);

  const deleteMutation = useDeleteTenant(deleteTarget?.id);

  const filtered = search
    ? tenants.filter(
        (t) =>
          t.name?.toLowerCase().includes(search.toLowerCase()) ||
          t.slug?.toLowerCase().includes(search.toLowerCase())
      )
    : tenants;

  const handleSwitch = async (tenantId: string) => {
    await setCurrentTenant(tenantId);
    navigate("/dashboard");
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Organizations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage multi-tenant workspaces, isolation boundaries, and organization governance.
          </p>
        </div>
        <GlassButton variant="primary" size="md" onClick={() => setShowCreate(true)} className="shadow-sm">
          <Plus className="h-4 w-4 mr-1.5" />
          New Organization
        </GlassButton>
      </div>

      {/* Overview Metric Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Workspaces</p>
            <p className="text-xl font-black text-neutral-900 dark:text-white">{tenants.length}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Active Tenant</p>
            <p className="text-base font-bold text-neutral-900 dark:text-white truncate">
              {currentTenant?.name || "None Selected"}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Current Role</p>
            <p className="text-base font-bold text-neutral-900 dark:text-white">
              {currentTenant?.userRole || "Member"}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Search & Filtering */}
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by organization name or slug…"
          className="max-w-md w-full"
        />
        {tenants.length > 0 && (
          <span className="text-xs font-medium text-neutral-400 shrink-0 hidden sm:inline">
            Showing {filtered.length} of {tenants.length} organization{tenants.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <GlassCard className="p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-neutral-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">
              {search ? "No organizations match your search" : "No organizations yet"}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              {search
                ? "Try searching by another organization name or identifier"
                : "Create an organization to start collaborating with team members and deploying projects."}
            </p>
          </div>
          {!search && (
            <GlassButton variant="primary" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Organization
            </GlassButton>
          )}
        </GlassCard>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <TenantCard
              key={t.id}
              tenant={t}
              isCurrent={currentTenant?.id === t.id}
              onSwitch={handleSwitch}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateTenantModal open={showCreate} onClose={() => setShowCreate(false)} />

      <EditTenantModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        tenant={editTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Organization"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All isolated databases, users, and projects will be permanently archived.`}
        confirmLabel="Delete Organization"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
