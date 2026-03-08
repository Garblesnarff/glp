import { useEffect, useState } from "react";
import type { DailyLog, MedicationLog, NotificationJob, UserProfile } from "../../../domain/types";
import { useAppServices } from "../../../app/providers/AppServices";
import { buildScheduledNotificationJobs } from "../schedule";

export function useNotificationQueue() {
  const { notificationRepository } = useAppServices();
  const [jobs, setJobs] = useState<NotificationJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const loaded = await notificationRepository.loadNotificationJobs();
      setJobs(loaded);
      setIsLoading(false);
    })();
  }, [notificationRepository]);

  async function refreshSchedule(profile: UserProfile, log: DailyLog, recentLogs: DailyLog[], medicationLogs: MedicationLog[]) {
    const nextJobs = buildScheduledNotificationJobs(profile, log, recentLogs, medicationLogs);
    setJobs(nextJobs);
    await notificationRepository.saveNotificationJobs(nextJobs);
    return nextJobs;
  }

  return {
    jobs,
    isLoading,
    refreshSchedule,
  };
}
