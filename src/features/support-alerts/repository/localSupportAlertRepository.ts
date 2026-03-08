import { readStoredJson, writeStoredJson } from "../../../lib/storage";
import type { SupportAlert } from "../../../domain/types";
import type { SupportAlertRepository } from "./SupportAlertRepository";

const STORAGE_KEY = "glp1-support-alerts";

export class LocalSupportAlertRepository implements SupportAlertRepository {
  async loadAlerts(): Promise<SupportAlert[]> {
    return (await readStoredJson<SupportAlert[]>(STORAGE_KEY)) ?? [];
  }

  async createRoughDayAlert(note?: string): Promise<SupportAlert | null> {
    const alerts = await this.loadAlerts();
    const next: SupportAlert = {
      id: crypto.randomUUID(),
      kind: "rough_day",
      status: "active",
      note,
      createdAt: new Date().toISOString(),
    };

    await writeStoredJson(STORAGE_KEY, [next, ...alerts]);
    return next;
  }

  async resolveAlert(alertId: string): Promise<void> {
    const alerts = await this.loadAlerts();
    await writeStoredJson(
      STORAGE_KEY,
      alerts.map((alert) =>
        alert.id === alertId ? { ...alert, status: "resolved", resolvedAt: new Date().toISOString() } : alert,
      ),
    );
  }
}
