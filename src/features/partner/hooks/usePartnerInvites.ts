import { useEffect, useState } from "react";
import type { PartnerInvite } from "../../../domain/types";
import { useAppServices } from "../../../app/providers/AppServices";

export function usePartnerInvites() {
  const { partnerInviteRepository } = useAppServices();
  const [invites, setInvites] = useState<PartnerInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const loadedInvites = await partnerInviteRepository.loadPartnerInvites();
      setInvites(loadedInvites);
      setIsLoading(false);
    })();
  }, [partnerInviteRepository]);

  async function createInvite(invitedEmail: string) {
    const invite = await partnerInviteRepository.createPartnerInvite(invitedEmail);
    setInvites((current) => [invite, ...current]);
    return invite;
  }

  async function revokeInvite(inviteId: string) {
    await partnerInviteRepository.revokePartnerInvite(inviteId);
    setInvites((current) => current.map((invite) => (invite.id === inviteId ? { ...invite, status: "revoked" } : invite)));
  }

  return {
    invites,
    isLoading,
    createInvite,
    revokeInvite,
  };
}
