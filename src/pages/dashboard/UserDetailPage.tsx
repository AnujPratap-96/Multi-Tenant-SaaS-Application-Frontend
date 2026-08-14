import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  Monitor,
  Smartphone,
  Shield,
  LogOut,
  UserX,
} from "lucide-react";
import api from "@/lib/axios";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import PageLoader from "@/components/ui/PageLoader";
import { toast } from "sonner";

interface Session {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string;
  revokedAt?: string;
  isRevoked?: boolean;
}

interface UserDetail {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  membershipRole?: string;
  membershipStatus?: string;
  isActive?: boolean;
  joinedAt?: string;
  lastLoginAt?: string;
  sessions?: Session[];
}

function SessionIcon({ ua }: { ua?: string }) {
  const lower = (ua || "").toLowerCase();
  if (lower.includes("mobile") || lower.includes("iphone") || lower.includes("android"))
    return <Smartphone className="h-4 w-4" />;
  if (lower.includes("tablet") || lower.includes("ipad")) return <Monitor className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

function parseDevice(ua?: string) {
  if (!ua) return "Unknown device";
  const match = ua.match(/\(([^)]+)\)/);
  return match ? match[1].split(";")[0].trim() : ua.split("/")[0] || "Unknown";
}

function UserSessions({
  sessions,
  onRevoke,
}: {
  sessions: Session[];
  onRevoke: (sessionId: string) => void;
}) {
  const active = sessions.filter((s) => !s.isRevoked);
  const revoked = sessions.filter((s) => s.isRevoked);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Active Sessions ({active.length})
      </h3>
      {active.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No active sessions.</p>
      ) : (
        <div className="space-y-2">
          {active.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                  <SessionIcon ua={s.userAgent} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {parseDevice(s.userAgent)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {s.ipAddress || "Unknown IP"} ·{" "}
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRevoke(s.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                title="Revoke session"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {revoked.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white pt-2">
            Revoked Sessions ({revoked.length})
          </h3>
          <div className="space-y-2 opacity-60">
            {revoked.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800"
              >
                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <SessionIcon ua={s.userAgent} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {parseDevice(s.userAgent)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Revoked {s.revokedAt ? new Date(s.revokedAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery<UserDetail>({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await api.get(`/users/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/users/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      setRevokeTarget(null);
      toast.success("Session revoked");
    },
    onError: (err: unknown) => {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Failed to revoke session"
      );
    },
  });

  if (isLoading) return <PageLoader />;
  if (!user) {
    return (
      <div className="text-center py-16">
        <UserX className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User not found</h2>
        <p className="text-sm text-gray-500 mt-1">
          This user doesn't exist or has been removed.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => navigate("/dashboard/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <button
        onClick={() => navigate("/dashboard/users")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-2xl flex-shrink-0">
            {(user.firstName?.[0] || user.email[0]).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "Unnamed User"}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </div>
              </div>
              <Badge
                label={user.membershipRole}
                variant={(user.membershipRole as BadgeVariant) ?? "default"}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined{" "}
                {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "—"}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Last login{" "}
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
              </div>
              <Badge
                label={
                  user.membershipStatus === "suspended"
                    ? "Suspended"
                    : user.isActive
                      ? "Active"
                      : "Inactive"
                }
                variant={
                  user.membershipStatus === "suspended"
                    ? "suspended"
                    : user.isActive
                      ? "active"
                      : "removed"
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sessions */}
      {user.sessions && user.sessions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <UserSessions
            sessions={user.sessions}
            onRevoke={(sessionId) => setRevokeTarget(sessionId)}
          />
        </div>
      )}

      {/* Revoke Confirm */}
      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => revokeTarget && revokeMutation.mutate(revokeTarget)}
        title="Revoke Session"
        description="This will log the user out of this session. They will need to sign in again."
        confirmLabel="Revoke"
        isLoading={revokeMutation.isPending}
      />
    </div>
  );
}
