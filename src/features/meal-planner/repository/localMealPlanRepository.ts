import { readStoredJson, writeStoredJson } from "../../../lib/storage";
import { STORAGE_KEYS } from "../constants";
import type { MealPlanRepository } from "./MealPlanRepository";
import type { GroceryState, WeekPlan } from "../types";

export class LocalMealPlanRepository implements MealPlanRepository {
  async loadWeekPlan(): Promise<WeekPlan | null> {
    return readStoredJson<WeekPlan>(STORAGE_KEYS.weekPlan);
  }

  async saveWeekPlan(weekPlan: WeekPlan): Promise<void> {
    await writeStoredJson(STORAGE_KEYS.weekPlan, weekPlan);
  }

  async loadGroceryState(): Promise<GroceryState | null> {
    return readStoredJson<GroceryState>(STORAGE_KEYS.groceryChecked);
  }

  async saveGroceryState(groceryState: GroceryState): Promise<void> {
    await writeStoredJson(STORAGE_KEYS.groceryChecked, groceryState);
  }
}
