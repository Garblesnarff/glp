import { describe, expect, test } from "bun:test";
import { createDefaultDailyLog, defaultReminderPreferences, defaultUserProfile } from "../../domain/defaults";
import type { MedicationLog } from "../../domain/types";
import { getCompanionReminders } from "./reminders";

describe("dashboard reminders", () => {
  test("builds reminders for dose increase, hydration, constipation, and rotation", () => {
    const profile = { ...defaultUserProfile, shotDay: "Saturday" };
    const today = createDefaultDailyLog("2026-03-07");
    today.hydrationOz = 16;
    today.appetiteLevel = "low";
    today.symptoms.constipation = "moderate";
    const previous = createDefaultDailyLog("2026-03-06");
    const twoDaysAgo = createDefaultDailyLog("2026-03-05");
    twoDaysAgo.bowelMovement = true;

    const medicationLogs: MedicationLog[] = [
      {
        id: "m1",
        medication: "Semaglutide",
        dose: "0.5 mg",
        shotDay: "Saturday",
        injectionSite: "Left abdomen",
        date: "2026-03-07",
        status: "completed",
        isDoseIncrease: true,
      },
    ];

    const reminders = getCompanionReminders(profile, today, [previous, twoDaysAgo], medicationLogs);

    expect(reminders.some((reminder) => reminder.id === "dose-increase-week")).toBe(true);
    expect(reminders.some((reminder) => reminder.id === "hydration-nudge")).toBe(true);
    expect(reminders.some((reminder) => reminder.id === "constipation-escalation")).toBe(true);
    expect(reminders.some((reminder) => reminder.id === "protein-support")).toBe(true);
    expect(reminders.some((reminder) => reminder.id === "strength-consistency")).toBe(true);
    expect(reminders.some((reminder) => reminder.id === "rotation-nudge")).toBe(true);
  });

  test("respects reminder preference toggles", () => {
    const profile = {
      ...defaultUserProfile,
      reminderPreferences: {
        ...defaultReminderPreferences,
        hydration: false,
        proteinSupport: false,
      },
    };
    const today = createDefaultDailyLog("2026-03-07");
    today.hydrationOz = 12;
    today.appetiteLevel = "low";

    const reminders = getCompanionReminders(profile, today, [], []);

    expect(reminders.some((reminder) => reminder.id === "hydration-nudge")).toBe(false);
    expect(reminders.some((reminder) => reminder.id === "protein-support")).toBe(false);
  });

  test("emits refill reminders when supply is running low", () => {
    const profile = {
      ...defaultUserProfile,
      lastRefillDate: "2026-02-12",
      medicationSupplyDays: 28,
      refillLeadDays: 5,
    };

    const reminders = getCompanionReminders(profile, createDefaultDailyLog("2026-03-07"), [], []);

    expect(reminders.some((reminder) => reminder.id === "refill-reminder")).toBe(true);
  });
});
