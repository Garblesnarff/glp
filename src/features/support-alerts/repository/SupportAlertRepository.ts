import type { SupportAlert } from "../../../domain/types";

export interface SupportAlertRepository {
  loadAlerts(): Promise<SupportAlert[]>;
  createRoughDayAlert(note?: string): Promise<SupportAlert | null>;
  resolveAlert(alertId: string): Promise<void>;
}
