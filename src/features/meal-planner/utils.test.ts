import { describe, expect, test } from "bun:test";
import { EMPTY_WEEK_PLAN, RECIPES } from "./data/recipes";
import {
  assignRecipeToWeekPlan,
  buildGroceryList,
  calculateWeeklyStats,
  clearMealSlot,
  createRecipeMap,
  filterRecipes,
} from "./utils";

describe("meal planner utils", () => {
  test("filters recipes by search and meal", () => {
    const results = filterRecipes({
      search: "yogurt",
      mealFilter: "breakfast",
      tagFilter: "all",
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((recipe) => recipe.meal === "breakfast")).toBe(true);
  });

  test("calculates daily totals from assigned recipes", () => {
    const recipeMap = createRecipeMap(RECIPES);
    const weekPlan = assignRecipeToWeekPlan(EMPTY_WEEK_PLAN, "Mon", "breakfast", "b1");
    const nextWeekPlan = assignRecipeToWeekPlan(weekPlan, "Mon", "lunch", "l1");
    const stats = calculateWeeklyStats(nextWeekPlan, recipeMap);

    expect(stats.Mon.protein).toBe(92);
    expect(stats.Mon.fiber).toBe(21);
    expect(stats.Mon.calories).toBe(989);
  });

  test("aggregates grocery items across assigned meals", () => {
    const recipeMap = createRecipeMap(RECIPES);
    const weekPlan = assignRecipeToWeekPlan(EMPTY_WEEK_PLAN, "Mon", "breakfast", "b1");
    const groceries = buildGroceryList(weekPlan, recipeMap);

    expect(groceries.some((item) => item.text === "1.5 cups plain Greek yogurt")).toBe(true);
  });

  test("clears a meal slot without affecting the others", () => {
    const weekPlan = assignRecipeToWeekPlan(EMPTY_WEEK_PLAN, "Tue", "breakfast", "b1");
    const nextWeekPlan = assignRecipeToWeekPlan(weekPlan, "Tue", "dinner", "d3");
    const clearedWeekPlan = clearMealSlot(nextWeekPlan, "Tue", "breakfast");

    expect(clearedWeekPlan.Tue.breakfast).toBeNull();
    expect(clearedWeekPlan.Tue.dinner).toBe("d3");
  });
});
