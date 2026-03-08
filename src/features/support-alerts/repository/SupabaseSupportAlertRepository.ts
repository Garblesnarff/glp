import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupportAlert } from "../../../domain/types";
import type { SupportAlertRepository } from "./SupportAlertRepository";

export class SupabaseSupportAlertRepository implements SupportAlertRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async loadAlerts(): Promise<SupportAlert[]> {
    const accountId = await this.getAccountId();
    if (!accountId) {
      return [];
    }

    const { data, error } = await this.client
      .from("support_alerts")
      .select("id, account_id, created_by_user_id, kind, status, note, created_at, resolved_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      accountId: row.account_id,
      createdByUserId: row.created_by_user_id,
      kind: row.kind,
      status: row.status,
      note: row.note ?? undefined,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at ?? undefined,
    }));
  }

  async createRoughDayAlert(note?: string): Promise<SupportAlert | null> {
    const accountId = await this.getAccountId();
    if (!accountId) {
      return null;
    }

    const { data, error } = await this.client
      .from("support_alerts")
      .insert({
        account_id: accountId,
        created_by_user_id: this.userId,
        kind: "rough_day",
        status: "active",
        note: note ?? null,
      })
      .select("id, account_id, created_by_user_id, kind, status, note, created_at, resolved_at")
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      accountId: data.account_id,
      createdByUserId: data.created_by_user_id,
      kind: data.kind,
      status: data.status,
      note: data.note ?? undefined,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at ?? undefined,
    };
  }

  async resolveAlert(alertId: string): Promise<void> {
    const { error } = await this.client
      .from("support_alerts")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", alertId);

    if (error) {
      throw error;
    }
  }

  private async getAccountId() {
    const { data, error } = await this.client
      .from("account_members")
      .select("account_id")
      .eq("user_id", this.userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.account_id ?? null;
  }
}
