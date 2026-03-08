import type { SupabaseClient } from "@supabase/supabase-js";
import type { GroceryState, WeekPlan } from "../types";
import type { MealPlanRepository } from "./MealPlanRepository";

const TABLE_NAME = "meal_planner_state";

type MealPlannerStateRow = {
  user_id: string;
  account_id: string | null;
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
    const scope = await this.resolveScope();

    await this.upsertState(
      {
        user_id: this.userId,
        account_id: scope.accountId,
        week_plan: weekPlan,
        grocery_state: existing?.grocery_state ?? {},
      },
      scope,
    );
  }

  async loadGroceryState(): Promise<GroceryState | null> {
    const row = await this.loadState();
    return row?.grocery_state ?? null;
  }

  async saveGroceryState(groceryState: GroceryState): Promise<void> {
    const existing = await this.loadState();
    const scope = await this.resolveScope();

    await this.upsertState(
      {
        user_id: this.userId,
        account_id: scope.accountId,
        week_plan: existing?.week_plan ?? null,
        grocery_state: groceryState,
      },
      scope,
    );
  }

  private async loadState(): Promise<MealPlannerStateRow | null> {
    const scope = await this.resolveScope();
    const { data, error } = await this.client
      .from(TABLE_NAME)
      .select("user_id, account_id, week_plan, grocery_state, updated_at")
      .eq(scope.column, scope.value)
      .maybeSingle<MealPlannerStateRow>();

    if (error) {
      throw error;
    }

    return data;
  }

  private async upsertState(row: MealPlannerStateRow, scope: PlannerScope): Promise<void> {
    const { error } = await this.client
      .from(TABLE_NAME)
      .upsert(row, { onConflict: scope.accountId ? "account_id" : "user_id" });

    if (error) {
      throw error;
    }
  }

  private async resolveScope(): Promise<PlannerScope> {
    const { data, error } = await this.client
      .from("account_members")
      .select("account_id")
      .eq("user_id", this.userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.account_id) {
      return {
        column: "account_id",
        value: data.account_id,
        accountId: data.account_id,
      };
    }

    return {
      column: "user_id",
      value: this.userId,
      accountId: null,
    };
  }
}

type PlannerScope = {
  column: "user_id" | "account_id";
  value: string;
  accountId: string | null;
};
