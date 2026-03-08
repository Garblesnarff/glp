import { RECIPES } from "../meal-planner/data/recipes";
import type { Recipe } from "../meal-planner/types";
import type { AppetiteLevel, DailyLog, DailyLogMealEntry, Severity, SymptomType, UserProfile } from "../../domain/types";

const severityScore: Record<Severity, number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

const symptomAdvice: Record<SymptomType, string> = {
  nausea: "Cold, bland foods and smaller portions tend to land better.",
  fullness: "Mini meals and soft protein foods are usually easier than full plates.",
  constipation: "Increase fluids and use gentler fiber sources like fruit, lentils, or chia.",
  diarrhea: "Prioritize hydration and simpler foods while your stomach settles.",
  reflux: "Keep meals smaller and avoid heavier foods late in the day.",
  stomachPain: "Use very gentle foods and monitor for worsening symptoms.",
  fatigue: "Aim for hydration first, then easy protein if appetite allows.",
  injectionSite: "Keep the day light and focus on what feels easy to tolerate.",
};

export function getActiveSymptoms(log: DailyLog) {
  return (Object.entries(log.symptoms) as Array<[SymptomType, Severity]>)
    .filter(([, severity]) => severity !== "none")
    .sort((a, b) => severityScore[b[1]] - severityScore[a[1]]);
}

export function needsElectrolytePrompt(log: DailyLog) {
  return severityScore[log.symptoms.diarrhea] >= 2 || severityScore[log.symptoms.nausea] >= 3;
}

export function hasRedFlagSymptoms(log: DailyLog) {
  return severityScore[log.symptoms.stomachPain] >= 3;
}

export function isShotDaySupportActive(profile: UserProfile, referenceDate = new Date()) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shotDayIndex = weekdays.indexOf(profile.shotDay);

  if (shotDayIndex === -1) {
    return false;
  }

  const currentDayIndex = referenceDate.getDay();
  const daysSinceShot = (currentDayIndex - shotDayIndex + 7) % 7;

  return daysSinceShot <= 2;
}

export function getDashboardMessages(profile: UserProfile, log: DailyLog) {
  const activeSymptoms = getActiveSymptoms(log);
  const messages = activeSymptoms.slice(0, 3).map(([symptom]) => symptomAdvice[symptom]);

  if (isShotDaySupportActive(profile)) {
    messages.unshift("Shot-day mode is active. Favor gentle foods, slower eating, and smaller portions.");
  }

  if (needsElectrolytePrompt(log)) {
    messages.unshift("Hydration risk is higher today. Consider water plus electrolytes if your stomach allows.");
  }

  if (messages.length === 0) {
    messages.push("No major symptoms logged. This is a good day to keep building protein and hydration consistency.");
  }

  return messages.slice(0, 3);
}

export function getEmergencyFoods(profile: UserProfile, log: DailyLog, recipes: Recipe[] = RECIPES) {
  const appetite = log.appetiteLevel;
  const shotDay = isShotDaySupportActive(profile);

  return recipes
    .filter((recipe) => recipe.meal !== "dinner")
    .filter((recipe) => {
      if (shotDay && !recipe.glp1.shotDayFriendly) {
        return false;
      }

      if (!recipe.glp1.appetiteLevel.includes(appetite)) {
        return false;
      }

      return recipe.canBlendOrSip || recipe.glp1.nauseaFriendly || recipe.glp1.heaviness <= 2;
    })
    .sort((a, b) => b.protein - a.protein)
    .slice(0, 3);
}

export function getDashboardMealRecommendations(profile: UserProfile, log: DailyLog, recipes: Recipe[] = RECIPES, recentLogs: DailyLog[] = []) {
  const appetite = log.appetiteLevel;
  const shotDay = isShotDaySupportActive(profile);
  const recommendationScores = getRecipeRecommendationScores(profile, log, recentLogs, recipes);

  return recipes
    .filter((recipe) => recipe.tags.includes("high-protein") || recipe.protein >= 24)
    .filter((recipe) => {
      if ((recommendationScores.get(recipe.id) ?? 0) <= -2) {
        return false;
      }

      if (!recipe.glp1.appetiteLevel.includes(appetite)) {
        return false;
      }

      if (shotDay) {
        return recipe.glp1.shotDayFriendly && recipe.glp1.heaviness <= 2;
      }

      if (appetite === "none") {
        return recipe.canBlendOrSip || recipe.glp1.nauseaFriendly;
      }

      if (appetite === "low") {
        return recipe.glp1.heaviness <= 3;
      }

      return recipe.meal !== "snack" && !recipe.glp1.avoidWhen.includes("severe reflux");
    })
    .sort((a, b) => {
      const scoreDelta = (recommendationScores.get(b.id) ?? 0) - (recommendationScores.get(a.id) ?? 0);
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      const heavinessDelta = a.glp1.heaviness - b.glp1.heaviness;
      if (heavinessDelta !== 0) {
        return heavinessDelta;
      }
      return b.protein - a.protein;
    })
    .slice(0, 3);
}

export function getRecipeRecommendationReasons(recipe: Recipe, profile: UserProfile, log: DailyLog, recentLogs: DailyLog[] = []) {
  const reasons: string[] = [];
  const shotDay = isShotDaySupportActive(profile);
  const toleranceScore = getRecipeToleranceScores(recentLogs).get(recipe.id) ?? 0;
  const recentSignals = getRecentSymptomSignals(recentLogs);

  if (shotDay && recipe.glp1.shotDayFriendly) {
    reasons.push("Shot-day friendly");
  }

  if (log.appetiteLevel === "none" && recipe.canBlendOrSip) {
    reasons.push("Easy to sip");
  } else if (log.appetiteLevel !== "normal" && recipe.glp1.appetiteLevel.includes(log.appetiteLevel)) {
    reasons.push("Fits low appetite");
  }

  if (severityScore[log.symptoms.nausea] >= 1 && recipe.glp1.nauseaFriendly) {
    reasons.push("Gentler on nausea");
  }

  if (severityScore[log.symptoms.reflux] >= 1 && recipe.glp1.refluxFriendly) {
    reasons.push("Reflux-friendlier");
  }

  if (severityScore[log.symptoms.constipation] >= 1 && recipe.glp1.constipationSupport !== "none") {
    reasons.push(`${recipe.glp1.constipationSupport} fiber support`);
  }

  if (recentSignals.nauseaDays >= 2 && recipe.glp1.nauseaFriendly) {
    reasons.push("Matches recent nausea pattern");
  }

  if (recentSignals.refluxDays >= 2 && recipe.glp1.refluxFriendly) {
    reasons.push("Matches recent reflux pattern");
  }

  if ((log.foodMood === "anxious" || log.foodMood === "sad" || log.foodMood === "overwhelmed") && recipe.glp1.heaviness <= 2) {
    reasons.push("Lower-pressure option");
  }

  if (log.foodNoiseLevel <= 2 && recipe.recommendedPortion !== "full") {
    reasons.push("Fits low food-noise day");
  }

  if (toleranceScore > 0) {
    reasons.push("Previously tolerated");
  }

  if (reasons.length === 0 && recipe.glp1.heaviness <= 2) {
    reasons.push("Lighter option");
  }

  if (reasons.length === 0 && recipe.recommendedPortion !== "full") {
    reasons.push(`${recipe.recommendedPortion} portion fit`);
  }

  return reasons.slice(0, 3);
}

export function getRecipeRecommendationScores(
  profile: UserProfile,
  log: DailyLog,
  recentLogs: DailyLog[],
  recipes: Recipe[] = RECIPES,
) {
  const shotDay = isShotDaySupportActive(profile);
  const toleranceScores = getRecipeToleranceScores(recentLogs);
  const recentSignals = getRecentSymptomSignals(recentLogs);
  const scores = new Map<string, number>();

  recipes.forEach((recipe) => {
    let score = toleranceScores.get(recipe.id) ?? 0;

    if (shotDay && recipe.glp1.shotDayFriendly) {
      score += 2;
    }
    if (shotDay && recipe.glp1.heaviness <= 2) {
      score += 1;
    }

    if (log.appetiteLevel === "none" && recipe.canBlendOrSip) {
      score += 3;
    } else if (log.appetiteLevel !== "normal" && recipe.glp1.appetiteLevel.includes(log.appetiteLevel)) {
      score += 2;
    }

    if (severityScore[log.symptoms.nausea] >= 1 && recipe.glp1.nauseaFriendly) {
      score += 2;
    }
    if (severityScore[log.symptoms.reflux] >= 1 && recipe.glp1.refluxFriendly) {
      score += 2;
    }
    if (severityScore[log.symptoms.constipation] >= 1) {
      score += supportValue(recipe.glp1.constipationSupport);
    }

    if (recentSignals.nauseaDays >= 2 && recipe.glp1.nauseaFriendly) {
      score += 1;
    }
    if (recentSignals.refluxDays >= 2 && recipe.glp1.refluxFriendly) {
      score += 1;
    }
    if (recentSignals.lowAppetiteDays >= 3 && recipe.glp1.heaviness <= 2) {
      score += 1;
    }
    if ((log.foodMood === "anxious" || log.foodMood === "sad" || log.foodMood === "overwhelmed") && recipe.glp1.heaviness <= 2) {
      score += 1;
    }
    if (log.foodNoiseLevel <= 2 && recipe.recommendedPortion !== "full") {
      score += 1;
    }

    if (recipe.glp1.heaviness >= 4 && (severityScore[log.symptoms.nausea] >= 1 || recentSignals.nauseaDays >= 2)) {
      score -= 2;
    }
    if (!recipe.glp1.refluxFriendly && (severityScore[log.symptoms.reflux] >= 1 || recentSignals.refluxDays >= 2)) {
      score -= 2;
    }

    scores.set(recipe.id, score);
  });

  return scores;
}

export function getFoodRelationshipSupport(log: DailyLog, recentLogs: DailyLog[]) {
  const previousLogs = recentLogs.filter((entry) => entry.date !== log.date);
  const previousAverageNoise =
    previousLogs.length === 0 ? log.foodNoiseLevel : previousLogs.reduce((sum, entry) => sum + entry.foodNoiseLevel, 0) / previousLogs.length;
  const difficultRecentDays = previousLogs.filter(
    (entry) => entry.foodMood === "anxious" || entry.foodMood === "sad" || entry.foodMood === "overwhelmed",
  ).length;

  const messages: string[] = [];

  if (log.foodMood === "anxious" || log.foodMood === "overwhelmed") {
    messages.push("Food feels emotionally heavier today. Make the decision smaller: pick one gentle protein option and stop there.");
  }

  if (log.foodMood === "sad") {
    messages.push("If food is not giving the usual comfort, aim for something steady and familiar rather than chasing the old reward feeling.");
  }

  if (log.foodNoiseLevel <= 2) {
    messages.push("Food noise is low today. That can be a real win, even if it also feels unfamiliar.");
  }

  if (log.foodNoiseLevel < previousAverageNoise) {
    messages.push("Food noise is lower than your recent average. That is meaningful progress worth noticing.");
  }

  if ((log.foodMood === "neutral" || log.foodMood === "excited") && difficultRecentDays >= 2) {
    messages.push("Food feels a bit easier today than it has recently. Treat that as a sign of adjustment, not something you need to test.");
  }

  if (messages.length === 0) {
    messages.push("Keep logging food mood and food noise. The goal is to notice the relationship shift without judging it.");
  }

  return {
    previousAverageNoise: Math.round(previousAverageNoise * 10) / 10,
    difficultRecentDays,
    messages: messages.slice(0, 3),
  };
}

export function getHydrationStatus(profile: UserProfile, log: DailyLog) {
  const remaining = Math.max(0, profile.hydrationGoal - log.hydrationOz);

  if (remaining === 0) {
    return "Hydration goal met. Anything extra today is a bonus.";
  }

  if (remaining <= 16) {
    return `${remaining} oz left to hit today's hydration goal.`;
  }

  return `${remaining} oz left today. Keep working in small steady amounts.`;
}

export function appetiteLabel(level: AppetiteLevel) {
  if (level === "none") {
    return "No appetite";
  }

  if (level === "low") {
    return "Low appetite";
  }

  return "Normal appetite";
}

export function getHydrationRiskSummary(profile: UserProfile, log: DailyLog) {
  const hydrationLow = log.hydrationOz < profile.hydrationGoal * 0.5;
  const vomitingRisk = severityScore[log.symptoms.nausea] >= 3;
  const diarrheaRisk = severityScore[log.symptoms.diarrhea] >= 2;

  if ((vomitingRisk || diarrheaRisk) && hydrationLow) {
    return {
      level: "high",
      message: "Hydration risk is elevated today because fluid intake is low and GI symptoms are active.",
    } as const;
  }

  if (needsElectrolytePrompt(log) || hydrationLow) {
    return {
      level: "moderate",
      message: "Keep fluids steady today and consider electrolytes if symptoms continue.",
    } as const;
  }

  return {
    level: "low",
    message: "Hydration risk looks manageable right now.",
  } as const;
}

export function getRecentLogTrendSummary(recentLogs: DailyLog[]) {
  if (recentLogs.length === 0) {
    return {
      symptomDays: 0,
      avgHydrationOz: 0,
      constipationDays: 0,
      nauseaDays: 0,
      lowAppetiteDays: 0,
      avgFoodNoise: 0,
      difficultFoodMoodDays: 0,
      supplementDays: 0,
      proteinSupplementDays: 0,
      movementDays: 0,
      strengthDays: 0,
    };
  }

  const totals = recentLogs.reduce(
    (acc, log) => {
      const hasSymptoms = getActiveSymptoms(log).length > 0;
      if (hasSymptoms) {
        acc.symptomDays += 1;
      }
      if (severityScore[log.symptoms.constipation] >= 1) {
        acc.constipationDays += 1;
      }
      if (severityScore[log.symptoms.nausea] >= 1) {
        acc.nauseaDays += 1;
      }
      if (log.appetiteLevel !== "normal") {
        acc.lowAppetiteDays += 1;
      }
      if (log.foodMood === "anxious" || log.foodMood === "sad" || log.foodMood === "overwhelmed") {
        acc.difficultFoodMoodDays += 1;
      }
      if (log.supplements.length > 0) {
        acc.supplementDays += 1;
      }
      if (log.supplements.includes("Protein supplement")) {
        acc.proteinSupplementDays += 1;
      }
      if (log.movement.length > 0) {
        acc.movementDays += 1;
      }
      if (log.movement.includes("Strength session")) {
        acc.strengthDays += 1;
      }
      acc.totalHydrationOz += log.hydrationOz;
      acc.totalFoodNoise += log.foodNoiseLevel;
      return acc;
    },
    {
      symptomDays: 0,
      constipationDays: 0,
      nauseaDays: 0,
      lowAppetiteDays: 0,
      totalHydrationOz: 0,
      difficultFoodMoodDays: 0,
      totalFoodNoise: 0,
      supplementDays: 0,
      proteinSupplementDays: 0,
      movementDays: 0,
      strengthDays: 0,
    },
  );

  return {
    symptomDays: totals.symptomDays,
    avgHydrationOz: Math.round(totals.totalHydrationOz / recentLogs.length),
    constipationDays: totals.constipationDays,
    nauseaDays: totals.nauseaDays,
    lowAppetiteDays: totals.lowAppetiteDays,
    avgFoodNoise: Math.round((totals.totalFoodNoise / recentLogs.length) * 10) / 10,
    difficultFoodMoodDays: totals.difficultFoodMoodDays,
    supplementDays: totals.supplementDays,
    proteinSupplementDays: totals.proteinSupplementDays,
    movementDays: totals.movementDays,
    strengthDays: totals.strengthDays,
  };
}

export function getDailyChecklistSummary(log: DailyLog) {
  const supplementTargetCount = 5;
  const movementDone = log.movement.length > 0;
  const strengthDone = log.movement.includes("Strength session");

  let movementSummary = "No movement logged yet.";
  if (strengthDone) {
    movementSummary = "Strength work is logged today.";
  } else if (movementDone) {
    movementSummary = "Light movement is logged today.";
  }

  return {
    supplementTargetCount,
    movementSummary,
  };
}

export function getSupportHabitsSummary(log: DailyLog, recentLogs: DailyLog[]) {
  const proteinSupplementLogged = log.supplements.includes("Protein supplement");
  const strengthLoggedToday = log.movement.includes("Strength session");
  const recentMovementDays = recentLogs.filter((entry) => entry.movement.length > 0).length;
  const recentStrengthDays = recentLogs.filter((entry) => entry.movement.includes("Strength session")).length;
  const recentProteinSupplementDays = recentLogs.filter((entry) => entry.supplements.includes("Protein supplement")).length;
  const proteinToday = log.mealsConsumed.reduce((sum, meal) => sum + meal.actualProtein, 0);

  const messages: string[] = [];

  if (proteinToday < 60 && !proteinSupplementLogged && log.appetiteLevel !== "normal") {
    messages.push("Protein is still light today. A shake or other protein supplement may be the easiest catch-up move.");
  } else if (proteinSupplementLogged) {
    messages.push("Protein supplement support is already logged today.");
  }

  if (strengthLoggedToday) {
    messages.push("Strength work is logged today, which supports lean-mass preservation.");
  } else if (recentStrengthDays === 0) {
    messages.push("No strength work is logged in the last week. Even one short session would meaningfully support lean-mass preservation.");
  } else if (recentMovementDays <= 2) {
    messages.push("Movement has been light across the last week. Aim for another short walk or mobility block today.");
  }

  if (recentProteinSupplementDays === 0 && log.appetiteLevel !== "normal") {
    messages.push("Low-appetite days are being logged without protein supplement support so far. That is a good gap to close first.");
  }

  if (messages.length === 0) {
    messages.push("Support habits look reasonably steady right now. Keep protein, hydration, and movement consistent.");
  }

  return {
    proteinSupplementLogged,
    strengthLoggedToday,
    recentMovementDays,
    recentStrengthDays,
    recentProteinSupplementDays,
    messages: messages.slice(0, 3),
  };
}

export function getRecentMealFeedbackSummary(recentLogs: DailyLog[]) {
  const meals = recentLogs.flatMap((log) => log.mealsConsumed);

  return meals.reduce(
    (summary, meal) => {
      summary.loggedMeals += 1;
      if (meal.tolerance === "easy") {
        summary.easyMeals += 1;
      }
      if (meal.tolerance === "rough") {
        summary.roughMeals += 1;
      }
      if (meal.wouldRepeat === true) {
        summary.repeatYesMeals += 1;
      }
      return summary;
    },
    {
      loggedMeals: 0,
      easyMeals: 0,
      roughMeals: 0,
      repeatYesMeals: 0,
    },
  );
}

export function getDaysSinceLastBowelMovement(log: DailyLog, recentLogs: DailyLog[]) {
  if (log.bowelMovement) {
    return 0;
  }

  const sortedLogs = [log, ...recentLogs.filter((entry) => entry.date !== log.date)].sort((a, b) => b.date.localeCompare(a.date));
  const lastIndex = sortedLogs.findIndex((entry) => entry.bowelMovement);

  return lastIndex === -1 ? null : lastIndex;
}

export function getConstipationSupportPlan(profile: UserProfile, log: DailyLog, recentLogs: DailyLog[], recipes: Recipe[] = RECIPES) {
  const daysSinceBowelMovement = getDaysSinceLastBowelMovement(log, recentLogs);
  const constipationActive = severityScore[log.symptoms.constipation] >= 1;
  const escalationActive = daysSinceBowelMovement !== null ? daysSinceBowelMovement >= 3 : constipationActive;
  const movementDone = log.movement.includes("10-minute walk");

  const prompts = [
    `${Math.max(0, profile.hydrationGoal - log.hydrationOz)} oz remain toward today's hydration goal.`,
    movementDone ? "Short movement is already logged today." : "A short walk can help move things along when constipation is active.",
    escalationActive
      ? "Constipation has persisted long enough that it may need escalation instead of just waiting it out."
      : "Favor gentle fiber today instead of forcing very heavy foods if your stomach feels sensitive.",
  ];

  const recipeSuggestions = recipes
    .filter((recipe) => recipe.glp1.constipationSupport === "medium" || recipe.glp1.constipationSupport === "high")
    .filter((recipe) => recipe.glp1.appetiteLevel.includes(log.appetiteLevel))
    .sort((a, b) => {
      const supportRank = supportValue(b.glp1.constipationSupport) - supportValue(a.glp1.constipationSupport);
      if (supportRank !== 0) {
        return supportRank;
      }
      return a.glp1.heaviness - b.glp1.heaviness;
    })
    .slice(0, 3);

  return {
    daysSinceBowelMovement,
    escalationActive,
    movementDone,
    prompts,
    recipeSuggestions,
  };
}

function getRecipeToleranceScores(recentLogs: DailyLog[]) {
  const scores = new Map<string, number>();

  recentLogs.flatMap((log) => log.mealsConsumed).forEach((meal) => {
    const current = scores.get(meal.recipeId) ?? 0;
    scores.set(meal.recipeId, current + getMealEntryScore(meal));
  });

  return scores;
}

function getMealEntryScore(meal: DailyLogMealEntry) {
  let score = 0;

  if (meal.tolerance === "easy") {
    score += 2;
  } else if (meal.tolerance === "okay") {
    score += 1;
  } else if (meal.tolerance === "rough") {
    score -= 3;
  }

  if (meal.wouldRepeat === true) {
    score += 1;
  } else if (meal.wouldRepeat === false) {
    score -= 1;
  }

  return score;
}

function supportValue(level: "none" | "low" | "medium" | "high") {
  if (level === "high") {
    return 3;
  }
  if (level === "medium") {
    return 2;
  }
  if (level === "low") {
    return 1;
  }
  return 0;
}

function getRecentSymptomSignals(recentLogs: DailyLog[]) {
  return recentLogs.reduce(
    (acc, log) => {
      if (severityScore[log.symptoms.nausea] >= 1) {
        acc.nauseaDays += 1;
      }
      if (severityScore[log.symptoms.reflux] >= 1) {
        acc.refluxDays += 1;
      }
      if (log.appetiteLevel !== "normal") {
        acc.lowAppetiteDays += 1;
      }
      return acc;
    },
    {
      nauseaDays: 0,
      refluxDays: 0,
      lowAppetiteDays: 0,
    },
  );
}
