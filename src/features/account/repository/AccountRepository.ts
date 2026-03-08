import type { AccountMembership, UserProfile } from "../../../domain/types";

export interface AccountRepository {
  loadMembership(): Promise<AccountMembership | null>;
  ensurePrimaryAccount(profile: UserProfile): Promise<AccountMembership | null>;
  loadIncomingPartnerInvites(email: string): Promise<Array<{ id: string; invitedEmail: string; status: "pending" | "accepted" | "revoked"; createdAt: string }>>;
  acceptPartnerInvite(inviteId: string): Promise<AccountMembership | null>;
}
