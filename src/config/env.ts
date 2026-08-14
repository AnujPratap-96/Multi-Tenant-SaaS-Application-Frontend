import { z } from "zod";

// F-14: runtime env, validated at import (fail fast on misconfiguration)
const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:5000/api/v1"),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),
  VITE_APP_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid frontend env config:", parsed.error.flatten());
  throw new Error("Invalid VITE_* environment configuration — check .env");
}

export const env = parsed.data;
