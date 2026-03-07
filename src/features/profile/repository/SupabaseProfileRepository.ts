import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyLog, MedicationLog, UserProfile } from "../../../domain/types";
import type { ProfileRepository } from "./ProfileRepository";

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async loadUserProfile(): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from("user_profiles")
      .select(
        "name, role, current_weight, goal_weight, protein_target_min, protein_target_max, fiber_target, hydration_goal, dietary_restrictions, medication_name, medication_start_date, shot_day, prep_partner_email",
      )
      .eq("user_id", this.userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      name: data.name,
      role: data.role,
      currentWeight: data.current_weight,
      goalWeight: data.goal_weight ?? undefined,
      proteinTarget: {
        min: data.protein_target_min,
        max: data.protein_target_max,
      },
      fiberTarget: data.fiber_target,
      hydrationGoal: data.hydration_goal,
      dietaryRestrictions: data.dietary_restrictions ?? [],
      medicationName: data.medication_name,
      medicationStartDate: data.medication_start_date,
      shotDay: data.shot_day,
      prepPartnerEmail: data.prep_partner_email ?? undefined,
    } satisfies UserProfile;
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    const { error } = await this.client.from("user_profiles").upsert(
      {
        user_id: this.userId,
        name: profile.name,
        role: profile.role,
        current_weight: profile.currentWeight,
        goal_weight: profile.goalWeight ?? null,
        protein_target_min: profile.proteinTarget.min,
        protein_target_max: profile.proteinTarget.max,
        fiber_target: profile.fiberTarget,
        hydration_goal: profile.hydrationGoal,
        dietary_restrictions: profile.dietaryRestrictions,
        medication_name: profile.medicationName,
        medication_start_date: profile.medicationStartDate,
        shot_day: profile.shotDay,
        prep_partner_email: profile.prepPartnerEmail ?? null,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      throw error;
    }
  }

  async loadTodayLog(date: string): Promise<DailyLog | null> {
    const { data, error } = await this.client.from("daily_logs").select("payload").eq("user_id", this.userId).eq("date", date).maybeSingle();

    if (error) {
      throw error;
    }

    return (data?.payload as DailyLog | null) ?? null;
  }

  async loadRecentDailyLogs(days: number): Promise<DailyLog[]> {
    const { data, error } = await this.client
      .from("daily_logs")
      .select("payload")
      .eq("user_id", this.userId)
      .order("date", { ascending: false })
      .limit(days);

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => row.payload as DailyLog);
  }

  async saveTodayLog(log: DailyLog): Promise<void> {
    const { error } = await this.client.from("daily_logs").upsert(
      {
        user_id: this.userId,
        date: log.date,
        payload: log,
      },
      { onConflict: "user_id,date" },
    );

    if (error) {
      throw error;
    }
  }

  async loadMedicationLogs(): Promise<MedicationLog[]> {
    const { data, error } = await this.client.from("medication_logs").select("*").eq("user_id", this.userId).order("date", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      medication: row.medication,
      dose: row.dose,
      shotDay: row.shot_day,
      injectionSite: row.injection_site,
      date: row.date,
      notes: row.notes ?? undefined,
    }));
  }
}
