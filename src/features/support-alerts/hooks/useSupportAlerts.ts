import { useEffect, useMemo, useState } from "react";
import { useAppServices } from "../../../app/providers/AppServices";

export function useSupportAlerts() {
  const { supportAlertRepository } = useAppServices();
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof supportAlertRepository.loadAlerts>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const loaded = await supportAlertRepository.loadAlerts();
      setAlerts(loaded);
      setIsLoading(false);
    })();
  }, [supportAlertRepository]);

  async function createRoughDayAlert(note?: string) {
    const alert = await supportAlertRepository.createRoughDayAlert(note);
    if (alert) {
      setAlerts((current) => [alert, ...current]);
    }
    return alert;
  }

  async function resolveAlert(alertId: string) {
    await supportAlertRepository.resolveAlert(alertId);
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved", resolvedAt: new Date().toISOString() } : alert,
      ),
    );
  }

  const activeAlerts = useMemo(() => alerts.filter((alert) => alert.status === "active"), [alerts]);

  return {
    alerts,
    activeAlerts,
    isLoading,
    createRoughDayAlert,
    resolveAlert,
  };
}
