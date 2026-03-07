import type { SupabaseClient } from "@supabase/supabase-js";
import type { GroceryState, WeekPlan } from "../types";
import type { MealPlanRepository } from "./MealPlanRepository";

const TABLE_NAME = "meal_planner_state";

type MealPlannerStateRow = {
  user_id: string;
  week_plan: WeekPlan | null;
  grocery_state: GroceryState | null;
  updated_at?: string;
};

export class SupabaseMealPlanRepository implements MealPlanRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async loadWeekPlan(): Promise<WeekPlan | null> {
    const row = await this.loadState();
    return row?.week_plan ?? null;
  }

  async saveWeekPlan(weekPlan: WeekPlan): Promise<void> {
    const existing = await this.loadState();
    await this.upsertState({
      user_id: this.userId,
      week_plan: weekPlan,
      grocery_state: existing?.grocery_state ?? {},
    });
  }

  async loadGroceryState(): Promise<GroceryState | null> {
    const row = await this.loadState();
    return row?.grocery_state ?? null;
  }

  async saveGroceryState(groceryState: GroceryState): Promise<void> {
    const existing = await this.loadState();
    await this.upsertState({
      user_id: this.userId,
      week_plan: existing?.week_plan ?? null,
      grocery_state: groceryState,
    });
  }

  private async loadState(): Promise<MealPlannerStateRow | null> {
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select("user_id, week_plan, grocery_state, updated_at")
      .eq("user_id", this.userId)
      .maybeSingle<MealPlannerStateRow>();

    if (error) {
      throw error;
    }

    return data;
  }

  private async upsertState(row: MealPlannerStateRow): Promise<void> {
    const { error } = await this.client.from(TABLE_NAME).upsert(row, { onConflict: "user_id" });

    if (error) {
      throw error;
    }
  }
}
