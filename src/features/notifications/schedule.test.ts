import { describe, expect, test } from "bun:test";
import type { UserProfile } from "../../domain/types";
import { createDefaultDailyLog, defaultUserProfile } from "../../domain/defaults";
import { buildScheduledNotificationJobs } from "./schedule";

describe("notification scheduling", () => {
  test("builds scheduled jobs from current reminders and delivery window", () => {
    const profile: UserProfile = {
      ...defaultUserProfile,
      shotDay: "Sunday",
      reminderPreferences: {
        ...defaultUserProfile.reminderPreferences,
        deliveryWindow: "afternoon",
      },
    };
    const log = createDefaultDailyLog("2026-03-08");
    log.hydrationOz = 12;

    const jobs = buildScheduledNotificationJobs(profile, log, [], [], new Date("2026-03-08T08:00:00"));

    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0]?.sendAt.includes("T13:00:00")).toBe(true);
    expect(jobs[0]?.requestedChannel).toBe("in_app");
  });

  test("preserves the requested external channel while planning in-app fallback", () => {
    const profile: UserProfile = {
      ...defaultUserProfile,
      reminderPreferences: {
        ...defaultUserProfile.reminderPreferences,
        preferredChannel: "email",
        emailEnabled: true,
        emailAddress: "user@example.com",
      },
    };
    const log = createDefaultDailyLog("2026-03-08");
    log.hydrationOz = 12;

    const jobs = buildScheduledNotificationJobs(profile, log, [], [], new Date("2026-03-08T08:00:00"));

    expect(jobs[0]?.requestedChannel).toBe("email");
    expect(jobs[0]?.channel).toBe("in_app");
    expect(jobs[0]?.fallbackReason).toContain("Email transport");
  });
});
