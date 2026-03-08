import type { NotificationChannel, NotificationJob } from "../../domain/types";

type WorkerEnvSource = Record<string, string | undefined>;

export type NotificationProviderAttempt = {
  jobId: string;
  requestedChannel: Exclude<NotificationChannel, "in_app">;
  provider: string;
  status: "ready" | "blocked";
  destination?: string;
  reason: string;
};

interface NotificationTransportProvider {
  channel: Exclude<NotificationChannel, "in_app">;
  providerName: string;
  plan(job: NotificationJob): NotificationProviderAttempt;
}

export function createNotificationTransportProviders(source: WorkerEnvSource): NotificationTransportProvider[] {
  return [new ResendEmailProvider(source), new TwilioSmsProvider(source)];
}

export function planExternalNotificationAttempts(
  jobs: NotificationJob[],
  providers: NotificationTransportProvider[],
): NotificationProviderAttempt[] {
  return jobs
    .filter((job): job is NotificationJob & { requestedChannel: "email" | "sms" } => job.requestedChannel !== "in_app")
    .map((job) => {
      const provider = providers.find((entry) => entry.channel === job.requestedChannel);

      if (!provider) {
        return {
          jobId: job.id,
          requestedChannel: job.requestedChannel,
          provider: "unconfigured",
          status: "blocked",
          reason: `No provider is registered for ${job.requestedChannel}.`,
        } satisfies NotificationProviderAttempt;
      }

      return provider.plan(job);
    });
}

class ResendEmailProvider implements NotificationTransportProvider {
  readonly channel = "email" as const;
  readonly providerName = "resend";

  constructor(private readonly source: WorkerEnvSource) {}

  plan(job: NotificationJob): NotificationProviderAttempt {
    const destination = extractDestination(job.fallbackReason);

    if (!this.source.RESEND_API_KEY) {
      return {
        jobId: job.id,
        requestedChannel: "email",
        provider: this.providerName,
        status: "blocked",
        destination,
        reason: "RESEND_API_KEY is missing, so email delivery cannot run yet.",
      };
    }

    return {
      jobId: job.id,
      requestedChannel: "email",
      provider: this.providerName,
      status: "ready",
      destination,
      reason: "Email provider is configured. This job is eligible for future external send execution.",
    };
  }
}

class TwilioSmsProvider implements NotificationTransportProvider {
  readonly channel = "sms" as const;
  readonly providerName = "twilio";

  constructor(private readonly source: WorkerEnvSource) {}

  plan(job: NotificationJob): NotificationProviderAttempt {
    const destination = extractDestination(job.fallbackReason);

    if (!(this.source.TWILIO_ACCOUNT_SID && this.source.TWILIO_AUTH_TOKEN && this.source.TWILIO_FROM_NUMBER)) {
      return {
        jobId: job.id,
        requestedChannel: "sms",
        provider: this.providerName,
        status: "blocked",
        destination,
        reason: "Twilio env vars are incomplete, so SMS delivery cannot run yet.",
      };
    }

    return {
      jobId: job.id,
      requestedChannel: "sms",
      provider: this.providerName,
      status: "ready",
      destination,
      reason: "SMS provider is configured. This job is eligible for future external send execution.",
    };
  }
}

function extractDestination(fallbackReason?: string) {
  if (!fallbackReason) {
    return undefined;
  }

  const match = fallbackReason.match(/\(([^)]+)\)$/);
  return match?.[1];
}
