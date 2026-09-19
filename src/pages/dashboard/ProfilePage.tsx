import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Lock,
  Monitor,
  Smartphone,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/features/auth/authStore";
import { useTenantStore } from "@/features/tenant/tenantStore";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import type { ApiError } from "@/types/domain";

interface ProfileForm {
  firstName: string;
  lastName: string;
  displayName: string;
  jobTitle: string;
  bio: string;
  timezone: string;
  locale: string;
  avatarUrl: string;
}

interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Session {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string;
  expiresAt?: string | null;
  isRevoked?: boolean;
}

const errorMessage = (err: unknown, fallback: string) =>
  (err as ApiError)?.response?.data?.message ?? fallback;

function ProfileSection() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    displayName: "",
    jobTitle: "",
    bio: "",
    timezone: "",
    locale: "",
    avatarUrl: "",
  });

  const [prevUserId, setPrevUserId] = useState<string | null>(null);
  if (authUser?.id !== prevUserId) {
    setPrevUserId(authUser?.id ?? null);
    if (authUser) {
      setForm({
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        displayName: authUser.displayName || "",
        jobTitle: authUser.jobTitle || "",
        bio: authUser.bio || "",
        timezone: authUser.timezone || "",
        locale: authUser.locale || "",
        avatarUrl: authUser.avatarUrl || "",
      });
    }
  }

  const mutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const res = await api.patch("/users/me", { ...data, tenantId: currentTenant?.id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Profile updated");
    },
    onError: (err: unknown) => {
      toast.error(errorMessage(err, "Failed to update profile"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      displayName: form.displayName.trim(),
      jobTitle: form.jobTitle.trim(),
      bio: form.bio.trim(),
      timezone: form.timezone.trim(),
      locale: form.locale.trim(),
      avatarUrl: form.avatarUrl.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name
          </label>
          <Input
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="First name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name
          </label>
          <Input
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            placeholder="Last name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Display Name
        </label>
        <Input
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          placeholder="How your name appears to others"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Job Title {currentTenant ? <span className="text-gray-400">(in this workspace)</span> : null}
        </label>
        <Input
          value={form.jobTitle}
          onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
          placeholder="e.g. Frontend Engineer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="A short bio…"
          rows={3}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Timezone
          </label>
          <Input
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
            placeholder="e.g. America/New_York"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Locale
          </label>
          <Input
            value={form.locale}
            onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))}
            placeholder="e.g. en-US"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Avatar URL
        </label>
        <Input
          value={form.avatarUrl}
          onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
          placeholder="https://…"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <Input
          value={authUser?.email || ""}
          disabled
          className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
      </div>

      <div className="pt-2">
        <Button type="submit" isLoading={mutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        {mutation.isSuccess && (
          <span className="ml-3 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4 inline mr-1" />
            Profile updated
          </span>
        )}
      </div>
    </form>
  );
}

function ChangePasswordSection() {
  const [form, setForm] = useState<PasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: { old_password: string; new_password: string }) => {
      const res = await api.post("/auth/change-password", data);
      return res.data;
    },
    onSuccess: () => {
      setSuccess("Password changed successfully");
      setError("");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed");
    },
    onError: (err: unknown) => {
      const message = errorMessage(err, "Failed to change password");
      setError(message);
      setSuccess("");
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    mutation.mutate({
      old_password: form.oldPassword,
      new_password: form.newPassword,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm border border-green-100 dark:border-green-900/30 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Current Password
        </label>
        <PasswordInput
          value={form.oldPassword}
          onChange={(e) => setForm((f) => ({ ...f, oldPassword: e.target.value }))}
          placeholder="Enter current password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New Password
        </label>
        <PasswordInput
          value={form.newPassword}
          onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm New Password
        </label>
        <PasswordInput
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          placeholder="Re-enter new password"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" isLoading={mutation.isPending}>
          <Lock className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </div>
    </form>
  );
}

function SessionsSection() {
  const queryClient = useQueryClient();
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null);

  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["my-sessions"],
    queryFn: async () => {
      const res = await api.get("/users/me/sessions");
      return res.data.data;
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/users/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
      setRevokeTarget(null);
      toast.success("Session revoked");
    },
    onError: (err: unknown) => {
      toast.error(errorMessage(err, "Failed to revoke session"));
    },
  });

  if (isLoading) return <PageLoader />;

  const active = (sessions || []).filter((s) => !s.isRevoked);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        You have <strong className="text-gray-900 dark:text-white">{active.length}</strong> active
        session{active.length !== 1 ? "s" : ""}.
      </p>

      {active.length === 0 ? (
        <p className="text-sm text-gray-400">No active sessions found.</p>
      ) : (
        <div className="space-y-2">
          {active.map((s) => {
            const ua = (s.userAgent || "").toLowerCase();
            const isMobile =
              ua.includes("mobile") || ua.includes("iphone") || ua.includes("android");
            return (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                    {isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {s.userAgent ? s.userAgent.split("/")[0] || "Browser" : "Unknown device"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.ipAddress || "Unknown IP"} ·{" "}
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                      {s.expiresAt && ` · Expires ${new Date(s.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRevokeTarget(s.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                  title="Revoke session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => revokeTarget && revokeMutation.mutate(revokeTarget)}
        title="Revoke Session"
        description="This will sign this device out. You will need to sign in again on that device."
        confirmLabel="Revoke"
        isLoading={revokeMutation.isPending}
      />
    </div>
  );
}

interface TabDef {
  id: string;
  label: string;
  icon: LucideIcon;
}

export default function ProfilePage() {
  const [tab, setTab] = useState("profile");

  const tabs: TabDef[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "sessions", label: "Sessions", icon: Monitor },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal information and security settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {tab === "profile" && <ProfileSection />}
        {tab === "password" && <ChangePasswordSection />}
        {tab === "sessions" && <SessionsSection />}
      </div>
    </div>
  );
}
