import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import type { ReactNode } from "react";
import { ProtectedRoute, GuestRoute } from "./guards";
import { useAuthStore } from "@/features/auth/authStore";

function renderAtLogin(element: ReactNode) {
  const router = createMemoryRouter(
    [
      { path: "/login", element },
      { path: "/dashboard", element: <div>dashboard-page</div> },
      { path: "*", element: <div>fallback</div> },
    ],
    { initialEntries: ["/login"] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

function renderAtDashboard(element: ReactNode) {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <div>login-page</div> },
      { path: "/dashboard", element },
      { path: "*", element: <div>fallback</div> },
    ],
    { initialEntries: ["/dashboard"] }
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("route guards (F-18)", () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false, user: null });
  });

  it("redirects unauthenticated users to /login with ?redirect=", () => {
    const router = renderAtDashboard(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(router.state.location.search).toContain("redirect=");
  });

  it("renders children when authenticated", () => {
    useAuthStore.setState({ isAuthenticated: true });
    renderAtDashboard(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("secret")).toBeInTheDocument();
  });

  it("GuestRoute redirects authenticated users away from auth pages", () => {
    useAuthStore.setState({ isAuthenticated: true });
    const router = renderAtLogin(
      <GuestRoute>
        <div>login-form</div>
      </GuestRoute>
    );
    expect(screen.queryByText("login-form")).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/dashboard");
  });

  it("GuestRoute renders the form for guests", () => {
    renderAtLogin(
      <GuestRoute>
        <div>login-form</div>
      </GuestRoute>
    );
    expect(screen.getByText("login-form")).toBeInTheDocument();
  });
});
