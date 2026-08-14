import { useState } from "react";
import { Plus, Building2, Trash2, Pencil, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { useDeleteTenant } from "@/features/tenant/tenantQueries";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {tenant.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{tenant.name}</p>
            <p className="text-xs text-gray-400 truncate">/{tenant.slug}</p>
          </div>
        </div>
        {isCurrent && (
          <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
            Current
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge label={tenant.plan} variant="default" />
        <Badge
          label={tenant.isActive ? "Active" : "Inactive"}
          variant={tenant.isActive ? "active" : "removed"}
        />
        {tenant.userRole && (
          <Badge
            label={tenant.userRole}
            variant={tenant.userRole === "admin"
              ? "admin"
              : tenant.userRole === "manager"
                ? "manager"
                : "user"}
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(tenant)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(tenant)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {!isCurrent && (
          <button
            onClick={() => onSwitch(tenant.id)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
          >
            Switch <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organizations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage all organizations you belong to
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Organization
        </Button>
      </div>

      {/* Search */}
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search organizations…"
        className="max-w-xs"
      />

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {search ? "No organizations match your search" : "No organizations yet"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {search ? "Try a different name or slug" : "Create your first organization to get started"}
            </p>
          </div>
          {!search && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create Organization
            </Button>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Stats bar */}
      {tenants.length > 0 && (
        <p className="text-xs text-gray-400">
          {tenants.length} organization{tenants.length !== 1 ? "s" : ""} total
          {search && filtered.length !== tenants.length && ` · ${filtered.length} shown`}
        </p>
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
        title="Delete organization"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Organization"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
