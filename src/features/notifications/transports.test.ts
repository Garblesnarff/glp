import { describe, expect, test } from "bun:test";
import { readAppEnv } from "../../config/env";
import { getAppNotificationTransportStatuses, getWorkerNotificationTransportStatuses } from "./transports";

describe("notification transports", () => {
  test("derives app-side availability from public env flags", () => {
    const env = readAppEnv({
      VITE_APP_ENV: "development",
      VITE_APP_URL: "http://localhost:5173",
      VITE_NOTIFICATION_EMAIL_AVAILABLE: "true",
      VITE_NOTIFICATION_SMS_AVAILABLE: "false",
    });

    const statuses = getAppNotificationTransportStatuses(env);

    expect(statuses.find((item) => item.channel === "email")?.available).toBe(true);
    expect(statuses.find((item) => item.channel === "sms")?.available).toBe(false);
  });

  test("derives worker-side availability from provider secrets", () => {
    const statuses = getWorkerNotificationTransportStatuses({
      RESEND_API_KEY: "re_test",
      TWILIO_ACCOUNT_SID: "sid",
      TWILIO_AUTH_TOKEN: "token",
      TWILIO_FROM_NUMBER: "+15551234567",
    });

    expect(statuses.find((item) => item.channel === "email")?.available).toBe(true);
    expect(statuses.find((item) => item.channel === "sms")?.available).toBe(true);
  });
});
