import type { DailyLog, MedicationLog, UserProfile } from "../../../domain/types";

export interface ProfileRepository {
  loadUserProfile(): Promise<UserProfile | null>;
  saveUserProfile(profile: UserProfile): Promise<void>;
  loadTodayLog(date: string): Promise<DailyLog | null>;
  saveTodayLog(log: DailyLog): Promise<void>;
  loadMedicationLogs(): Promise<MedicationLog[]>;
}
