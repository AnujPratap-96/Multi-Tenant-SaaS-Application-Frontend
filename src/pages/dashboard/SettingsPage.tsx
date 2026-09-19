import { useState } from "react";
import { Building2, Users, Mail, Trash2, Plus, Pencil, ShieldAlert, CheckCircle2, type LucideIcon } from "lucide-react";
import { useTenant, useDeleteTenant } from "@/features/tenant/tenantQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { usePermissionStore } from "@/features/auth/permissionStore";
import Badge from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GlassCard } from "@/components/glass/GlassCard";
import { GlassButton } from "@/components/glass/GlassButton";
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
  { id: "general", label: "Organization Info", icon: Building2 },
  { id: "members", label: "Team Members", icon: Users },
  { id: "invites", label: "Pending Invites", icon: Mail },
  { id: "danger", label: "Security & Danger", icon: Trash2, danger: true },
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Configure organization branding, user access tiers, member invitations, and compliance boundaries.
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <GlassButton variant="outline" size="sm" onClick={() => setShowEdit(true)} className="font-semibold">
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Profile
            </GlassButton>
            <GlassButton variant="primary" size="sm" onClick={() => setShowInvite(true)} className="font-semibold shadow-sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Invite Member
            </GlassButton>
          </div>
        )}
      </div>

      {/* Tenant Identity Hero Card */}
      {tenant && (
        <GlassCard className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-brand-500/20">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-md ring-2 ring-white/10">
              {tenant.name?.[0]?.toUpperCase() || "N"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-lg text-neutral-900 dark:text-white truncate">{tenant.name}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Operational
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400">/{tenant.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge label={tenant.plan || "Free"} variant="default" />
            <Badge
              label={tenant.isActive ? "Active Tenant" : "Inactive"}
              variant={tenant.isActive ? "active" : "removed"}
            />
          </div>
        </GlassCard>
      )}

      {/* Modern Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 dark:border-white/10 pb-2">
        <nav className="flex gap-2 flex-wrap">
          {visibleTabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  isActive
                    ? t.danger
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-xs"
                      : "bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5",
                  t.danger && !isActive && "hover:text-rose-500"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Panels */}
      <div>
        {tab === "general" && (
          <GlassCard className="p-6">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-4">
              Organization Metadata & Branding
            </h3>
            <TenantSettingsForm />
          </GlassCard>
        )}

        {tab === "members" && <MembersTable />}

        {tab === "invites" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-neutral-500">
                Track pending invites sent to teammates and contractors
              </p>
              {isAdmin && (
                <GlassButton size="sm" variant="primary" onClick={() => setShowInvite(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Invite Member
                </GlassButton>
              )}
            </div>
            <InvitesTable />
          </div>
        )}

        {tab === "danger" && isAdmin && (
          <GlassCard className="p-6 border-rose-500/30 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-rose-600 dark:text-rose-400 text-base">Danger Zone</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Destructive actions requiring high-privilege administrative verification
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-t border-rose-500/10">
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  Permanently Delete Organization
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 max-w-lg">
                  Permanently delete this organization, all project boards, tasks, stored documents, and user
                  associations. This action is irreversible.
                </p>
              </div>
              <GlassButton
                variant="danger"
                size="sm"
                onClick={() => setShowDelete(true)}
                className="flex-shrink-0 font-bold"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Organization
              </GlassButton>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Modals */}
      <InviteMemberModal open={showInvite} onClose={() => setShowInvite(false)} />
      <EditTenantModal open={showEdit} onClose={() => setShowEdit(false)} tenant={tenant} />
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteTenant.mutate(undefined, { onSuccess: () => setShowDelete(false) })}
        title="Delete Organization"
        description={`Are you sure you want to delete "${tenant?.name}"? All projects, tasks, and data will be permanently purged.`}
        confirmLabel="Delete Organization"
        isLoading={deleteTenant.isPending}
      />
    </div>
  );
}
