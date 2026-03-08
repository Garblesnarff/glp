import type { DailyLog, UserProfile } from "../../../domain/types";

export type LinkedPrimaryContext = {
  primaryUserId: string;
  profile: UserProfile;
  todayLog: DailyLog | null;
  recentLogs: DailyLog[];
};

export interface HouseholdRepository {
  loadLinkedPrimaryContext(input: { prepPartnerEmail: string; date: string; days: number }): Promise<LinkedPrimaryContext | null>;
}
