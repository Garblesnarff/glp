import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserConfig } from "./config";

let supabaseClient: SupabaseClient | null = null;
let currentAccessTokenGetter: (() => Promise<string | null>) | null = null;

export function createSupabaseBrowserClient(getAccessToken: () => Promise<string | null>) {
  const config = getSupabaseBrowserConfig();

  if (!config.isConfigured) {
    return null;
  }

  currentAccessTokenGetter = getAccessToken;

  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    accessToken: async () => currentAccessTokenGetter?.() ?? null,
  });

  return supabaseClient;
}
