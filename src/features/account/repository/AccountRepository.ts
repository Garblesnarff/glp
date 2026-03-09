import type { AccountMembership, PartnerInviteStatus, UserProfile } from "../../../domain/types";

export interface AccountRepository {
  loadMembership(): Promise<AccountMembership | null>;
  ensurePrimaryAccount(profile: UserProfile): Promise<AccountMembership | null>;
  loadIncomingPartnerInvites(email: string): Promise<Array<{ id: string; invitedEmail: string; status: PartnerInviteStatus; createdAt: string }>>;
  acceptPartnerInvite(inviteId: string): Promise<AccountMembership | null>;
  declinePartnerInvite(inviteId: string): Promise<void>;
  leaveHousehold(): Promise<void>;
}
