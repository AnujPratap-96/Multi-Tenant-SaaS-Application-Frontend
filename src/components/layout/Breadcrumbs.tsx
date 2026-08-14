import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  tenants: "Organizations",
  projects: "Projects",
  tasks: "Tasks",
  team: "Team",
  roles: "Roles",
  settings: "Settings",
  "audit-logs": "Audit Logs",
};

function formatLabel(seg: string): string {
  if (UUID_RE.test(seg)) return "Details";
  return LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => ({
    label: formatLabel(seg),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
      {crumbs.map((crumb) => (
        <Fragment key={crumb.href}>
          {!crumb.isLast ? (
            <>
              <Link
                to={crumb.href}
                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {crumb.label}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            </>
          ) : (
            <span className={cn("text-gray-900 dark:text-gray-100 font-medium")}>{crumb.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
