import { useState } from "react";
import { Building2, Users, Mail, Trash2, Plus, Pencil, type LucideIcon } from "lucide-react";
import { useTenant, useDeleteTenant } from "@/features/tenant/tenantQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { usePermissionStore } from "@/features/auth/permissionStore";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import MembersTable from "./tenant/MembersTable";
import InvitesTable from "./tenant/InvitesTable";
import InviteMemberModal from "./tenant/InviteMemberModal";
import EditTenantModal from "./tenant/EditTenantModal";
import TenantSettingsForm from "./tenant/TenantSettingsForm";
import { cn } from "@/lib/utils";

interface TabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
}

const TABS: TabDef[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "members", label: "Members", icon: Users },
  { id: "invites", label: "Invites", icon: Mail },
  { id: "danger", label: "Danger Zone", icon: Trash2, danger: true },
];

export default function SettingsPage() {
  const { currentTenant } = useTenantStore();
  const { role } = usePermissionStore();
  const isAdmin = role === "admin" || role === "OWNER";

  const [tab, setTab] = useState("general");
  const [showInvite, setShowInvite] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { data: tenant } = useTenant(currentTenant?.id);
  const deleteTenant = useDeleteTenant(currentTenant?.id);

  const visibleTabs = TABS.filter((t) => {
    if (t.id === "danger") return isAdmin;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your organization settings, members, and invitations
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
            <Button size="sm" onClick={() => setShowInvite(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Invite Member
            </Button>
          </div>
        )}
      </div>

      {/* Tenant card */}
      {tenant && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {tenant.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white">{tenant.name}</p>
            <p className="text-xs text-gray-500">/{tenant.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={tenant.plan} variant="default" />
            <Badge
              label={tenant.isActive ? "Active" : "Inactive"}
              variant={tenant.isActive ? "active" : "removed"}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-1 -mb-px">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                tab === t.id
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                t.danger && tab !== t.id && "hover:text-red-500"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {tab === "general" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Organization Settings
            </h3>
            <TenantSettingsForm />
          </div>
        )}

        {tab === "members" && <MembersTable />}

        {tab === "invites" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Manage pending and sent invitations</p>
              {isAdmin && (
                <Button size="sm" onClick={() => setShowInvite(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Invite Member
                </Button>
              )}
            </div>
            <InvitesTable />
          </div>
        )}

        {tab === "danger" && isAdmin && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900/50 p-6 space-y-4">
            <h3 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Delete organization
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Permanently delete this organization and all its data. This action cannot be
                  undone.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDelete(true)}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 flex-shrink-0 ml-4"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <InviteMemberModal open={showInvite} onClose={() => setShowInvite(false)} />
      <EditTenantModal open={showEdit} onClose={() => setShowEdit(false)} tenant={tenant} />
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteTenant.mutate(undefined, { onSuccess: () => setShowDelete(false) })}
        title="Delete organization"
        description={`Are you sure you want to delete "${tenant?.name}"? All data will be permanently removed.`}
        confirmLabel="Delete Organization"
        isLoading={deleteTenant.isPending}
      />
    </div>
  );
}
