import { describe, expect, test } from "bun:test";
import { getEnvReadiness, readAppEnv } from "./env";

describe("env config", () => {
  test("uses local defaults when optional values are absent", () => {
    const env = readAppEnv({});

    expect(env.appEnv).toBe("development");
    expect(env.appUrl).toBe("http://127.0.0.1:5533");
    expect(env.workos.redirectUri).toBe("http://127.0.0.1:5533/auth/callback");
    expect(env.workos.apiHostname).toBe("");
  });

  test("reports missing hosted integration keys", () => {
    const readiness = getEnvReadiness(
      readAppEnv({
        VITE_WORKOS_CLIENT_ID: "",
        VITE_SUPABASE_URL: "",
        VITE_SUPABASE_ANON_KEY: "",
      }),
    );

    expect(readiness.authReady).toBe(false);
    expect(readiness.databaseReady).toBe(false);
    expect(readiness.missingKeys).toContain("VITE_WORKOS_CLIENT_ID");
    expect(readiness.missingKeys).toContain("VITE_SUPABASE_URL");
  });
});
