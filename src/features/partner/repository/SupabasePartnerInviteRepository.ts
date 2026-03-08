import type { SupabaseClient } from "@supabase/supabase-js";
import type { PartnerInvite } from "../../../domain/types";
import type { PartnerInviteRepository } from "./PartnerInviteRepository";

export class SupabasePartnerInviteRepository implements PartnerInviteRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async loadPartnerInvites(): Promise<PartnerInvite[]> {
    const accountId = await this.getAccountId();
    if (!accountId) {
      return [];
    }

    const { data, error } = await this.client
      .from("partner_invites")
      .select("id, invited_email, role, status, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      invitedEmail: row.invited_email,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
    }));
  }

  async createPartnerInvite(invitedEmail: string): Promise<PartnerInvite> {
    const accountId = await this.getAccountId();
    if (!accountId) {
      throw new Error("No account found for current user");
    }

    const { data, error } = await this.client
      .from("partner_invites")
      .insert({
        account_id: accountId,
        invited_email: invitedEmail,
        role: "prep_partner",
        status: "pending",
      })
      .select("id, invited_email, role, status, created_at")
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      invitedEmail: data.invited_email,
      role: data.role,
      status: data.status,
      createdAt: data.created_at,
    };
  }

  async revokePartnerInvite(inviteId: string): Promise<void> {
    const { error } = await this.client.from("partner_invites").update({ status: "revoked" }).eq("id", inviteId);

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
