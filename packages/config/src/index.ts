import { z } from "zod";

export const appConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  RATE_LIMIT_TTL_SECONDS: z.coerce.number().default(60),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(120),
  IDEMPOTENCY_TTL_SECONDS: z.coerce.number().default(900)
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export function parseAppConfig(env: NodeJS.ProcessEnv): AppConfig {
  return appConfigSchema.parse(env);
}
