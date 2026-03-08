import { readStoredJson, writeStoredJson } from "../../../lib/storage";
import type { NotificationDelivery, NotificationJob } from "../../../domain/types";
import { deliverDueNotificationJobs } from "../delivery";
import type { NotificationRepository } from "./NotificationRepository";

const STORAGE_KEY = "glp1-notification-jobs";
const DELIVERY_STORAGE_KEY = "glp1-notification-deliveries";

export class LocalNotificationRepository implements NotificationRepository {
  async loadNotificationJobs(): Promise<NotificationJob[]> {
    return (await readStoredJson<NotificationJob[]>(STORAGE_KEY)) ?? [];
  }

  async saveNotificationJobs(jobs: NotificationJob[]): Promise<void> {
    await writeStoredJson(STORAGE_KEY, jobs);
  }

  async loadNotificationDeliveries(): Promise<NotificationDelivery[]> {
    return (await readStoredJson<NotificationDelivery[]>(DELIVERY_STORAGE_KEY)) ?? [];
  }

  async deliverDueJobs(referenceDate = new Date().toISOString()): Promise<NotificationDelivery[]> {
    const [jobs, deliveries] = await Promise.all([this.loadNotificationJobs(), this.loadNotificationDeliveries()]);
    const result = deliverDueNotificationJobs(jobs, deliveries, new Date(referenceDate));

    await Promise.all([writeStoredJson(STORAGE_KEY, result.jobs), writeStoredJson(DELIVERY_STORAGE_KEY, result.deliveries)]);
    return result.delivered;
  }

  async acknowledgeNotificationDelivery(deliveryId: string): Promise<void> {
    const deliveries = await this.loadNotificationDeliveries();
    const nextDeliveries = deliveries.map((delivery) =>
      delivery.id === deliveryId
        ? {
            ...delivery,
            status: "acknowledged" as const,
          }
        : delivery,
    );

    await writeStoredJson(DELIVERY_STORAGE_KEY, nextDeliveries);
  }
}
