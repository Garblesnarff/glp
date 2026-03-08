import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog } from "../../domain/defaults";
import type { MedicationLog } from "../../domain/types";
import { getDailyCorrelationSeries, getHistoryPatternSummary } from "./analysis";

describe("history analysis", () => {
  test("summarizes dose increase and rough-day signals", () => {
    const first = createDefaultDailyLog("2026-03-07");
    first.symptoms.nausea = "moderate";
    first.foodMood = "anxious";
    first.foodNoiseLevel = 4;
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
  });
});
