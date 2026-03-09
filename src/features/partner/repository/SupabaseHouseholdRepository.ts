import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultReminderPreferences } from "../../../domain/defaults";
import { normalizeUserProfileTargets } from "../../../domain/utils";
import type { DailyLog, UserProfile } from "../../../domain/types";
import type { HouseholdRepository, LinkedPrimaryContext } from "./HouseholdRepository";

export class SupabaseHouseholdRepository implements HouseholdRepository {
  constructor(private readonly client: SupabaseClient) {}

  async loadLinkedPrimaryContext(input: { prepPartnerEmail: string; date: string; days: number }): Promise<LinkedPrimaryContext | null> {
    const { prepPartnerEmail, date, days } = input;

    const { data: profileRow, error: profileError } = await this.client
      .from("user_profiles")
      .select(
        "user_id, name, role, current_weight, goal_weight, protein_target_min, protein_target_max, fiber_target, hydration_goal, dietary_restrictions, medication_name, medication_start_date, shot_day, prep_partner_email",
      )
      .eq("role", "primary")
      .eq("prep_partner_email", prepPartnerEmail)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profileRow) {
      return null;
    }

    const primaryUserId = profileRow.user_id as string;

    const [todayLogResult, recentLogsResult] = await Promise.all([
      this.client.from("daily_logs").select("payload").eq("user_id", primaryUserId).eq("date", date).maybeSingle(),
      this.client.from("daily_logs").select("payload").eq("user_id", primaryUserId).order("date", { ascending: false }).limit(days),
    ]);

    if (todayLogResult.error) {
      throw todayLogResult.error;
    }

    if (recentLogsResult.error) {
      throw recentLogsResult.error;
    }

    return {
      primaryUserId,
      profile: mapProfile(profileRow),
      todayLog: (todayLogResult.data?.payload as DailyLog | null) ?? null,
      recentLogs: (recentLogsResult.data ?? []).map((row) => row.payload as DailyLog),
    };
  }
}

function mapProfile(data: Record<string, unknown>): UserProfile {
  return normalizeUserProfileTargets({
    name: String(data.name ?? ""),
    role: data.role === "prep_partner" ? "prep_partner" : "primary",
    currentWeight: Number(data.current_weight ?? 0),
    goalWeight: data.goal_weight ? Number(data.goal_weight) : undefined,
    proteinTarget: {
      min: Number(data.protein_target_min ?? 0),
      max: Number(data.protein_target_max ?? 0),
    },
    fiberTarget: Number(data.fiber_target ?? 0),
    hydrationGoal: Number(data.hydration_goal ?? 0),
    dietaryRestrictions: Array.isArray(data.dietary_restrictions) ? (data.dietary_restrictions as string[]) : [],
    medicationName: String(data.medication_name ?? ""),
    medicationStartDate: String(data.medication_start_date ?? ""),
    shotDay: String(data.shot_day ?? "Monday"),
    medicationSupplyDays: 28,
    refillLeadDays: 5,
    lastRefillDate: "",
    prepPartnerEmail: data.prep_partner_email ? String(data.prep_partner_email) : undefined,
    reminderPreferences: defaultReminderPreferences,
  });
}
