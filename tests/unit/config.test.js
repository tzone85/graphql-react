import { describe, expect, it } from "vitest";
import { ConfigError, loadConfig } from "../../src/config.js";

describe("loadConfig", () => {
  it("uses defaults", () => {
    const c = loadConfig({});
    expect(c.mongoUrl).toMatch(/^mongodb:\/\//);
    expect(c.port).toBe(4000);
    expect(c.logLevel).toBe("info");
  });

  it("rejects bad MONGO_URL", () => {
    expect(() => loadConfig({ MONGO_URL: "not-a-url" })).toThrow(ConfigError);
  });

  it("PORT must be numeric", () => {
    expect(loadConfig({ PORT: "8080" }).port).toBe(8080);
    expect(() => loadConfig({ PORT: "x" })).toThrow(ConfigError);
  });

  it("LOG_LEVEL enum guard", () => {
    expect(() => loadConfig({ LOG_LEVEL: "scream" })).toThrow(ConfigError);
  });
});
