import { createContext, createElement, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { createDefaultDailyLog, defaultUserProfile } from "../../../domain/defaults";
import { isProfileComplete, normalizeUserProfileTargets } from "../../../domain/utils";
import type { AppetiteLevel, BristolStoolType, DailyLog, DailyLogMealEntry, FoodMood, MedicationLog, Severity, SymptomType, UserProfile, WeightLog } from "../../../domain/types";
import { useAppServices } from "../../../app/providers/AppServices";
import { getLocalIsoDate } from "../../../lib/dates";

function useProfileState() {
  const { profileRepository, accountRepository } = useAppServices();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [loadedProfile, loadedTodayLog, loadedRecentLogs, loadedMedicationLogs, loadedWeightLogs] = await Promise.all([
        profileRepository.loadUserProfile(),
        profileRepository.loadTodayLog(getLocalIsoDate()),
        profileRepository.loadRecentDailyLogs(7),
        profileRepository.loadMedicationLogs(),
        profileRepository.loadWeightLogs(),
      ]);

      setProfile(loadedProfile ? normalizeUserProfileTargets(loadedProfile) : null);
      setTodayLog(loadedTodayLog ?? createDefaultDailyLog(getLocalIsoDate()));
      setRecentLogs(loadedRecentLogs);
      setMedicationLogs(loadedMedicationLogs);
      setWeightLogs(loadedWeightLogs);
      setIsLoading(false);
    })();
  }, [profileRepository]);

  const profileReady = useMemo(() => isProfileComplete(profile), [profile]);

  async function saveProfile(input: UserProfile) {
    const normalizedProfile = normalizeUserProfileTargets(input);

    setProfile(normalizedProfile);
    await profileRepository.saveUserProfile(normalizedProfile);
    await accountRepository.ensurePrimaryAccount(normalizedProfile);
  }

  async function saveTodayLog(log: DailyLog) {
    setTodayLog(log);
    setRecentLogs((current) => {
      const next = [log, ...current.filter((item) => item.date !== log.date)];
      return next.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
    });
    await profileRepository.saveTodayLog(log);
  }

  async function setHydration(amount: number) {
    const nextLog = {
      ...(todayLog ?? createDefaultDailyLog(getLocalIsoDate())),
      hydrationOz: Math.max(0, amount),
    };

    await saveTodayLog(nextLog);
  }

  async function addHydration(amount: number) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    await setHydration(currentLog.hydrationOz + amount);
  }

  async function setAppetiteLevel(appetiteLevel: AppetiteLevel) {
    const nextLog = {
      ...(todayLog ?? createDefaultDailyLog(getLocalIsoDate())),
      appetiteLevel,
    };

    await saveTodayLog(nextLog);
  }

  async function setSymptomSeverity(symptom: SymptomType, severity: Severity) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    await saveTodayLog({
      ...currentLog,
      symptoms: {
        ...currentLog.symptoms,
        [symptom]: severity,
      },
    });
  }

  async function setFoodNoiseLevel(foodNoiseLevel: number) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    await saveTodayLog({
      ...currentLog,
      foodNoiseLevel,
    });
  }

  async function setFoodMood(foodMood: FoodMood) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    await saveTodayLog({
      ...currentLog,
      foodMood,
    });
  }

  async function saveMealEntry(entry: DailyLogMealEntry) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    const existingIndex = currentLog.mealsConsumed.findIndex(
      (meal) => meal.recipeId === entry.recipeId && meal.mealType === entry.mealType,
    );
    const mealsConsumed =
      existingIndex >= 0
        ? currentLog.mealsConsumed.map((meal, index) => (index === existingIndex ? entry : meal))
        : [...currentLog.mealsConsumed, entry];

    await saveTodayLog({
      ...currentLog,
      mealsConsumed,
    });
  }

  async function removeMealEntry(entry: Pick<DailyLogMealEntry, "recipeId" | "mealType">) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());

    await saveTodayLog({
      ...currentLog,
      mealsConsumed: currentLog.mealsConsumed.filter(
        (meal) => !(meal.recipeId === entry.recipeId && meal.mealType === entry.mealType),
      ),
    });
  }

  async function saveMedicationLog(log: MedicationLog) {
    const nextLogs = [log, ...medicationLogs.filter((item) => item.id !== log.id)].sort((a, b) => b.date.localeCompare(a.date));
    setMedicationLogs(nextLogs);
    await profileRepository.saveMedicationLogs(nextLogs);
  }

  async function saveWeightLog(log: WeightLog) {
    const nextLogs = [log, ...weightLogs.filter((item) => item.id !== log.id)].sort((a, b) => b.date.localeCompare(a.date));
    setWeightLogs(nextLogs);
    await profileRepository.saveWeightLogs(nextLogs);

    if (log.weight !== profile?.currentWeight) {
      const currentProfile = profile ?? defaultUserProfile;
      const nextProfile = normalizeUserProfileTargets({
        ...currentProfile,
        currentWeight: log.weight,
      });
      setProfile(nextProfile);
      await profileRepository.saveUserProfile(nextProfile);
    }
  }

  async function setBowelMovement(hasBowelMovement: boolean) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    await saveTodayLog({
      ...currentLog,
      bowelMovement: hasBowelMovement,
      bristolStoolType: hasBowelMovement ? currentLog.bristolStoolType : undefined,
    });
  }

  async function setBristolStoolType(bristolStoolType: BristolStoolType | undefined) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    await saveTodayLog({
      ...currentLog,
      bowelMovement: bristolStoolType ? true : currentLog.bowelMovement,
      bristolStoolType,
    });
  }

  async function toggleMovementActivity(activity: string) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    const nextMovement = currentLog.movement.includes(activity)
      ? currentLog.movement.filter((item) => item !== activity)
      : [...currentLog.movement, activity];

    await saveTodayLog({
      ...currentLog,
      movement: nextMovement,
    });
  }

  async function toggleSupplement(name: string) {
    const currentLog = todayLog ?? createDefaultDailyLog(getLocalIsoDate());
    const nextSupplements = currentLog.supplements.includes(name)
      ? currentLog.supplements.filter((item) => item !== name)
      : [...currentLog.supplements, name];

    await saveTodayLog({
      ...currentLog,
      supplements: nextSupplements,
    });
  }

  return {
    isLoading,
    profile: profile ?? defaultUserProfile,
    hasPersistedProfile: Boolean(profile),
    profileReady,
    todayLog: todayLog ?? createDefaultDailyLog(getLocalIsoDate()),
    recentLogs,
    medicationLogs,
    weightLogs,
    saveProfile,
    saveTodayLog,
    setHydration,
    addHydration,
    setAppetiteLevel,
    setSymptomSeverity,
    setFoodNoiseLevel,
    setFoodMood,
    saveMealEntry,
    removeMealEntry,
    saveMedicationLog,
    saveWeightLog,
    setBowelMovement,
    setBristolStoolType,
    toggleMovementActivity,
    toggleSupplement,
  };
}

type ProfileState = ReturnType<typeof useProfileState>;

const ProfileContext = createContext<ProfileState | null>(null);

export function ProfileProvider({ children }: PropsWithChildren) {
  const value = useProfileState();
  return createElement(ProfileContext.Provider, { value }, children);
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  return context;
}
