import { appEnv } from "../../config/env";

export function getSupabaseBrowserConfig() {
  return {
    url: appEnv.supabase.url,
    anonKey: appEnv.supabase.anonKey,
    projectRef: appEnv.supabase.projectRef,
    isConfigured: Boolean(appEnv.supabase.url && appEnv.supabase.anonKey),
  };
}
