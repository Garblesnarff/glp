import type { AccountRepository } from "./AccountRepository";
import type { AccountMembership, UserProfile } from "../../../domain/types";

export class LocalAccountRepository implements AccountRepository {
  async loadMembership(): Promise<AccountMembership | null> {
    return null;
  }

  async ensurePrimaryAccount(_profile: UserProfile): Promise<AccountMembership | null> {
    void _profile;
    return null;
  }

  async loadIncomingPartnerInvites(): Promise<Array<{ id: string; invitedEmail: string; status: "pending" | "accepted" | "revoked"; createdAt: string }>> {
    return [];
  }

  async acceptPartnerInvite(): Promise<AccountMembership | null> {
    return null;
  }
}
