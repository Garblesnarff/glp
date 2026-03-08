type EnvSource = Record<string, string | undefined>;

export type AppEnv = {
  appEnv: string;
  appUrl: string;
  notifications: {
    emailAvailable: boolean;
    smsAvailable: boolean;
  };
  workos: {
    clientId: string;
    redirectUri: string;
    apiHostname: string;
  };
  supabase: {
    url: string;
    anonKey: string;
    projectRef: string;
  };
};

export type EnvReadiness = {
  authReady: boolean;
  databaseReady: boolean;
  missingKeys: string[];
};

const DEFAULT_APP_URL = "http://localhost:5173";

export function readAppEnv(source: EnvSource): AppEnv {
  return {
    appEnv: source.VITE_APP_ENV ?? "development",
    appUrl: source.VITE_APP_URL ?? DEFAULT_APP_URL,
    notifications: {
      emailAvailable: source.VITE_NOTIFICATION_EMAIL_AVAILABLE === "true",
      smsAvailable: source.VITE_NOTIFICATION_SMS_AVAILABLE === "true",
    },
    workos: {
      clientId: source.VITE_WORKOS_CLIENT_ID ?? "",
      redirectUri: source.VITE_WORKOS_REDIRECT_URI ?? `${source.VITE_APP_URL ?? DEFAULT_APP_URL}/auth/callback`,
      apiHostname: source.VITE_WORKOS_API_HOSTNAME ?? "",
    },
    supabase: {
      url: source.VITE_SUPABASE_URL ?? "",
      anonKey: source.VITE_SUPABASE_ANON_KEY ?? "",
      projectRef: source.VITE_SUPABASE_PROJECT_REF ?? "",
    },
  };
}

export function getEnvReadiness(env: AppEnv): EnvReadiness {
  const missingKeys: string[] = [];

  if (!env.workos.clientId) {
    missingKeys.push("VITE_WORKOS_CLIENT_ID");
  }

  if (!env.workos.redirectUri) {
    missingKeys.push("VITE_WORKOS_REDIRECT_URI");
  }
  if (!env.workos.apiHostname) {
    missingKeys.push("VITE_WORKOS_API_HOSTNAME");
  }
  if (!env.supabase.url) {
    missingKeys.push("VITE_SUPABASE_URL");
  }

  if (!env.supabase.anonKey) {
    missingKeys.push("VITE_SUPABASE_ANON_KEY");
  }

  return {
    authReady: missingKeys.every((key) => !key.startsWith("VITE_WORKOS_")),
    databaseReady: missingKeys.every((key) => !key.startsWith("VITE_SUPABASE_")),
    missingKeys,
  };
}

export const appEnv = readAppEnv(import.meta.env as EnvSource);
export const envReadiness = getEnvReadiness(appEnv);
