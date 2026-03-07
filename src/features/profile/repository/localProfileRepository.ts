import { readStoredJson, writeStoredJson } from "../../../lib/storage";
import type { DailyLog, MedicationLog, UserProfile } from "../../../domain/types";
import type { ProfileRepository } from "./ProfileRepository";

const STORAGE_KEYS = {
  profile: "glp1-user-profile",
  medicationLogs: "glp1-medication-logs",
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

  async saveTodayLog(log: DailyLog): Promise<void> {
    await writeStoredJson(`${STORAGE_KEYS.dailyLogPrefix}:${log.date}`, log);
  }

  async loadMedicationLogs(): Promise<MedicationLog[]> {
    return (await readStoredJson<MedicationLog[]>(STORAGE_KEYS.medicationLogs)) ?? [];
  }
}
