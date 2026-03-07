import { RECIPES } from "../meal-planner/data/recipes";
import type { Recipe } from "../meal-planner/types";
import type { AppetiteLevel, DailyLog, Severity, SymptomType, UserProfile } from "../../domain/types";

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

export function getDashboardMealRecommendations(profile: UserProfile, log: DailyLog, recipes: Recipe[] = RECIPES) {
  const appetite = log.appetiteLevel;
  const shotDay = isShotDaySupportActive(profile);

  return recipes
    .filter((recipe) => recipe.tags.includes("high-protein"))
    .filter((recipe) => {
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
      const heavinessDelta = a.glp1.heaviness - b.glp1.heaviness;
      if (heavinessDelta !== 0) {
        return heavinessDelta;
      }
      return b.protein - a.protein;
    })
    .slice(0, 3);
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
      acc.totalHydrationOz += log.hydrationOz;
      return acc;
    },
    {
      symptomDays: 0,
      constipationDays: 0,
      nauseaDays: 0,
      lowAppetiteDays: 0,
      totalHydrationOz: 0,
    },
  );

  return {
    symptomDays: totals.symptomDays,
    avgHydrationOz: Math.round(totals.totalHydrationOz / recentLogs.length),
    constipationDays: totals.constipationDays,
    nauseaDays: totals.nauseaDays,
    lowAppetiteDays: totals.lowAppetiteDays,
  };
}
