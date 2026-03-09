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
    expect(jobs[0]?.sendAt.startsWith("2026-03-08T13:")).toBe(true);
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

  test("moves reminders out of quiet hours when the preferred window falls inside them", () => {
    const profile: UserProfile = {
      ...defaultUserProfile,
      reminderPreferences: {
        ...defaultUserProfile.reminderPreferences,
        deliveryWindow: "evening",
        quietHoursStart: "17:00",
        quietHoursEnd: "08:30",
      },
    };
    const log = createDefaultDailyLog("2026-03-08");
    log.hydrationOz = 12;

    const jobs = buildScheduledNotificationJobs(profile, log, [], [], new Date("2026-03-08T08:00:00"));
    const scheduled = new Date(jobs[0]?.sendAt ?? "");

    expect(jobs[0]?.sendAt.startsWith("2026-03-09")).toBe(true);
    expect(scheduled.getHours() * 60 + scheduled.getMinutes()).toBeGreaterThanOrEqual(8 * 60 + 30);
  });

  test("staggered jobs do not all land at the exact same second", () => {
    const profile: UserProfile = {
      ...defaultUserProfile,
      reminderPreferences: {
        ...defaultUserProfile.reminderPreferences,
        deliveryWindow: "morning",
      },
    };
    const log = createDefaultDailyLog("2026-03-08");
    log.hydrationOz = 12;

    const jobs = buildScheduledNotificationJobs(profile, log, [], [], new Date("2026-03-08T08:00:00"));
    const sendTimes = new Set(jobs.map((job) => job.sendAt));

    expect(sendTimes.size).toBeGreaterThan(1);
  });
});
