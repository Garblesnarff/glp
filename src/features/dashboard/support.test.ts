import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog, defaultUserProfile } from "../../domain/defaults";
import {
  getActiveSymptoms,
  getDashboardMealRecommendations,
  getDashboardMessages,
  getConstipationSupportPlan,
  getDailyChecklistSummary,
  getDaysSinceLastBowelMovement,
  getEmergencyFoods,
  getFoodRelationshipSupport,
  getHydrationRiskSummary,
  getRecentMealFeedbackSummary,
  getRecentLogTrendSummary,
  getRecipeRecommendationScores,
  getRecipeRecommendationReasons,
  getSupportHabitsSummary,
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
    first.foodNoiseLevel = 2;
    first.supplements = ["Protein supplement", "Magnesium"];
    first.movement = ["10-minute walk"];
    const second = createDefaultDailyLog("2026-03-06");
    second.hydrationOz = 64;
    second.appetiteLevel = "low";
    second.foodMood = "anxious";
    second.foodNoiseLevel = 4;
    second.supplements = ["Multivitamin"];
    second.movement = ["Strength session"];

    const summary = getRecentLogTrendSummary([first, second]);

    expect(summary.avgHydrationOz).toBe(52);
    expect(summary.nauseaDays).toBe(1);
    expect(summary.lowAppetiteDays).toBe(1);
    expect(summary.avgFoodNoise).toBe(3);
    expect(summary.difficultFoodMoodDays).toBe(1);
    expect(summary.supplementDays).toBe(2);
    expect(summary.proteinSupplementDays).toBe(1);
    expect(summary.movementDays).toBe(2);
    expect(summary.strengthDays).toBe(1);
  });

  test("summarizes supplement and movement checklist state", () => {
    const log = createDefaultDailyLog("2026-03-07");
    log.supplements = ["Protein supplement", "Magnesium"];
    log.movement = ["Strength session"];

    const summary = getDailyChecklistSummary(log);

    expect(summary.supplementTargetCount).toBe(5);
    expect(summary.movementSummary).toBe("Strength work is logged today.");
  });

  test("builds adherence-oriented support habit guidance", () => {
    const today = createDefaultDailyLog("2026-03-07");
    today.appetiteLevel = "low";
    today.mealsConsumed = [];
    const previous = createDefaultDailyLog("2026-03-06");
    previous.appetiteLevel = "low";

    const summary = getSupportHabitsSummary(today, [previous]);

    expect(summary.messages[0]).toContain("Protein");
    expect(summary.messages.some((message) => message.includes("No strength work"))).toBe(true);
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

  test("uses recent symptom patterns to score gentler recipes higher", () => {
    const profile = { ...defaultUserProfile, shotDay: "Wednesday" };
    const log = createDefaultDailyLog("2026-03-07");
    log.appetiteLevel = "low";
    log.symptoms.nausea = "mild";
    const historicalOne = createDefaultDailyLog("2026-03-06");
    historicalOne.symptoms.nausea = "moderate";
    const historicalTwo = createDefaultDailyLog("2026-03-05");
    historicalTwo.symptoms.nausea = "mild";

    const scores = getRecipeRecommendationScores(profile, log, [historicalOne, historicalTwo], RECIPES);
    const smoothie = RECIPES.find((recipe) => recipe.id === "b5");

    expect((scores.get("b5") ?? 0)).toBeGreaterThan(scores.get("d3") ?? 0);
    expect(getRecipeRecommendationReasons(smoothie!, profile, log, [historicalOne, historicalTwo])).toContain("Matches recent nausea pattern");
  });

  test("builds food relationship coaching from current and recent signals", () => {
    const today = createDefaultDailyLog("2026-03-07");
    today.foodMood = "anxious";
    today.foodNoiseLevel = 2;
    const previous = createDefaultDailyLog("2026-03-06");
    previous.foodMood = "overwhelmed";
    previous.foodNoiseLevel = 4;

    const support = getFoodRelationshipSupport(today, [today, previous]);

    expect(support.messages.length).toBeGreaterThan(0);
    expect(support.messages.some((message) => message.includes("Food noise is lower"))).toBe(true);
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

  test("tracks days since last bowel movement", () => {
    const today = createDefaultDailyLog("2026-03-07");
    const yesterday = createDefaultDailyLog("2026-03-06");
    const twoDaysAgo = createDefaultDailyLog("2026-03-05");
    twoDaysAgo.bowelMovement = true;

    const days = getDaysSinceLastBowelMovement(today, [yesterday, twoDaysAgo]);

    expect(days).toBe(2);
  });

  test("builds a constipation support plan with escalation", () => {
    const profile = defaultUserProfile;
    const today = createDefaultDailyLog("2026-03-07");
    today.symptoms.constipation = "moderate";
    const previous = createDefaultDailyLog("2026-03-06");

    const plan = getConstipationSupportPlan(profile, today, [previous]);

    expect(plan.escalationActive).toBe(true);
    expect(plan.recipeSuggestions.length).toBeGreaterThan(0);
  });
});
