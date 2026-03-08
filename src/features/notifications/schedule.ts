import type { DailyLog, MedicationLog, NotificationJob, ReminderDeliveryWindow, UserProfile } from "../../domain/types";
import { getCompanionReminders } from "../dashboard/reminders";
import { getNotificationChannelPlan } from "./channels";

const windowHours: Record<ReminderDeliveryWindow, number> = {
  morning: 9,
  afternoon: 13,
  evening: 18,
};

export function buildScheduledNotificationJobs(
  profile: UserProfile,
  log: DailyLog,
  recentLogs: DailyLog[],
  medicationLogs: MedicationLog[],
  referenceDate = new Date(),
) {
  const reminders = getCompanionReminders(profile, log, recentLogs, medicationLogs);
  const channelPlan = getNotificationChannelPlan(profile);

  return reminders.map((reminder) => ({
    id: `notification:${reminder.id}`,
    sourceReminderId: reminder.id,
    title: reminder.title,
    body: reminder.body,
    linkTo: reminder.link?.to,
    requestedChannel: channelPlan.requestedChannel,
    sendAt: getScheduledTime(profile, referenceDate),
    channel: channelPlan.deliveryChannel,
    status: "scheduled",
    fallbackReason: channelPlan.fallbackReason,
  })) satisfies NotificationJob[];
}

function getScheduledTime(profile: UserProfile, referenceDate: Date) {
  const scheduled = new Date(referenceDate);
  scheduled.setHours(windowHours[profile.reminderPreferences.deliveryWindow], 0, 0, 0);

  if (scheduled <= referenceDate) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  const quietEndHour = Number(profile.reminderPreferences.quietHoursEnd.split(":")[0] ?? "7");
  const quietEndMinute = Number(profile.reminderPreferences.quietHoursEnd.split(":")[1] ?? "0");

  if (scheduled.getHours() < quietEndHour || (scheduled.getHours() === quietEndHour && scheduled.getMinutes() < quietEndMinute)) {
    scheduled.setHours(quietEndHour, quietEndMinute, 0, 0);
  }

  return scheduled.toISOString();
}
