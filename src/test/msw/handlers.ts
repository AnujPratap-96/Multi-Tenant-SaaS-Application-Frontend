import { http, HttpResponse } from "msw";

const API = "*/api/v1";

export const handlers = [
  http.get(`${API}/csrf-token`, () =>
    HttpResponse.json({ data: { token: "test-csrf-token" } })
  ),
  http.post(`${API}/auth/refresh-token`, () =>
    HttpResponse.json({ data: { ok: true } })
  ),
  http.get(`${API}/tenants/my`, () =>
    HttpResponse.json({
      data: [
        { id: "tenant-1", name: "Acme", slug: "acme", role: "ADMIN", status: "ACTIVE" },
        { id: "tenant-2", name: "Globex", slug: "globex", role: "USER", status: "ACTIVE" },
      ],
    })
  ),
  http.get(`${API}/rbac/my`, () =>
    HttpResponse.json({ data: { permissions: ["project:create", "task:create"], role: "ADMIN" } })
  ),
  http.get(`${API}/users/me`, () =>
    HttpResponse.json({
      data: { id: "user-1", email: "a@b.com", firstName: "A", lastName: "B" },
    })
  ),
];
