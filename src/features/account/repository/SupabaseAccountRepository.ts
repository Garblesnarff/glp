import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountMembership, UserProfile } from "../../../domain/types";
import type { AccountRepository } from "./AccountRepository";

export class SupabaseAccountRepository implements AccountRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
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

  async ensurePrimaryAccount(profile: UserProfile): Promise<AccountMembership | null> {
    const existing = await this.loadMembership();
    if (existing || profile.role !== "primary") {
      return existing;
    }

    const { data: accountData, error: accountError } = await this.client.from("accounts").insert({}).select("id").single();
    if (accountError) {
      throw accountError;
    }

    const accountId = accountData.id as string;

    const { error: membershipError } = await this.client.from("account_members").insert({
      account_id: accountId,
      user_id: this.userId,
      role: "primary",
    });

    if (membershipError) {
      throw membershipError;
    }

    await this.upsertOwnProfileLink(accountId, "primary");

    return {
      accountId,
      role: "primary",
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

  async acceptPartnerInvite(inviteId: string): Promise<AccountMembership | null> {
    const { data: inviteRow, error: inviteError } = await this.client
      .from("partner_invites")
      .select("id, account_id, invited_email, status")
      .eq("id", inviteId)
      .eq("status", "pending")
      .maybeSingle();

    if (inviteError) {
      throw inviteError;
    }

    if (!inviteRow) {
      return this.loadMembership();
    }

    const { error: membershipError } = await this.client.from("account_members").upsert(
      {
        account_id: inviteRow.account_id,
        user_id: this.userId,
        role: "prep_partner",
      },
      { onConflict: "account_id,user_id" },
    );

    if (membershipError) {
      throw membershipError;
    }

    await this.upsertOwnProfileLink(inviteRow.account_id, "prep_partner");

    const { error: inviteUpdateError } = await this.client.from("partner_invites").update({ status: "accepted" }).eq("id", inviteId);

    if (inviteUpdateError) {
      throw inviteUpdateError;
    }

    return {
      accountId: inviteRow.account_id,
      role: "prep_partner",
    };
  }

  private async upsertOwnProfileLink(accountId: string, role: "primary" | "prep_partner") {
    const { data: existingProfile, error: existingError } = await this.client
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", this.userId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingProfile) {
      const { error } = await this.client.from("user_profiles").update({ account_id: accountId, role }).eq("user_id", this.userId);
      if (error) {
        throw error;
      }
      return;
    }

    const { error } = await this.client.from("user_profiles").insert({
      user_id: this.userId,
      account_id: accountId,
      role,
    });

    if (error) {
      throw error;
    }
  }
}
