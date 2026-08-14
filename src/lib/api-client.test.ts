import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import apiClient, {
  resetCsrfToken,
  setOnForbidden,
  setTenantHeader,
} from "./api-client";

const API = "*/api/v1";

describe("api-client", () => {
  beforeEach(() => {
    resetCsrfToken();
    setOnForbidden(null);
    setTenantHeader(null);
  });

  it("attaches tenant header + CSRF token to mutating requests", async () => {
    let seen: Record<string, unknown> = {};
    server.use(
      http.post(`${API}/test-mutation`, async ({ request }) => {
        seen = {
          tenant: request.headers.get("x-tenant-id"),
          csrf: request.headers.get("x-csrf-token"),
        };
        return HttpResponse.json({ data: { ok: true } });
      })
    );

    setTenantHeader("tenant-1");
    await apiClient.post("/test-mutation");

    expect(seen.tenant).toBe("tenant-1");
    expect(seen.csrf).toBe("test-csrf-token");
  });

  it("does not attach CSRF token to GET requests", async () => {
    let seenCsrf: string | null = "unset";
    server.use(
      http.get(`${API}/test-get`, ({ request }) => {
        seenCsrf = request.headers.get("x-csrf-token");
        return HttpResponse.json({ data: [] });
      })
    );
    await apiClient.get("/test-get");
    expect(seenCsrf).toBeNull();
  });

  it("refreshes once on 401 and retries the original request", async () => {
    let meCalls = 0;
    let refreshCalls = 0;
    server.use(
      http.get(`${API}/users/me`, () => {
        meCalls += 1;
        return meCalls === 1
          ? new HttpResponse(null, { status: 401 })
          : HttpResponse.json({ data: { id: "u1" } });
      }),
      http.post(`${API}/auth/refresh-token`, () => {
        refreshCalls += 1;
        return HttpResponse.json({ data: { ok: true } });
      })
    );

    const res = await apiClient.get("/users/me");
    expect(res.data.data.id).toBe("u1");
    expect(meCalls).toBe(2);
    expect(refreshCalls).toBe(1);
  });

  it("fires onForbidden only after a 403 survives the CSRF retry", async () => {
    const forbidden = vi.fn();
    setOnForbidden(forbidden);

    server.use(
      http.post(`${API}/test-403`, () => new HttpResponse(null, { status: 403 }))
    );

    await expect(apiClient.post("/test-403")).rejects.toThrow();
    expect(forbidden).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, url: "/test-403" })
    );
  });
});
