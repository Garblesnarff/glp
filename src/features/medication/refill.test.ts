import { describe, expect, test } from "bun:test";
import { defaultUserProfile } from "../../domain/defaults";
import { getRefillSummary } from "./refill";

describe("medication refill summary", () => {
  test("flags refills due soon based on supply and lead days", () => {
    const profile = {
      ...defaultUserProfile,
      medicationSupplyDays: 28,
      refillLeadDays: 5,
      lastRefillDate: "2026-02-12",
    };

    const summary = getRefillSummary(profile, new Date("2026-03-08T12:00:00"));

    expect(summary.refillDueSoon).toBe(true);
    expect(summary.nextRefillDate).toBe("2026-03-12");
  });
});
