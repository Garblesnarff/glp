import type { NotificationChannel, UserProfile } from "../../domain/types";

export type NotificationChannelPlan = {
  requestedChannel: NotificationChannel;
  deliveryChannel: "in_app";
  fallbackReason?: string;
  destinationLabel: string;
};

export function getNotificationChannelPlan(profile: Pick<UserProfile, "reminderPreferences">): NotificationChannelPlan {
  const { reminderPreferences } = profile;
  const requestedChannel = reminderPreferences.preferredChannel;

  if (requestedChannel === "in_app") {
    return {
      requestedChannel,
      deliveryChannel: "in_app",
      destinationLabel: "In-app inbox",
    };
  }

  if (requestedChannel === "email" && reminderPreferences.emailEnabled && reminderPreferences.emailAddress) {
    return {
      requestedChannel,
      deliveryChannel: "in_app",
      fallbackReason: "Email transport is not connected yet, so reminders still land in the in-app inbox for now.",
      destinationLabel: reminderPreferences.emailAddress,
    };
  }

  if (requestedChannel === "sms" && reminderPreferences.smsEnabled && reminderPreferences.smsNumber) {
    return {
      requestedChannel,
      deliveryChannel: "in_app",
      fallbackReason: "SMS transport is not connected yet, so reminders still land in the in-app inbox for now.",
      destinationLabel: reminderPreferences.smsNumber,
    };
  }

  return {
    requestedChannel,
    deliveryChannel: "in_app",
    fallbackReason: reminderPreferences.fallbackToInApp
      ? "The preferred channel is incomplete, so reminders fall back to the in-app inbox."
      : "The preferred channel is incomplete. Finish the channel setup before external delivery can be enabled.",
    destinationLabel: requestedChannel === "email" ? "Email address missing" : "Phone number missing",
  };
}
