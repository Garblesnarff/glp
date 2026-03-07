import type { GroceryState, WeekPlan } from "../types";

export interface MealPlanRepository {
  loadWeekPlan(): Promise<WeekPlan | null>;
  saveWeekPlan(weekPlan: WeekPlan): Promise<void>;
  loadGroceryState(): Promise<GroceryState | null>;
  saveGroceryState(groceryState: GroceryState): Promise<void>;
}
