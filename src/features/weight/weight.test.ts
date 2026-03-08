import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog } from "../../domain/defaults";
import { getWeightChartSeries, getWeightTrendSummary } from "./weight";

describe("weight tracking", () => {
  test("frames weight against consistency signals", () => {
    const first = createDefaultDailyLog("2026-03-07");
    first.hydrationOz = 72;
    first.mealsConsumed = [
      { recipeId: "b5", mealType: "breakfast", portion: "full", actualProtein: 30, actualFiber: 6, actualCalories: 320 },
      { recipeId: "l1", mealType: "lunch", portion: "full", actualProtein: 42, actualFiber: 12, actualCalories: 480 },
      { recipeId: "d4", mealType: "dinner", portion: "full", actualProtein: 38, actualFiber: 5, actualCalories: 440 },
    ];
    const second = createDefaultDailyLog("2026-03-06");
    second.hydrationOz = 68;
    second.mealsConsumed = first.mealsConsumed;

    const summary = getWeightTrendSummary(
      [
        { id: "w1", date: "2026-03-07", weight: 212.4 },
        { id: "w2", date: "2026-03-01", weight: 214.1 },
      ],
      [first, second],
    );

    expect(summary.delta).toBe(-1.7);
    expect(summary.hydrationDays).toBe(2);
    expect(summary.proteinDays).toBe(2);
    expect(summary.framing.toLowerCase()).toContain("consistency");
  });

  test("builds chart-ready weight series", () => {
    const series = getWeightChartSeries([
      { id: "w2", date: "2026-03-08", weight: 212.4, clothesFit: "looser" },
      { id: "w1", date: "2026-03-01", weight: 214.1 },
    ]);

    expect(series[0]?.value).toBe(214.1);
    expect(series[1]?.note).toBe("looser fit");
  });
});
