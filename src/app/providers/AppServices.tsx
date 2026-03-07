import { createContext, useContext } from "react";
import { appEnv, envReadiness } from "../../config/env";
import { LocalMealPlanRepository } from "../../features/meal-planner/repository/localMealPlanRepository";
import type { MealPlanRepository } from "../../features/meal-planner/repository/MealPlanRepository";
import { LocalProfileRepository } from "../../features/profile/repository/localProfileRepository";
import type { ProfileRepository } from "../../features/profile/repository/ProfileRepository";

type AppServices = {
  env: typeof appEnv;
  envReadiness: typeof envReadiness;
  mealPlanRepository: MealPlanRepository;
  profileRepository: ProfileRepository;
};

const defaultServices: AppServices = {
  env: appEnv,
  envReadiness,
  mealPlanRepository: new LocalMealPlanRepository(),
  profileRepository: new LocalProfileRepository(),
};

export const AppServicesContext = createContext<AppServices>(defaultServices);

export function useAppServices() {
  return useContext(AppServicesContext);
}

export function createAppServices(services: AppServices) {
  return services;
}
