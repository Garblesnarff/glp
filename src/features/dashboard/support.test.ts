import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog, defaultUserProfile } from "../../domain/defaults";
import {
  getActiveSymptoms,
  getDashboardMealRecommendations,
  getDashboardMessages,
  getEmergencyFoods,
  getHydrationRiskSummary,
  getRecentMealFeedbackSummary,
  getRecentLogTrendSummary,
  getRecipeRecommendationReasons,
  needsElectrolytePrompt,
} from "./support";
import { RECIPES } from "../meal-planner/data/recipes";

describe("dashboard support", () => {
  test("sorts active symptoms by severity", () => {
    const log = createDefaultDailyLog("2026-03-07");
    log.symptoms.nausea = "mild";
    log.symptoms.diarrhea = "severe";

    const active = getActiveSymptoms(log);

    expect(active[0]?.[0]).toBe("diarrhea");
    expect(active[1]?.[0]).toBe("nausea");
  });

  test("prompts electrolytes for rough GI days", () => {
    const log = createDefaultDailyLog("2026-03-07");
    log.symptoms.diarrhea = "moderate";

    expect(needsElectrolytePrompt(log)).toBe(true);
  });

  test("produces contextual dashboard guidance", () => {
    const profile = { ...defaultUserProfile, shotDay: "Saturday" };
    const log = createDefaultDailyLog("2026-03-07");
    log.symptoms.constipation = "mild";

    const messages = getDashboardMessages(profile, log);

    expect(messages.length).toBeGreaterThan(0);
  });

  test("returns gentle emergency foods", () => {
    const profile = { ...defaultUserProfile, shotDay: "Saturday" };
    const log = createDefaultDailyLog("2026-03-07");
    log.appetiteLevel = "none";

    const foods = getEmergencyFoods(profile, log);

    expect(foods.length).toBeGreaterThan(0);
  });

  test("flags high hydration risk when intake is low and GI symptoms are active", () => {
    const profile = defaultUserProfile;
    const log = createDefaultDailyLog("2026-03-07");
    log.hydrationOz = 12;
    log.symptoms.diarrhea = "moderate";

    const risk = getHydrationRiskSummary(profile, log);

    expect(risk.level).toBe("high");
  });

  test("summarizes recent trends across logs", () => {
    const first = createDefaultDailyLog("2026-03-07");
    first.hydrationOz = 40;
    first.symptoms.nausea = "mild";
    const second = createDefaultDailyLog("2026-03-06");
    second.hydrationOz = 64;
    second.appetiteLevel = "low";

    const summary = getRecentLogTrendSummary([first, second]);

    expect(summary.avgHydrationOz).toBe(52);
    expect(summary.nauseaDays).toBe(1);
    expect(summary.lowAppetiteDays).toBe(1);
  });

  test("explains why a recipe was recommended", () => {
    const profile = { ...defaultUserProfile, shotDay: "Saturday" };
    const log = createDefaultDailyLog("2026-03-07");
    log.appetiteLevel = "none";
    log.symptoms.nausea = "mild";

    const recipe = RECIPES.find((candidate) => candidate.id === "b5");
    expect(recipe).toBeDefined();

    const reasons = getRecipeRecommendationReasons(recipe!, profile, log);

    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons).toContain("Shot-day friendly");
  });

  test("uses recent tolerance to bias future recommendations", () => {
    const profile = { ...defaultUserProfile, shotDay: "Wednesday" };
    const log = createDefaultDailyLog("2026-03-07");
    log.appetiteLevel = "none";
    const historicalLog = createDefaultDailyLog("2026-03-06");
    historicalLog.mealsConsumed = [
      {
        recipeId: "b5",
        mealType: "breakfast",
        portion: "half",
        actualProtein: 23,
        actualFiber: 5,
        actualCalories: 240,
        tolerance: "easy",
        wouldRepeat: true,
      },
      {
        recipeId: "d3",
        mealType: "dinner",
        portion: "full",
        actualProtein: 36,
        actualFiber: 15,
        actualCalories: 390,
        tolerance: "rough",
        wouldRepeat: false,
      },
    ];

    const recommendations = getDashboardMealRecommendations(profile, log, RECIPES, [historicalLog]);
    const ids = recommendations.map((recipe) => recipe.id);
    const toleratedRecipe = recommendations.find((recipe) => recipe.id === "b5");

    expect(ids).not.toContain("d3");
    expect(toleratedRecipe).toBeDefined();
    expect(getRecipeRecommendationReasons(toleratedRecipe!, profile, log, [historicalLog])).toContain("Previously tolerated");
  });

  test("summarizes recent meal feedback", () => {
    const first = createDefaultDailyLog("2026-03-07");
    first.mealsConsumed = [
      {
        recipeId: "b5",
        mealType: "breakfast",
        portion: "half",
        actualProtein: 23,
        actualFiber: 5,
        actualCalories: 240,
        tolerance: "easy",
        wouldRepeat: true,
      },
      {
        recipeId: "l3",
        mealType: "lunch",
        portion: "half",
        actualProtein: 17,
        actualFiber: 7,
        actualCalories: 190,
        tolerance: "rough",
        wouldRepeat: false,
      },
    ];

    const summary = getRecentMealFeedbackSummary([first]);

    expect(summary.loggedMeals).toBe(2);
    expect(summary.easyMeals).toBe(1);
    expect(summary.roughMeals).toBe(1);
    expect(summary.repeatYesMeals).toBe(1);
  });
});
