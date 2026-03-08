import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog, defaultUserProfile } from "../../domain/defaults";
import {
  getActiveSymptoms,
  getDashboardMessages,
  getEmergencyFoods,
  getHydrationRiskSummary,
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
});
