import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Circle, Clock, CheckCircle2, AlertCircle, Ban, Inbox } from "lucide-react";
import { useMyTasks, useUpdateTask } from "@/features/tasks/tasksQueries";
import { Select } from "@/components/ui/Select";
import PageLoader from "@/components/ui/PageLoader";
import Pagination from "@/components/ui/Pagination";
import type { Task } from "@/types/domain";

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"];
const STATUS_META: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  TODO: { label: "To Do", icon: Circle, color: "text-gray-400" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-500" },
  IN_REVIEW: { label: "In Review", icon: AlertCircle, color: "text-purple-500" },
  BLOCKED: { label: "Blocked", icon: AlertCircle, color: "text-red-500" },
  DONE: { label: "Done", icon: CheckCircle2, color: "text-green-500" },
  CANCELLED: { label: "Cancelled", icon: Ban, color: "text-gray-400" },
};

export default function MyTasksPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useMyTasks({
    page,
    limit: 20,
    ...(statusFilter && { status: statusFilter }),
  });
  const updateTask = useUpdateTask();

  const tasks: Task[] = data?.tasks ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary-500" /> My Tasks
        </h1>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <Inbox className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">You have no assigned tasks</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Task</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.map((task) => {
                const meta = STATUS_META[task.status ?? "TODO"];
                const Icon = meta.icon;
                return (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/tasks/${task.id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </td>
                     <td className="px-4 py-3">
                       <div className="flex items-center gap-1.5">
                         <Icon className={"h-3.5 w-3.5 " + meta.color} />
                         <Select
                           value={task.status ?? "TODO"}
                           onChange={(e) => updateTask.mutate({ id: task.id, status: e.target.value, projectId: task.projectId })}
                           className="text-xs font-medium rounded-lg px-2 py-1 border focus:outline-none cursor-pointer"
                         >
                         {STATUS_OPTIONS.map((s) => (
                           <option key={s} value={s}>{STATUS_META[s].label}</option>
                         ))}
                       </Select>
                       </div>
                     </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{task.priority || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pagination && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <Pagination page={page} totalPages={pagination.totalPages || 1} onChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
