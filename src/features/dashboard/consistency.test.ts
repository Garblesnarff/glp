import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog, defaultUserProfile } from "../../domain/defaults";
import { getConsistencySummary } from "./consistency";

describe("consistency summary", () => {
  test("derives streaks and celebratory wins from recent logs", () => {
    const day1 = createDefaultDailyLog("2026-03-08");
    day1.hydrationOz = 72;
    day1.movement = ["10-minute walk"];
    day1.mealsConsumed = [
      { recipeId: "b5", mealType: "breakfast", portion: "full", actualProtein: 30, actualFiber: 6, actualCalories: 320 },
      { recipeId: "l1", mealType: "lunch", portion: "full", actualProtein: 42, actualFiber: 12, actualCalories: 480 },
      { recipeId: "d4", mealType: "dinner", portion: "full", actualProtein: 38, actualFiber: 5, actualCalories: 440 },
      { recipeId: "s2", mealType: "snack", portion: "half", actualProtein: 12, actualFiber: 1, actualCalories: 100 },
    ];

    const day2 = createDefaultDailyLog("2026-03-07");
    day2.hydrationOz = 68;
    day2.movement = ["Mobility"];
    day2.mealsConsumed = day1.mealsConsumed;

    const day3 = createDefaultDailyLog("2026-03-06");
    day3.hydrationOz = 64;
    day3.mealsConsumed = day1.mealsConsumed;

    const summary = getConsistencySummary(defaultUserProfile, [day1, day2, day3]);

    expect(summary.hydrationStreak).toBe(3);
    expect(summary.proteinStreak).toBe(3);
    expect(summary.movementStreak).toBe(2);
    expect(summary.wins.length).toBeGreaterThan(0);
  });
});
