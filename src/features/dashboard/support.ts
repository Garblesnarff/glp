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
      const haystack = `${recipe.name} ${recipe.notes ?? ""}`.toLowerCase();

      if (shotDay) {
        return /smoothie|yogurt|soup|cottage|oats/i.test(haystack);
      }

      if (appetite === "none") {
        return /smoothie|yogurt|cottage/i.test(haystack);
      }

      if (appetite === "low") {
        return /smoothie|yogurt|cottage|soup|bowl/i.test(haystack);
      }

      return recipe.tags.includes("quick") || recipe.tags.includes("no-cook");
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
      const haystack = `${recipe.name} ${recipe.notes ?? ""}`.toLowerCase();

      if (shotDay) {
        return /smoothie|yogurt|soup|cottage|oats|bowl/i.test(haystack);
      }

      if (appetite === "none") {
        return /smoothie|yogurt|cottage/i.test(haystack);
      }

      if (appetite === "low") {
        return recipe.tags.includes("quick") || /smoothie|yogurt|cottage|soup/i.test(haystack);
      }

      return recipe.meal !== "snack";
    })
    .sort((a, b) => b.protein - a.protein)
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
