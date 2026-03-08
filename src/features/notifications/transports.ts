import type { AppEnv } from "../../config/env";

export type NotificationTransportStatus = {
  channel: "in_app" | "email" | "sms";
  provider: string;
  available: boolean;
  summary: string;
};

type WorkerEnvSource = Record<string, string | undefined>;

export function getAppNotificationTransportStatuses(env: AppEnv): NotificationTransportStatus[] {
  return [
    {
      channel: "in_app",
      provider: "built-in",
      available: true,
      summary: "The in-app inbox is always available.",
    },
    {
      channel: "email",
      provider: "resend",
      available: env.notifications.emailAvailable,
      summary: env.notifications.emailAvailable
        ? "Email transport is marked available for this deployment."
        : "Email transport is not marked available in app config yet.",
    },
    {
      channel: "sms",
      provider: "twilio",
      available: env.notifications.smsAvailable,
      summary: env.notifications.smsAvailable
        ? "SMS transport is marked available for this deployment."
        : "SMS transport is not marked available in app config yet.",
    },
  ];
}

export function getWorkerNotificationTransportStatuses(source: WorkerEnvSource): NotificationTransportStatus[] {
  return [
    {
      channel: "in_app",
      provider: "built-in",
      available: true,
      summary: "The Bun worker can always materialize in-app deliveries.",
    },
    {
      channel: "email",
      provider: "resend",
      available: Boolean(source.RESEND_API_KEY),
      summary: source.RESEND_API_KEY ? "Resend credentials detected." : "Missing RESEND_API_KEY.",
    },
    {
      channel: "sms",
      provider: "twilio",
      available: Boolean(source.TWILIO_ACCOUNT_SID && source.TWILIO_AUTH_TOKEN && source.TWILIO_FROM_NUMBER),
      summary:
        source.TWILIO_ACCOUNT_SID && source.TWILIO_AUTH_TOKEN && source.TWILIO_FROM_NUMBER
          ? "Twilio credentials detected."
          : "Missing one or more Twilio env vars.",
    },
  ];
}
