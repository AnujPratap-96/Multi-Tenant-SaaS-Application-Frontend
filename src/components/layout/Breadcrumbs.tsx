import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTenantStore } from "../../features/tenant/tenantStore";
import { useProject } from "../../features/projects/projectsQueries";

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

function ProjectNameCrumb({ id }: { id: string }) {
  const { data: project } = useProject(id);
  return (
    <span className="text-text-primary font-medium truncate max-w-[180px]">
      {project?.name || "Details"}
    </span>
  );
}

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { currentTenant } = useTenantStore();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const isUuid = UUID_RE.test(seg);
    const isProjectId = isUuid && segments[i - 1] === "projects";
    return {
      seg,
      label: isUuid ? (isProjectId ? null : "Details") : formatLabel(seg),
      href: "/" + segments.slice(0, i + 1).join("/"),
      isLast: i === segments.length - 1,
      isProjectId,
    };
  });

  const tenantCrumb = currentTenant
    ? { seg: "tenant", label: currentTenant.name, href: "/dashboard", isLast: false, isProjectId: false }
    : null;

  const all = tenantCrumb ? [tenantCrumb, ...crumbs] : crumbs;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-text-muted min-w-0">
      {all.map((crumb, idx) => {
        const isLast = idx === all.length - 1;
        return (
          <Fragment key={crumb.href + idx}>
            {!isLast ? (
              <>
                {crumb.isProjectId ? (
                  <ProjectNameCrumb id={crumb.seg} />
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-accent-cyan transition-colors truncate max-w-[180px]"
                  >
                    {crumb.label}
                  </Link>
                )}
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
              </>
            ) : crumb.isProjectId ? (
              <ProjectNameCrumb id={crumb.seg} />
            ) : (
              <span className={cn("text-text-primary font-medium truncate max-w-[180px]")}>
                {crumb.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
