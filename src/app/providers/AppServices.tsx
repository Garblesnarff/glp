import { createContext, useContext } from "react";
import { appEnv, envReadiness } from "../../config/env";
import { LocalAccountRepository } from "../../features/account/repository/localAccountRepository";
import type { AccountRepository } from "../../features/account/repository/AccountRepository";
import { LocalMealPlanRepository } from "../../features/meal-planner/repository/localMealPlanRepository";
import type { MealPlanRepository } from "../../features/meal-planner/repository/MealPlanRepository";
import { LocalNotificationRepository } from "../../features/notifications/repository/localNotificationRepository";
import type { NotificationRepository } from "../../features/notifications/repository/NotificationRepository";
import { LocalHouseholdRepository } from "../../features/partner/repository/localHouseholdRepository";
import { LocalPartnerInviteRepository } from "../../features/partner/repository/localPartnerInviteRepository";
import type { HouseholdRepository } from "../../features/partner/repository/HouseholdRepository";
import type { PartnerInviteRepository } from "../../features/partner/repository/PartnerInviteRepository";
import { LocalProfileRepository } from "../../features/profile/repository/localProfileRepository";
import type { ProfileRepository } from "../../features/profile/repository/ProfileRepository";
import { LocalSupportAlertRepository } from "../../features/support-alerts/repository/localSupportAlertRepository";
import type { SupportAlertRepository } from "../../features/support-alerts/repository/SupportAlertRepository";

type AppServices = {
  env: typeof appEnv;
  envReadiness: typeof envReadiness;
  accountRepository: AccountRepository;
  mealPlanRepository: MealPlanRepository;
  notificationRepository: NotificationRepository;
  profileRepository: ProfileRepository;
  partnerInviteRepository: PartnerInviteRepository;
  householdRepository: HouseholdRepository;
  supportAlertRepository: SupportAlertRepository;
};

const defaultServices: AppServices = {
  env: appEnv,
  envReadiness,
  accountRepository: new LocalAccountRepository(),
  mealPlanRepository: new LocalMealPlanRepository(),
  notificationRepository: new LocalNotificationRepository(),
  profileRepository: new LocalProfileRepository(),
  partnerInviteRepository: new LocalPartnerInviteRepository(),
  householdRepository: new LocalHouseholdRepository(),
  supportAlertRepository: new LocalSupportAlertRepository(),
};

export const AppServicesContext = createContext<AppServices>(defaultServices);

export function useAppServices() {
  return useContext(AppServicesContext);
}

export function createAppServices(services: AppServices) {
  return services;
}
