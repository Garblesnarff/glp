import { useMemo, type PropsWithChildren } from "react";
import { appEnv, envReadiness } from "../../config/env";
import { SupabaseMealPlanRepository } from "../../features/meal-planner/repository/SupabaseMealPlanRepository";
import { LocalMealPlanRepository } from "../../features/meal-planner/repository/localMealPlanRepository";
import { LocalProfileRepository } from "../../features/profile/repository/localProfileRepository";
import { SupabaseProfileRepository } from "../../features/profile/repository/SupabaseProfileRepository";
import { createSupabaseBrowserClient } from "../../integrations/supabase/client";
import { AppAuthProvider } from "./AppAuth";
import { AppServicesContext, createAppServices } from "./AppServices";
import { useAppAuth } from "./app-auth-context";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppAuthProvider>
      <AppServicesProvider>{children}</AppServicesProvider>
    </AppAuthProvider>
  );
}

function AppServicesProvider({ children }: PropsWithChildren) {
  const auth = useAppAuth();

  const services = useMemo(() => {
    const localRepository = new LocalMealPlanRepository();
    const localProfileRepository = new LocalProfileRepository();
    const supabaseClient =
      auth.mode === "workos" && auth.user
        ? createSupabaseBrowserClient(auth.getAccessToken)
        : null;

    return createAppServices({
      env: appEnv,
      envReadiness,
      mealPlanRepository:
        supabaseClient && auth.user
          ? new SupabaseMealPlanRepository(supabaseClient, auth.user.id)
          : localRepository,
      profileRepository:
        supabaseClient && auth.user
          ? new SupabaseProfileRepository(supabaseClient, auth.user.id)
          : localProfileRepository,
    });
  }, [auth.getAccessToken, auth.mode, auth.user]);

  return <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>;
}
