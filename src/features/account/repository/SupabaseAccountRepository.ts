import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountMembership, UserProfile } from "../../../domain/types";
import type { AccountRepository } from "./AccountRepository";

export class SupabaseAccountRepository implements AccountRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
    private readonly userEmail: string,
  ) {}

  async loadMembership(): Promise<AccountMembership | null> {
    const { data, error } = await this.client
      .from("account_members")
      .select("account_id, role")
      .eq("user_id", this.userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      accountId: data.account_id,
      role: data.role,
    };
  }

  async ensurePrimaryAccount(
    profile: UserProfile,
  ): Promise<AccountMembership | null> {
    if (profile.role !== "primary") {
      return this.loadMembership();
    }

    const { data, error } = await this.client.rpc(
      "ensure_primary_account_for_current_user",
      { p_user_id: this.userId },
    );

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return null;
    }

    return {
      accountId: row.account_id,
      role: row.role,
    };
  }

  async loadIncomingPartnerInvites(email: string) {
    const { data, error } = await this.client
      .from("partner_invites")
      .select("id, account_id, invited_email, status, created_at")
      .eq("invited_email", email)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      invitedEmail: row.invited_email,
      status: row.status,
      createdAt: row.created_at,
      accountId: row.account_id,
    }));
  }

  async acceptPartnerInvite(
    inviteId: string,
  ): Promise<AccountMembership | null> {
    const { data, error } = await this.client.rpc(
      "accept_partner_invite_for_current_user",
      { invite_id: inviteId, p_user_id: this.userId, p_email: this.userEmail },
    );

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return null;
    }

    return {
      accountId: row.account_id,
      role: row.role,
    };
  }

  async declinePartnerInvite(inviteId: string): Promise<void> {
    const { error } = await this.client.rpc(
      "decline_partner_invite_for_current_user",
      { invite_id: inviteId, p_email: this.userEmail },
    );

    if (error) {
      throw error;
    }
  }

  async leaveHousehold(): Promise<void> {
    const { error } = await this.client.rpc(
      "leave_household_for_current_user",
      {
        p_user_id: this.userId,
        p_email: this.userEmail,
      },
    );

    if (error) {
      throw error;
    }
  }
}
