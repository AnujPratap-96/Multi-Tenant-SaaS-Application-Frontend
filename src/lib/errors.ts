import type { ApiError } from "@/types/domain";

export function errorMessage(err: unknown, fallback: string): string {
  const apiErr = err as ApiError;
  return apiErr.response?.data?.message || apiErr.message || fallback;
}
