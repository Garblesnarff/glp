import { useEffect, useMemo, useState } from "react";
import { createDefaultDailyLog, defaultUserProfile } from "../../../domain/defaults";
import { calculateProteinTargetRange, isProfileComplete } from "../../../domain/utils";
import type { DailyLog, UserProfile } from "../../../domain/types";
import { useAppServices } from "../../../app/providers/AppServices";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function useProfile() {
  const { profileRepository } = useAppServices();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [loadedProfile, loadedTodayLog] = await Promise.all([
        profileRepository.loadUserProfile(),
        profileRepository.loadTodayLog(todayIsoDate()),
      ]);

      setProfile(loadedProfile);
      setTodayLog(loadedTodayLog ?? createDefaultDailyLog(todayIsoDate()));
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
    await profileRepository.saveTodayLog(log);
  }

  return {
    isLoading,
    profile: profile ?? defaultUserProfile,
    hasPersistedProfile: Boolean(profile),
    profileReady,
    todayLog: todayLog ?? createDefaultDailyLog(todayIsoDate()),
    saveProfile,
    saveTodayLog,
  };
}
