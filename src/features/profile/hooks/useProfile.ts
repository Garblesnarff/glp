import { createContext, createElement, useContext, useEffect, useMemo, useRef, useState, type MutableRefObject, type PropsWithChildren } from "react";
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
  const profileRef = useRef<UserProfile | null>(null);
  const todayLogRef = useRef<DailyLog | null>(null);
  const recentLogsRef = useRef<DailyLog[]>([]);
  const medicationLogsRef = useRef<MedicationLog[]>([]);
  const weightLogsRef = useRef<WeightLog[]>([]);
  const profileSaveQueueRef = useRef(Promise.resolve());
  const todayLogSaveQueueRef = useRef(Promise.resolve());
  const medicationSaveQueueRef = useRef(Promise.resolve());
  const weightSaveQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    todayLogRef.current = todayLog;
  }, [todayLog]);

  useEffect(() => {
    recentLogsRef.current = recentLogs;
  }, [recentLogs]);

  useEffect(() => {
    medicationLogsRef.current = medicationLogs;
  }, [medicationLogs]);

  useEffect(() => {
    weightLogsRef.current = weightLogs;
  }, [weightLogs]);

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
    const previousProfile = profileRef.current;

    profileRef.current = normalizedProfile;
    setProfile(normalizedProfile);
    try {
      await enqueue(profileSaveQueueRef, async () => {
        await profileRepository.saveUserProfile(normalizedProfile);
        await accountRepository.ensurePrimaryAccount(normalizedProfile);
      });
    } catch (error) {
      if (profileRef.current === normalizedProfile) {
        profileRef.current = previousProfile;
        setProfile(previousProfile);
      }
      throw error;
    }
  }

  async function saveTodayLog(log: DailyLog) {
    const previousTodayLog = todayLogRef.current;
    const previousRecentLogs = recentLogsRef.current;
    const nextRecentLogs = [log, ...previousRecentLogs.filter((item) => item.date !== log.date)]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);

    todayLogRef.current = log;
    recentLogsRef.current = nextRecentLogs;
    setTodayLog(log);
    setRecentLogs(nextRecentLogs);
    try {
      await enqueue(todayLogSaveQueueRef, () => profileRepository.saveTodayLog(log));
    } catch (error) {
      if (todayLogRef.current === log) {
        todayLogRef.current = previousTodayLog;
        recentLogsRef.current = previousRecentLogs;
        setTodayLog(previousTodayLog);
        setRecentLogs(previousRecentLogs);
      }
      throw error;
    }
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
    const previousLogs = medicationLogsRef.current;
    const nextLogs = [log, ...previousLogs.filter((item) => item.id !== log.id)].sort((a, b) => b.date.localeCompare(a.date));
    medicationLogsRef.current = nextLogs;
    setMedicationLogs(nextLogs);
    try {
      await enqueue(medicationSaveQueueRef, () => profileRepository.saveMedicationLogs(nextLogs));
    } catch (error) {
      if (medicationLogsRef.current === nextLogs) {
        medicationLogsRef.current = previousLogs;
        setMedicationLogs(previousLogs);
      }
      throw error;
    }
  }

  async function saveWeightLog(log: WeightLog) {
    const previousLogs = weightLogsRef.current;
    const previousProfile = profileRef.current;
    const nextLogs = [log, ...previousLogs.filter((item) => item.id !== log.id)].sort((a, b) => b.date.localeCompare(a.date));
    weightLogsRef.current = nextLogs;
    setWeightLogs(nextLogs);
    let nextProfile: UserProfile | null = null;
    if (log.weight !== profileRef.current?.currentWeight) {
      const currentProfile = profileRef.current ?? defaultUserProfile;
      nextProfile = normalizeUserProfileTargets({
        ...currentProfile,
        currentWeight: log.weight,
      });
      profileRef.current = nextProfile;
      setProfile(nextProfile);
    }

    try {
      await enqueue(weightSaveQueueRef, async () => {
        await profileRepository.saveWeightLogs(nextLogs);
        if (nextProfile) {
          await profileRepository.saveUserProfile(nextProfile);
        }
      });
    } catch (error) {
      if (weightLogsRef.current === nextLogs) {
        weightLogsRef.current = previousLogs;
        setWeightLogs(previousLogs);
      }
      if (nextProfile && profileRef.current === nextProfile) {
        profileRef.current = previousProfile;
        setProfile(previousProfile);
      }
      throw error;
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

function enqueue(queueRef: MutableRefObject<Promise<void>>, operation: () => Promise<void>) {
  const nextRun = queueRef.current.then(operation, operation);
  queueRef.current = nextRun.catch(() => undefined);
  return nextRun;
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
