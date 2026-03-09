import type { AccountRepository } from "./AccountRepository";
import type { AccountMembership, PartnerInviteStatus, UserProfile } from "../../../domain/types";

export class LocalAccountRepository implements AccountRepository {
  async loadMembership(): Promise<AccountMembership | null> {
    return null;
  }

  async ensurePrimaryAccount(_profile: UserProfile): Promise<AccountMembership | null> {
    void _profile;
    return null;
  }

  async loadIncomingPartnerInvites(): Promise<Array<{ id: string; invitedEmail: string; status: PartnerInviteStatus; createdAt: string }>> {
    return [];
  }

  async acceptPartnerInvite(): Promise<AccountMembership | null> {
    return null;
  }

  async declinePartnerInvite(): Promise<void> {
    return;
  }

  async leaveHousehold(): Promise<void> {
    return;
  }
}
