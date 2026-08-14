import { test, expect } from "@playwright/test";

// Phase 4 smoke: the app shell boots and the landing page renders.
test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Task Manager/i);
});

// GuestRoute sends signed-out users to /login
test("unauthenticated /dashboard redirects to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
