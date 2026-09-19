import api from "@/lib/axios";
import type { User } from "@/types/domain";

export const authApi = {
  logout: () => api.post("/auth/logout"),
  me: () => api.get<{ data?: User }>("/users/me", { skipAuthRedirect: true }),
};
