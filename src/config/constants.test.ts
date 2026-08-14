import { describe, expect, it } from "vitest";
import { QUERY_KEYS } from "@/config/constants";

// S-15 regression: every entity key MUST be tenant-scoped
describe("query keys", () => {
  it("scopes projects/tasks/users/settings by tenantId", () => {
    expect(QUERY_KEYS.projects("t1")).toEqual(["tenants", "t1", "projects", {}]);
    expect(QUERY_KEYS.tasks("t1", "p1")).toEqual(["tenants", "t1", "projects", "p1", "tasks", {}]);
    expect(QUERY_KEYS.users("t1")).toEqual(["tenants", "t1", "users", {}]);
    expect(QUERY_KEYS.settings("t1")).toEqual(["tenants", "t1", "settings"]);
    expect(QUERY_KEYS.permissions("t1")).toEqual(["rbac", "my", "t1"]);
  });

  it("produces distinct keys for different tenants", () => {
    expect(QUERY_KEYS.projects("t1")).not.toEqual(QUERY_KEYS.projects("t2"));
  });
});
