import { describe, expect, test } from "bun:test";
import type { NotificationJob } from "../../domain/types";
import { createNotificationTransportProviders, planExternalNotificationAttempts } from "./providers";

const baseJob: NotificationJob = {
  id: "notification:email-1",
  sourceReminderId: "hydration-nudge",
  title: "Keep hydration moving",
  body: "24 oz remain toward today's hydration goal.",
  requestedChannel: "email",
  sendAt: "2026-03-08T13:00:00.000Z",
  channel: "in_app",
  status: "scheduled",
};

describe("notification providers", () => {
  test("marks email jobs ready when provider env is present", () => {
    const attempts = planExternalNotificationAttempts([baseJob], createNotificationTransportProviders({ RESEND_API_KEY: "re_test" }));

    expect(attempts[0]?.provider).toBe("resend");
    expect(attempts[0]?.status).toBe("ready");
  });

  test("blocks sms jobs when twilio env is incomplete", () => {
    const smsJob: NotificationJob = {
      ...baseJob,
      id: "notification:sms-1",
      requestedChannel: "sms",
    };

    const attempts = planExternalNotificationAttempts([smsJob], createNotificationTransportProviders({}));

    expect(attempts[0]?.provider).toBe("twilio");
    expect(attempts[0]?.status).toBe("blocked");
  });
});
