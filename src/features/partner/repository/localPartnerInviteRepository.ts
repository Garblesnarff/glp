import { readStoredJson, writeStoredJson } from "../../../lib/storage";
import type { PartnerInvite } from "../../../domain/types";
import type { PartnerInviteRepository } from "./PartnerInviteRepository";

const STORAGE_KEY = "glp1-partner-invites";

export class LocalPartnerInviteRepository implements PartnerInviteRepository {
  async loadPartnerInvites(): Promise<PartnerInvite[]> {
    return (await readStoredJson<PartnerInvite[]>(STORAGE_KEY)) ?? [];
  }

  async createPartnerInvite(invitedEmail: string): Promise<PartnerInvite> {
    const invites = await this.loadPartnerInvites();
    const nextInvite: PartnerInvite = {
      id: crypto.randomUUID(),
      invitedEmail,
      role: "prep_partner",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await writeStoredJson(STORAGE_KEY, [nextInvite, ...invites]);

    return nextInvite;
  }

  async revokePartnerInvite(inviteId: string): Promise<void> {
    const invites = await this.loadPartnerInvites();
    await writeStoredJson(
      STORAGE_KEY,
      invites.map((invite) => (invite.id === inviteId ? { ...invite, status: "revoked" } : invite)),
    );
  }
}
