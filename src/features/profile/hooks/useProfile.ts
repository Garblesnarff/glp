import { useEffect, useMemo, useState } from "react";
import { createDefaultDailyLog, defaultUserProfile } from "../../../domain/defaults";
import { calculateProteinTargetRange, isProfileComplete } from "../../../domain/utils";
import type { AppetiteLevel, DailyLog, DailyLogMealEntry, Severity, SymptomType, UserProfile } from "../../../domain/types";
import { useAppServices } from "../../../app/providers/AppServices";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function useProfile() {
  const { profileRepository } = useAppServices();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [loadedProfile, loadedTodayLog, loadedRecentLogs] = await Promise.all([
        profileRepository.loadUserProfile(),
        profileRepository.loadTodayLog(todayIsoDate()),
        profileRepository.loadRecentDailyLogs(7),
      ]);

      setProfile(loadedProfile);
      setTodayLog(loadedTodayLog ?? createDefaultDailyLog(todayIsoDate()));
      setRecentLogs(loadedRecentLogs);
      setIsLoading(false);
    })();
  }, [profileRepository]);

  const profileReady = useMemo(() => isProfileComplete(profile), [profile]);

  async function saveProfile(input: UserProfile) {
    const normalizedProfile = {
      ...input,
      proteinTarget: calculateProteinTargetRange(input.currentWeight),
    };

    setProfile(normalizedProfile);
    await profileRepository.saveUserProfile(normalizedProfile);
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
      ...(todayLog ?? createDefaultDailyLog(todayIsoDate())),
      hydrationOz: Math.max(0, amount),
    };

    await saveTodayLog(nextLog);
  }

  async function addHydration(amount: number) {
    const currentLog = todayLog ?? createDefaultDailyLog(todayIsoDate());
    await setHydration(currentLog.hydrationOz + amount);
  }

  async function setAppetiteLevel(appetiteLevel: AppetiteLevel) {
    const nextLog = {
      ...(todayLog ?? createDefaultDailyLog(todayIsoDate())),
      appetiteLevel,
    };

    await saveTodayLog(nextLog);
  }

  async function setSymptomSeverity(symptom: SymptomType, severity: Severity) {
    const currentLog = todayLog ?? createDefaultDailyLog(todayIsoDate());
    await saveTodayLog({
      ...currentLog,
      symptoms: {
        ...currentLog.symptoms,
        [symptom]: severity,
      },
    });
  }

  async function saveMealEntry(entry: DailyLogMealEntry) {
    const currentLog = todayLog ?? createDefaultDailyLog(todayIsoDate());
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
    const currentLog = todayLog ?? createDefaultDailyLog(todayIsoDate());

    await saveTodayLog({
      ...currentLog,
      mealsConsumed: currentLog.mealsConsumed.filter(
        (meal) => !(meal.recipeId === entry.recipeId && meal.mealType === entry.mealType),
      ),
    });
  }

  return {
    isLoading,
    profile: profile ?? defaultUserProfile,
    hasPersistedProfile: Boolean(profile),
    profileReady,
    todayLog: todayLog ?? createDefaultDailyLog(todayIsoDate()),
    recentLogs,
    saveProfile,
    saveTodayLog,
    setHydration,
    addHydration,
    setAppetiteLevel,
    setSymptomSeverity,
    saveMealEntry,
    removeMealEntry,
  };
}
