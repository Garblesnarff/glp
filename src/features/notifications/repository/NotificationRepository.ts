import type { NotificationDelivery, NotificationJob } from "../../../domain/types";

export interface NotificationRepository {
  loadNotificationJobs(): Promise<NotificationJob[]>;
  saveNotificationJobs(jobs: NotificationJob[]): Promise<void>;
  loadNotificationDeliveries(): Promise<NotificationDelivery[]>;
  deliverDueJobs(referenceDate?: string): Promise<NotificationDelivery[]>;
  acknowledgeNotificationDelivery(deliveryId: string): Promise<void>;
}
