import { describe, expect, test } from "bun:test";
import type { NotificationDelivery, NotificationJob } from "../../domain/types";
import { deliverDueNotificationJobs } from "./delivery";

const scheduledJob: NotificationJob = {
  id: "notification:shot-prep",
  sourceReminderId: "shot-prep",
  title: "Shot day is tomorrow",
  body: "Prep gentler foods tonight.",
  requestedChannel: "in_app",
  sendAt: "2026-03-08T14:00:00.000Z",
  channel: "in_app",
  status: "scheduled",
};

describe("deliverDueNotificationJobs", () => {
  test("marks due scheduled jobs as sent and creates deliveries", () => {
    const result = deliverDueNotificationJobs([scheduledJob], [], new Date("2026-03-08T16:00:00.000Z"));

    expect(result.jobs[0]?.status).toBe("sent");
    expect(result.delivered).toHaveLength(1);
    expect(result.deliveries[0]?.sourceJobId).toBe(scheduledJob.id);
  });

  test("does not duplicate deliveries for jobs already delivered", () => {
    const existingDelivery: NotificationDelivery = {
      id: "delivery:notification:shot-prep",
      sourceJobId: scheduledJob.id,
      sourceReminderId: scheduledJob.sourceReminderId,
      title: scheduledJob.title,
      body: scheduledJob.body,
      requestedChannel: scheduledJob.requestedChannel,
      deliveredAt: "2026-03-08T16:00:00.000Z",
      channel: "in_app",
      status: "new",
    };

    const result = deliverDueNotificationJobs([scheduledJob], [existingDelivery], new Date("2026-03-08T18:00:00.000Z"));

    expect(result.delivered).toHaveLength(0);
    expect(result.deliveries).toHaveLength(1);
    expect(result.jobs[0]?.status).toBe("sent");
  });

  test("leaves future jobs untouched", () => {
    const futureJob = {
      ...scheduledJob,
      sendAt: "2026-03-09T14:00:00.000Z",
    };

    const result = deliverDueNotificationJobs([futureJob], [], new Date("2026-03-08T18:00:00.000Z"));

    expect(result.delivered).toHaveLength(0);
    expect(result.jobs[0]?.status).toBe("scheduled");
  });
});
