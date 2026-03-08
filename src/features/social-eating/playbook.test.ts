import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog, defaultUserProfile } from "../../domain/defaults";
import { getCuisinePlaybook, getDiningOutContext, getSocialScripts } from "./playbook";

describe("social eating playbook", () => {
  test("adapts dining context to symptoms and shot-day support", () => {
    const profile = { ...defaultUserProfile, shotDay: "Sunday" };
    const log = createDefaultDailyLog("2026-03-08");
    log.appetiteLevel = "low";
    log.symptoms.nausea = "mild";

    const context = getDiningOutContext(profile, log);

    expect(context.lowAppetite).toBe(true);
    expect(context.nauseaActive).toBe(true);
    expect(context.messages.length).toBeGreaterThan(0);
  });

  test("adds caution for reflux-prone cuisines on reflux days", () => {
    const profile = defaultUserProfile;
    const log = createDefaultDailyLog("2026-03-08");
    log.symptoms.reflux = "moderate";

    const cuisines = getCuisinePlaybook(profile, log);
    const pizza = cuisines.find((entry) => entry.id === "pizza");

    expect(pizza?.caution[0]).toContain("Spicy and tomato-heavy");
  });

  test("provides social scripts for pressure moments", () => {
    expect(getSocialScripts().length).toBeGreaterThan(0);
  });
});
