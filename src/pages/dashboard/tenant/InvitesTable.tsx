import { useState } from "react";
import { RotateCcw, XCircle } from "lucide-react";
import { useInvites, useCancelInvite, useResendInvite } from "@/features/tenant/tenantQueries";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { usePermissionStore } from "@/features/auth/permissionStore";
import Badge from "@/components/ui/Badge";
import SearchInput from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

export default function InvitesTable() {
  const { currentTenant } = useTenantStore();
  const { role } = usePermissionStore();
  const canManage = role === "ADMIN" || role === "OWNER";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const LIMIT = 10;

  const params = { page, limit: LIMIT, ...(statusFilter && { status: statusFilter }) };
  const { data, isLoading, isFetching } = useInvites(currentTenant?.id, params);
  const cancel = useCancelInvite(currentTenant?.id ?? "");
  const resend = useResendInvite(currentTenant?.id ?? "");

  const invites = data?.invites ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const filtered = search
    ? invites.filter((i) => i.email?.toLowerCase().includes(search.toLowerCase()))
    : invites;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by email…"
          className="sm:w-64"
        />
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      <div
        className={cn(
          "rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900",
          isFetching && "opacity-70"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Sent</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Expires</th>
                {canManage && <th className="px-4 py-3 w-24" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: canManage ? 6 : 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-4 py-10 text-center text-gray-400">
                    No invites found
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{inv.email}</td>
                    <td className="px-4 py-3">
                      <Badge label={inv.role} variant={inv.role === "admin"
                        ? "admin"
                        : inv.role === "manager"
                          ? "manager"
                          : "user"} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={inv.status}
                        variant={inv.status === "PENDING"
                          ? "pending"
                          : inv.status === "ACCEPTED"
                            ? "accepted"
                            : inv.status === "REJECTED"
                              ? "rejected"
                              : "cancelled"} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        {inv.status === "PENDING" && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => resend.mutate(inv.id)}
                              disabled={resend.isPending}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-600 transition-colors"
                              title="Resend"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setCancelTarget(inv.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 transition-colors"
                              title="Cancel"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (cancelTarget) cancel.mutate(cancelTarget);
          setCancelTarget(null);
        }}
        title="Cancel invite"
        description="This will revoke the invite link. The recipient won't be able to join using it."
        confirmLabel="Cancel Invite"
        isLoading={cancel.isPending}
      />
    </div>
  );
}
