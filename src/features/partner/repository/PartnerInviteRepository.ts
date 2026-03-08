import type { PartnerInvite } from "../../../domain/types";

export interface PartnerInviteRepository {
  loadPartnerInvites(): Promise<PartnerInvite[]>;
  createPartnerInvite(invitedEmail: string): Promise<PartnerInvite>;
  revokePartnerInvite(inviteId: string): Promise<void>;
}
