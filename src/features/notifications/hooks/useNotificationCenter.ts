import { useEffect, useState } from "react";
import type { NotificationDelivery } from "../../../domain/types";
import { useAppServices } from "../../../app/providers/AppServices";

export function useNotificationCenter() {
  const { notificationRepository } = useAppServices();
  const [deliveries, setDeliveries] = useState<NotificationDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const loaded = await notificationRepository.loadNotificationDeliveries();
      setDeliveries(loaded);
      setIsLoading(false);
    })();
  }, [notificationRepository]);

  async function runDeliveryCycle(referenceDate?: string) {
    const delivered = await notificationRepository.deliverDueJobs(referenceDate);
    const latest = await notificationRepository.loadNotificationDeliveries();
    setDeliveries(latest);
    return delivered;
  }

  async function acknowledgeDelivery(deliveryId: string) {
    await notificationRepository.acknowledgeNotificationDelivery(deliveryId);
    const latest = await notificationRepository.loadNotificationDeliveries();
    setDeliveries(latest);
  }

  return {
    deliveries,
    isLoading,
    runDeliveryCycle,
    acknowledgeDelivery,
  };
}
