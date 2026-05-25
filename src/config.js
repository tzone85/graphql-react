import { z } from "zod";

export class ConfigError extends Error {
  constructor(message, issues) {
    super(message);
    this.name = "ConfigError";
    this.issues = issues;
  }
}

const schema = z.object({
  MONGO_URL: z.string().url().or(z.string().startsWith("mongodb")).default("mongodb://localhost:27017/library"),
  PORT: z.string().regex(/^\d+$/).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
});

export function loadConfig(env = process.env) {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    throw new ConfigError("invalid environment", parsed.error.issues);
  }
  return Object.freeze({
    mongoUrl: parsed.data.MONGO_URL,
    port: parsed.data.PORT ? Number(parsed.data.PORT) : 4000,
    logLevel: parsed.data.LOG_LEVEL ?? "info",
  });
}
