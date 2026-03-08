import { describe, expect, test } from "bun:test";
import { defaultUserProfile } from "../../domain/defaults";
import { getNotificationChannelPlan } from "./channels";

describe("notification channel plan", () => {
  test("keeps in-app delivery when in-app is preferred", () => {
    const plan = getNotificationChannelPlan({ reminderPreferences: defaultUserProfile.reminderPreferences });

    expect(plan.requestedChannel).toBe("in_app");
    expect(plan.deliveryChannel).toBe("in_app");
    expect(plan.fallbackReason).toBeUndefined();
  });

  test("describes email fallback while transport is not connected", () => {
    const plan = getNotificationChannelPlan({
      reminderPreferences: {
        ...defaultUserProfile.reminderPreferences,
        preferredChannel: "email",
        emailEnabled: true,
        emailAddress: "user@example.com",
      },
    });

    expect(plan.requestedChannel).toBe("email");
    expect(plan.deliveryChannel).toBe("in_app");
    expect(plan.fallbackReason).toContain("Email transport");
  });

  test("flags incomplete sms setup", () => {
    const plan = getNotificationChannelPlan({
      reminderPreferences: {
        ...defaultUserProfile.reminderPreferences,
        preferredChannel: "sms",
        smsEnabled: false,
        smsNumber: "",
      },
    });

    expect(plan.requestedChannel).toBe("sms");
    expect(plan.destinationLabel).toBe("Phone number missing");
  });
});
