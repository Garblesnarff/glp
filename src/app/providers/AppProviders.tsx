import { useMemo, type PropsWithChildren } from "react";
import { appEnv, envReadiness } from "../../config/env";
import { LocalAccountRepository } from "../../features/account/repository/localAccountRepository";
import { SupabaseAccountRepository } from "../../features/account/repository/SupabaseAccountRepository";
import { SupabaseMealPlanRepository } from "../../features/meal-planner/repository/SupabaseMealPlanRepository";
import { LocalMealPlanRepository } from "../../features/meal-planner/repository/localMealPlanRepository";
import { LocalHouseholdRepository } from "../../features/partner/repository/localHouseholdRepository";
import { LocalPartnerInviteRepository } from "../../features/partner/repository/localPartnerInviteRepository";
import { SupabaseHouseholdRepository } from "../../features/partner/repository/SupabaseHouseholdRepository";
import { SupabasePartnerInviteRepository } from "../../features/partner/repository/SupabasePartnerInviteRepository";
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
    const localAccountRepository = new LocalAccountRepository();
    const localProfileRepository = new LocalProfileRepository();
    const localPartnerInviteRepository = new LocalPartnerInviteRepository();
    const localHouseholdRepository = new LocalHouseholdRepository();
    const supabaseClient =
      auth.mode === "workos" && auth.user
        ? createSupabaseBrowserClient(auth.getAccessToken)
        : null;

    return createAppServices({
      env: appEnv,
      envReadiness,
      accountRepository: supabaseClient && auth.user ? new SupabaseAccountRepository(supabaseClient, auth.user.id) : localAccountRepository,
      mealPlanRepository:
        supabaseClient && auth.user
          ? new SupabaseMealPlanRepository(supabaseClient, auth.user.id)
          : localRepository,
      profileRepository:
        supabaseClient && auth.user
          ? new SupabaseProfileRepository(supabaseClient, auth.user.id)
          : localProfileRepository,
      partnerInviteRepository:
        supabaseClient && auth.user
          ? new SupabasePartnerInviteRepository(supabaseClient, auth.user.id)
          : localPartnerInviteRepository,
      householdRepository: supabaseClient ? new SupabaseHouseholdRepository(supabaseClient) : localHouseholdRepository,
    });
  }, [auth.getAccessToken, auth.mode, auth.user]);

  return <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>;
}
