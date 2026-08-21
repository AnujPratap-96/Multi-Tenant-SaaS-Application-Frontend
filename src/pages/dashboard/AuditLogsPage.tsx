import { useState, useCallback, useMemo, useEffect } from "react";
import { Select } from "@/components/ui/Select";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Download,
  List,
  Timeline as TimelineIcon,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  Globe,
  Monitor,
  Calendar,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";
import api from "@/lib/axios";
import Pagination from "@/components/ui/Pagination";
import PageLoader from "@/components/ui/PageLoader";
import { Button } from "@/components/ui/Button";

// ─── Helpers ──────────────────────────────────────────────────

interface AuditActor {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actor?: AuditActor;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination?: { page: number; totalPages: number; total: number };
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Created", UPDATE: "Updated", DELETE: "Deleted",
  INVITE: "Invited", REMOVE: "Removed", LOGIN: "Logged in", LOGOUT: "Logged out",
  PASSWORD_RESET: "Reset password", PASSWORD_CHANGE: "Changed password", PASSWORD_SET: "Set password",
  ROLE_CHANGE: "Changed role",
  ADD_MEMBER: "Added member", REMOVE_MEMBER: "Removed member",
  SUSPEND_MEMBER: "Suspended member", RESTORE_MEMBER: "Restored member",
  SWITCH_TENANT: "Switched tenant", RESTORE: "Restored",
  INVITE_ACCEPTED: "Accepted invite", INVITE_REJECTED: "Rejected invite",
  INVITE_CANCELLED: "Cancelled invite", INVITE_RESENT: "Resent invite",
  PROJECT_CREATE: "Created project", PROJECT_UPDATE: "Updated project",
  PROJECT_DELETE: "Deleted project", PROJECT_ARCHIVE: "Archived project",
  PROJECT_MEMBER_ADD: "Added project member", PROJECT_MEMBER_REMOVE: "Removed project member",
  PROJECT_MEMBER_UPDATE: "Updated project member",
  TASK_CREATE: "Created task", TASK_UPDATE: "Updated task",
  TASK_DELETE: "Deleted task", TASK_STATUS_CHANGE: "Changed task status",
  TASK_ASSIGNEE_ADD: "Added assignee", TASK_ASSIGNEE_REMOVE: "Removed assignee",
  TASK_COMMENT_ADD: "Added comment", TASK_COMMENT_DELETE: "Deleted comment",
};

const ENTITY_COLORS: Record<string, string> = {
  USER: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  TENANT: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  PROJECT: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  TASK: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  COMMENT: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  SESSION: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
};

interface OptionDef {
  value: string;
  label: string;
  disabled?: boolean;
}

const ENTITY_OPTIONS: OptionDef[] = [
  { value: "", label: "All Entities" },
  { value: "USER", label: "User" },
  { value: "TENANT", label: "Tenant" },
  { value: "PROJECT", label: "Project" },
  { value: "TASK", label: "Task" },
  { value: "COMMENT", label: "Comment" },
  { value: "SESSION", label: "Session" },
];

const ACTION_GROUPS: OptionDef[] = [
  { label: "All Actions", value: "" },
  { label: "── Auth ──", value: "__group", disabled: true },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "PASSWORD_CHANGE", label: "Password Change" },
  { value: "PASSWORD_RESET", label: "Password Reset" },
  { value: "PASSWORD_SET", label: "Password Set" },
  { label: "── Members ──", value: "__group2", disabled: true },
  { value: "ADD_MEMBER", label: "Add Member" },
  { value: "REMOVE_MEMBER", label: "Remove Member" },
  { value: "SUSPEND_MEMBER", label: "Suspend Member" },
  { value: "RESTORE_MEMBER", label: "Restore Member" },
  { value: "ROLE_CHANGE", label: "Role Change" },
  { label: "── Project ──", value: "__group3", disabled: true },
  { value: "PROJECT_CREATE", label: "Create" },
  { value: "PROJECT_UPDATE", label: "Update" },
  { value: "PROJECT_DELETE", label: "Delete" },
  { value: "PROJECT_ARCHIVE", label: "Archive" },
  { label: "── Task ──", value: "__group4", disabled: true },
  { value: "TASK_CREATE", label: "Create" },
  { value: "TASK_UPDATE", label: "Update" },
  { value: "TASK_DELETE", label: "Delete" },
  { value: "TASK_STATUS_CHANGE", label: "Status Change" },
  { value: "TASK_ASSIGNEE_ADD", label: "Add Assignee" },
  { value: "TASK_ASSIGNEE_REMOVE", label: "Remove Assignee" },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString();
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatInputDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

// ─── Log Row ────────────────────────────────────────────────

function LogRow({
  log,
  isExpanded,
  onToggle,
}: {
  log: AuditLog;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const actorName = log.actor
    ? `${log.actor.firstName || ""} ${log.actor.lastName || ""}`.trim() ||
      log.actor.email ||
      "System"
    : "System";

  const hasDetails = log.oldValue || log.newValue || log.ipAddress || log.userAgent;

  return (
    <>
      <tr
        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
        onClick={hasDetails ? onToggle : undefined}
      >
        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap w-16">
          <span title={formatFullDate(log.createdAt)}>{formatTime(log.createdAt)}</span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-xs flex-shrink-0">
              {actorName[0]?.toUpperCase() || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                {actorName}
              </p>
              {log.actor?.email && (
                <p className="text-xs text-gray-400 truncate max-w-[160px]">{log.actor.email}</p>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {ACTION_LABELS[log.action] || log.action}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              ENTITY_COLORS[log.entityType] || "bg-gray-100 dark:bg-gray-800 text-gray-600"
            }`}
          >
            {log.entityType}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <span className="text-xs text-gray-400 font-mono">
            {log.entityId ? `${log.entityId.slice(0, 4)}…` : "—"}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          {hasDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50/50 dark:bg-gray-800/20">
          <td colSpan={6} className="px-4 py-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {log.ipAddress && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Globe className="h-3.5 w-3.5" /> {log.ipAddress}
                </div>
              )}
              {log.userAgent && (
                <div className="flex items-center gap-1.5 text-gray-500 col-span-2">
                  <Monitor className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate" title={log.userAgent}>
                    {log.userAgent}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock className="h-3.5 w-3.5" /> {formatFullDate(log.createdAt)}
              </div>
              {log.oldValue ? (
                <div className="col-span-full mt-1">
                  <p className="text-gray-400 font-medium mb-1">Previous value:</p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-600 dark:text-gray-400 overflow-x-auto max-h-24">
                    {JSON.stringify(log.oldValue, null, 2)}
                  </pre>
                </div>
              ) : null}
              {log.newValue ? (
                <div className="col-span-full mt-1">
                  <p className="text-gray-400 font-medium mb-1">New value:</p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-600 dark:text-gray-400 overflow-x-auto max-h-24">
                    {JSON.stringify(log.newValue, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Timeline Card ──────────────────────────────────────────

function TimelineCard({ log }: { log: AuditLog }) {
  const actorName = log.actor
    ? `${log.actor.firstName || ""} ${log.actor.lastName || ""}`.trim() ||
      log.actor.email ||
      "System"
    : "System";

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      <div className="absolute left-3 top-1.5 w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-white dark:ring-gray-950 z-10" />
      <div className="absolute left-[17px] top-4 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{actorName}</span>
              <span className="text-xs text-gray-500">{formatFullDate(log.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              <span className="font-medium">{ACTION_LABELS[log.action] || log.action}</span>{" "}
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                  ENTITY_COLORS[log.entityType] || ""
                }`}
              >
                {log.entityType}
              </span>
              {log.entityId && (
                <code className="ml-1 text-xs text-gray-400 font-mono">
                  ({log.entityId.slice(0, 4)}…)
                </code>
              )}
            </p>
          </div>
        </div>

        {(log.ipAddress || log.userAgent) && (
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {log.ipAddress && <span>IP: {log.ipAddress}</span>}
            {log.userAgent && (
              <span className="truncate" title={log.userAgent}>
                {log.userAgent.split("/")[0] || log.userAgent}
              </span>
            )}
          </div>
        )}

        {(log.oldValue || log.newValue) ? (
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {log.oldValue ? (
                <div>
                  <p className="text-gray-400 mb-0.5">Before</p>
                  <pre className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded text-gray-500 overflow-x-auto max-h-16">
                    {JSON.stringify(log.oldValue)}
                  </pre>
                </div>
              ) : null}
              {log.newValue ? (
                <div>
                  <p className="text-gray-400 mb-0.5">After</p>
                  <pre className="bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded text-gray-500 overflow-x-auto max-h-16">
                    {JSON.stringify(log.newValue)}
                  </pre>
                </div>
              ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

type ViewMode = "table" | "timeline";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [entityType, setEntityType] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(t);
  }, [debouncedSearch, entityType, action, startDate, endDate]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (entityType) params.set("entityType", entityType);
    if (action) params.set("action", action);
    if (startDate) params.set("startDate", new Date(startDate).toISOString());
    if (endDate) {
      const d = new Date(endDate);
      d.setHours(23, 59, 59, 999);
      params.set("endDate", d.toISOString());
    }
    return params.toString();
  }, [page, debouncedSearch, entityType, action, startDate, endDate]);

  const { data, isLoading, isError, refetch } = useQuery<AuditLogsResponse>({
    queryKey: ["audit-logs", queryParams],
    queryFn: async () => {
      const res = await api.get(`/audit-logs?${queryParams}`);
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });

  const groupedByDate = (() => {
    if (!data?.logs) return [] as [string, AuditLog[]][];
    const groups: Record<string, AuditLog[]> = {};
    data.logs.forEach((log) => {
      const key = new Date(log.createdAt).toLocaleDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });
    return Object.entries(groups);
  })();

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleExport = async () => {
    try {
      const res = await api.get(`/audit-logs/export?${queryParams}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setEntityType("");
    setAction("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasFilters = entityType || action || debouncedSearch || startDate || endDate;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enterprise-grade activity tracking for your organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 text-sm transition-colors ${
                viewMode === "table"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`p-2 text-sm transition-colors ${
                viewMode === "timeline"
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-900 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Timeline view"
            >
              <TimelineIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by entity ID, actor email, IP…"
              className="w-full pl-9 pr-8 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            {ENTITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </Select>

          <Select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition min-w-[140px]"
          >
            {ACTION_GROUPS.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </Select>

          <input
            type="datetime-local"
            value={formatInputDate(startDate)}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            title="Start date"
          />
          <input
            type="datetime-local"
            value={formatInputDate(endDate)}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
            title="End date"
          />

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 h-9 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12">
          <PageLoader />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
          <p className="text-gray-900 dark:text-white font-medium">Failed to load audit logs</p>
          <p className="text-sm text-gray-500 mt-1">Check your connection and try again.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Retry
          </Button>
        </div>
      ) : !data?.logs?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-900 dark:text-white font-medium">No audit logs found</p>
          <p className="text-sm text-gray-500 mt-1">
            {hasFilters
              ? "Try adjusting your filters."
              : "Activity will appear here as your team uses the platform."}
          </p>
        </div>
      ) : viewMode === "table" ? (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                      Time
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actor
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ref
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10" />
                  </tr>
                </thead>
                <tbody>
                  {data.logs.map((log) => (
                    <LogRow
                      key={log.id}
                      log={log}
                      isExpanded={!!expandedRows[log.id]}
                      onToggle={() => toggleRow(log.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.pagination && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onChange={setPage}
            />
          )}
        </>
      ) : (
        <>
          {/* Timeline View */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            {groupedByDate.map(([date, logs]) => (
              <div key={date} className="mb-6 last:mb-0">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {date === new Date().toLocaleDateString() ? "Today" : date}
                  <span className="text-gray-300 dark:text-gray-600 font-normal">
                    ({logs.length} event{logs.length > 1 ? "s" : ""})
                  </span>
                </h3>
                {logs.map((log) => (
                  <TimelineCard key={log.id} log={log} />
                ))}
              </div>
            ))}
          </div>

          {data.pagination && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
