import { readStoredJson, writeStoredJson } from "../../../lib/storage";
import type { DailyLog, MedicationLog, UserProfile, WeightLog } from "../../../domain/types";
import type { ProfileRepository } from "./ProfileRepository";

const STORAGE_KEYS = {
  profile: "glp1-user-profile",
  medicationLogs: "glp1-medication-logs",
  weightLogs: "glp1-weight-logs",
  dailyLogPrefix: "glp1-daily-log",
};

export class LocalProfileRepository implements ProfileRepository {
  async loadUserProfile(): Promise<UserProfile | null> {
    return readStoredJson<UserProfile>(STORAGE_KEYS.profile);
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    await writeStoredJson(STORAGE_KEYS.profile, profile);
  }

  async loadTodayLog(date: string): Promise<DailyLog | null> {
    return readStoredJson<DailyLog>(`${STORAGE_KEYS.dailyLogPrefix}:${date}`);
  }

  async loadRecentDailyLogs(days: number): Promise<DailyLog[]> {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    const prefix = `${STORAGE_KEYS.dailyLogPrefix}:`;
    const logs: DailyLog[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key || !key.startsWith(prefix)) {
        continue;
      }

      const parsed = await readStoredJson<DailyLog>(key);
      if (parsed) {
        logs.push(parsed);
      }
    }

    return logs
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days);
  }

  async saveTodayLog(log: DailyLog): Promise<void> {
    await writeStoredJson(`${STORAGE_KEYS.dailyLogPrefix}:${log.date}`, log);
  }

  async loadMedicationLogs(): Promise<MedicationLog[]> {
    return (await readStoredJson<MedicationLog[]>(STORAGE_KEYS.medicationLogs)) ?? [];
  }

  async saveMedicationLogs(logs: MedicationLog[]): Promise<void> {
    await writeStoredJson(STORAGE_KEYS.medicationLogs, logs);
  }

  async loadWeightLogs(): Promise<WeightLog[]> {
    return (await readStoredJson<WeightLog[]>(STORAGE_KEYS.weightLogs)) ?? [];
  }

  async saveWeightLogs(logs: WeightLog[]): Promise<void> {
    await writeStoredJson(STORAGE_KEYS.weightLogs, logs);
  }
}
