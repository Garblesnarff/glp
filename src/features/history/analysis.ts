import type { DailyLog, MedicationLog } from "../../domain/types";

const severityScore = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
} as const;

export function getSymptomLoad(log: DailyLog) {
  return Object.values(log.symptoms).reduce((total, severity) => total + severityScore[severity], 0);
}

export function getHistoryPatternSummary(recentLogs: DailyLog[], medicationLogs: MedicationLog[]) {
  const latestDoseIncrease = medicationLogs.find((log) => log.isDoseIncrease);
  const delayedOrMissedCount = medicationLogs.filter((log) => log.status === "delayed" || log.status === "missed").length;
  const roughMealDays = recentLogs.filter((log) => log.mealsConsumed.some((meal) => meal.tolerance === "rough")).length;
  const difficultFoodMoodDays = recentLogs.filter((log) => log.foodMood === "anxious" || log.foodMood === "sad" || log.foodMood === "overwhelmed").length;
  const averageFoodNoise =
    recentLogs.length === 0 ? 0 : Math.round((recentLogs.reduce((sum, log) => sum + log.foodNoiseLevel, 0) / recentLogs.length) * 10) / 10;
  const averageSymptomLoad =
    recentLogs.length === 0 ? 0 : Math.round((recentLogs.reduce((sum, log) => sum + getSymptomLoad(log), 0) / recentLogs.length) * 10) / 10;
  const movementDays = recentLogs.filter((log) => log.movement.length > 0).length;
  const strengthDays = recentLogs.filter((log) => log.movement.includes("Strength session")).length;
  const proteinSupplementDays = recentLogs.filter((log) => log.supplements.includes("Protein supplement")).length;

  const symptomDaysAfterDoseIncrease = latestDoseIncrease
    ? recentLogs.filter((log) => log.date >= latestDoseIncrease.date && getSymptomLoad(log) > 0).length
    : 0;

  const insights: string[] = [];

  if (latestDoseIncrease && symptomDaysAfterDoseIncrease > 0) {
    insights.push(`Symptoms have been active on ${symptomDaysAfterDoseIncrease} logged day(s) since the latest dose increase on ${latestDoseIncrease.date}.`);
  }

  if (delayedOrMissedCount > 0) {
    insights.push(`${delayedOrMissedCount} delayed or missed shot event(s) are in the current medication timeline.`);
  }

  if (roughMealDays > 0) {
    insights.push(`Rough meal responses were logged on ${roughMealDays} day(s), which can be compared against medication changes and symptom load.`);
  }

  if (difficultFoodMoodDays > 0) {
    insights.push(`Food felt emotionally harder on ${difficultFoodMoodDays} logged day(s), with average food noise at ${averageFoodNoise}/5.`);
  }

  if (proteinSupplementDays === 0) {
    insights.push("No protein supplement support is logged in the recent window. On lower-appetite stretches, that is often the easiest protein gap to close.");
  }

  if (strengthDays === 0) {
    insights.push("No strength work is logged in the recent window. Protein plus resistance work is still the better lean-mass preservation pattern.");
  } else if (movementDays <= 2) {
    insights.push(`Movement is only logged on ${movementDays} day(s), so habit consistency is still thin even with some activity present.`);
  }

  if (insights.length === 0) {
    insights.push("No strong medication or tolerance signal stands out yet. Keep logging to make correlations more reliable.");
  }

  return {
    averageSymptomLoad,
    delayedOrMissedCount,
    roughMealDays,
    difficultFoodMoodDays,
    averageFoodNoise,
    movementDays,
    strengthDays,
    proteinSupplementDays,
    symptomDaysAfterDoseIncrease,
    latestDoseIncreaseDate: latestDoseIncrease?.date ?? null,
    insights,
  };
}

export function getDailyCorrelationSeries(recentLogs: DailyLog[], medicationLogs: MedicationLog[]) {
  return recentLogs.map((log) => {
    const medicationEvents = medicationLogs.filter((medicationLog) => medicationLog.date === log.date);

    return {
      date: log.date,
      symptomLoad: getSymptomLoad(log),
      hydrationOz: log.hydrationOz,
      appetiteLevel: log.appetiteLevel,
      foodNoiseLevel: log.foodNoiseLevel,
      foodMood: log.foodMood,
      supplementCount: log.supplements.length,
      movementCount: log.movement.length,
      strengthLogged: log.movement.includes("Strength session"),
      proteinSupplementLogged: log.supplements.includes("Protein supplement"),
      roughMeals: log.mealsConsumed.filter((meal) => meal.tolerance === "rough").length,
      medicationStatuses: medicationEvents.map((event) => event.status ?? "completed"),
      doseIncrease: medicationEvents.some((event) => event.isDoseIncrease),
    };
  });
}
