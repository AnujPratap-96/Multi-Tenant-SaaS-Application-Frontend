import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { GuestRoute, ProtectedRoute, TenantRoute } from "./guards";
import { ErrorBoundary } from "@/components/guards/ErrorBoundary";
import AuthLayout from "@/layouts/AuthLayout";
import AppLayout from "@/components/layout/AppLayout";
import PageLoader from "@/components/ui/PageLoader";

// F-18: single route config; pages are thin, lazy-loaded route components.

const withLoader = (node: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{node}</Suspense>
);

const Landing = lazy(() => import("@/pages/Landing"));
const AcceptInvitePage = lazy(() => import("@/pages/AcceptInvitePage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const VerifyOtp = lazy(() => import("@/pages/auth/VerifyOtp"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const SetPassword = lazy(() => import("@/pages/auth/SetPassword"));

const DashboardHome = lazy(() => import("@/pages/dashboard/DashboardHome"));
const TenantsPage = lazy(() => import("@/pages/dashboard/TenantsPage"));
const ProjectsPage = lazy(() => import("@/pages/dashboard/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("@/pages/dashboard/ProjectDetailPage"));
const TasksPage = lazy(() => import("@/pages/dashboard/TasksPage"));
const TeamPage = lazy(() => import("@/pages/dashboard/TeamPage"));
const UsersPage = lazy(() => import("@/pages/dashboard/UsersPage"));
const UserDetailPage = lazy(() => import("@/pages/dashboard/UserDetailPage"));
const ProfilePage = lazy(() => import("@/pages/dashboard/ProfilePage"));
const RolesPage = lazy(() => import("@/pages/dashboard/RolesPage"));
const AuditLogsPage = lazy(() => import("@/pages/dashboard/AuditLogsPage"));
const SettingsPage = lazy(() => import("@/pages/dashboard/SettingsPage"));

// eslint-disable-next-line react-refresh/only-export-components
export const routes = [
  {
    path: "/",
    element: withLoader(<Landing />),
  },
  {
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { path: "/login", element: withLoader(<Login />) },
      { path: "/signup", element: withLoader(<Signup />) },
      { path: "/verify-otp", element: withLoader(<VerifyOtp />) },
      { path: "/forgot-password", element: withLoader(<ForgotPassword />) },
      { path: "/reset-password", element: withLoader(<ResetPassword />) },
      { path: "/set-password", element: withLoader(<SetPassword />) },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <TenantRoute>
          <AppLayout />
        </TenantRoute>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withLoader(<DashboardHome />) },
      { path: "tenants", element: withLoader(<TenantsPage />) },
      { path: "projects", element: withLoader(<ProjectsPage />) },
      { path: "projects/:id", element: withLoader(<ProjectDetailPage />) },
      { path: "tasks", element: withLoader(<TasksPage />) },
      { path: "team", element: withLoader(<TeamPage />) },
      { path: "users", element: withLoader(<UsersPage />) },
      { path: "users/:id", element: withLoader(<UserDetailPage />) },
      { path: "profile", element: withLoader(<ProfilePage />) },
      { path: "roles", element: withLoader(<RolesPage />) },
      { path: "audit-logs", element: withLoader(<AuditLogsPage />) },
      { path: "settings", element: withLoader(<SettingsPage />) },
    ],
  },
  {
    path: "/invite/accept",
    element: (
      <ProtectedRoute>
        {withLoader(<AcceptInvitePage />)}
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: withLoader(<NotFound />),
  },
];

export function AppRouter() {
  const router = createBrowserRouter(routes);
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default AppRouter;
