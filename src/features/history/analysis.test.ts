import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog } from "../../domain/defaults";
import type { MedicationLog } from "../../domain/types";
import { getDailyCorrelationSeries, getHistoryPatternSummary, getTrendChartSeries } from "./analysis";

describe("history analysis", () => {
  test("summarizes dose increase and rough-day signals", () => {
    const first = createDefaultDailyLog("2026-03-07");
    first.symptoms.nausea = "moderate";
    first.foodMood = "anxious";
    first.foodNoiseLevel = 4;
    first.movement = ["10-minute walk"];
    first.mealsConsumed = [
      {
        recipeId: "b5",
        mealType: "breakfast",
        portion: "half",
        actualProtein: 23,
        actualFiber: 5,
        actualCalories: 240,
        tolerance: "rough",
      },
    ];
    const second = createDefaultDailyLog("2026-03-06");
    const medicationLogs: MedicationLog[] = [
      {
        id: "m1",
        medication: "Semaglutide",
        dose: "0.5 mg",
        shotDay: "Friday",
        injectionSite: "Left abdomen",
        date: "2026-03-06",
        status: "completed",
        isDoseIncrease: true,
      },
      {
        id: "m2",
        medication: "Semaglutide",
        dose: "0.5 mg",
        shotDay: "Friday",
        injectionSite: "Right abdomen",
        date: "2026-02-27",
        status: "delayed",
      },
    ];

    const summary = getHistoryPatternSummary([first, second], medicationLogs);

    expect(summary.symptomDaysAfterDoseIncrease).toBe(1);
    expect(summary.delayedOrMissedCount).toBe(1);
    expect(summary.roughMealDays).toBe(1);
    expect(summary.difficultFoodMoodDays).toBe(1);
    expect(summary.proteinSupplementDays).toBe(0);
    expect(summary.movementDays).toBe(1);
  });

  test("builds per-day correlation series", () => {
    const log = createDefaultDailyLog("2026-03-07");
    log.hydrationOz = 48;
    log.symptoms.constipation = "mild";
    log.foodMood = "overwhelmed";
    const medicationLogs: MedicationLog[] = [
      {
        id: "m1",
        medication: "Semaglutide",
        dose: "0.5 mg",
        shotDay: "Friday",
        injectionSite: "Left abdomen",
        date: "2026-03-07",
        status: "completed",
        isDoseIncrease: false,
      },
    ];

    const series = getDailyCorrelationSeries([log], medicationLogs);

    expect(series[0]?.symptomLoad).toBeGreaterThan(0);
    expect(series[0]?.medicationStatuses[0]).toBe("completed");
    expect(series[0]?.foodMood).toBe("overwhelmed");
    expect(series[0]?.supplementCount).toBe(0);
    expect(series[0]?.strengthLogged).toBe(false);
  });

  test("builds chart-friendly trend series", () => {
    const first = createDefaultDailyLog("2026-03-07");
    first.hydrationOz = 48;
    first.foodNoiseLevel = 4;
    first.mealsConsumed = [
      { recipeId: "b5", mealType: "breakfast", portion: "full", actualProtein: 30, actualFiber: 6, actualCalories: 320 },
    ];
    const second = createDefaultDailyLog("2026-03-08");
    second.hydrationOz = 72;
    second.foodNoiseLevel = 2;

    const series = getTrendChartSeries([second, first]);

    expect(series.hydration[0]?.value).toBe(48);
    expect(series.hydration[1]?.value).toBe(72);
    expect(series.foodNoise[0]?.value).toBe(4);
  });
});
