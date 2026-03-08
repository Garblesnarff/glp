import type { NotificationDelivery, NotificationJob } from "../../domain/types";

type DeliveryCycleResult = {
  jobs: NotificationJob[];
  deliveries: NotificationDelivery[];
  delivered: NotificationDelivery[];
};

export function deliverDueNotificationJobs(
  jobs: NotificationJob[],
  existingDeliveries: NotificationDelivery[],
  referenceDate = new Date(),
): DeliveryCycleResult {
  const dueJobs = jobs.filter((job) => job.status === "scheduled" && new Date(job.sendAt).getTime() <= referenceDate.getTime());

  if (dueJobs.length === 0) {
    return {
      jobs,
      deliveries: existingDeliveries,
      delivered: [],
    };
  }

  const deliveredByJobId = new Set(existingDeliveries.map((delivery) => delivery.sourceJobId));
  const deliveredAt = referenceDate.toISOString();
  const delivered = dueJobs
    .filter((job) => !deliveredByJobId.has(job.id))
    .map((job) => buildNotificationDelivery(job, deliveredAt));

  const nextJobs = jobs.map((job) => {
    if (!dueJobs.some((dueJob) => dueJob.id === job.id)) {
      return job;
    }

    return {
      ...job,
      status: "sent" as const,
    };
  });

  const nextDeliveries = [...delivered, ...existingDeliveries].sort(
    (left, right) => new Date(right.deliveredAt).getTime() - new Date(left.deliveredAt).getTime(),
  );

  return {
    jobs: nextJobs,
    deliveries: nextDeliveries,
    delivered,
  };
}

export function buildNotificationDelivery(job: NotificationJob, deliveredAt: string): NotificationDelivery {
  return {
    id: `delivery:${job.id}`,
    sourceJobId: job.id,
    sourceReminderId: job.sourceReminderId,
    title: job.title,
    body: job.body,
    linkTo: job.linkTo,
    requestedChannel: job.requestedChannel,
    deliveredAt,
    channel: job.channel,
    status: "new",
    fallbackReason: job.fallbackReason,
  };
}
