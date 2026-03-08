import { useEffect, useState } from "react";
import { useAppAuth } from "../../../app/providers/app-auth-context";
import { useAppServices } from "../../../app/providers/AppServices";
import type { AccountMembership } from "../../../domain/types";

type IncomingInvite = {
  id: string;
  invitedEmail: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: string;
  accountId?: string;
};

export function useAccountLinking() {
  const auth = useAppAuth();
  const { accountRepository } = useAppServices();
  const [membership, setMembership] = useState<AccountMembership | null>(null);
  const [incomingInvites, setIncomingInvites] = useState<IncomingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const email = auth.user?.email;

    if (!email && auth.mode !== "workos") {
      setIsLoading(false);
      return;
    }

    void (async () => {
      const [loadedMembership, loadedInvites] = await Promise.all([
        accountRepository.loadMembership(),
        email ? accountRepository.loadIncomingPartnerInvites(email) : Promise.resolve([]),
      ]);

      setMembership(loadedMembership);
      setIncomingInvites(loadedInvites);
      setIsLoading(false);
    })();
  }, [accountRepository, auth.mode, auth.user?.email]);

  async function acceptInvite(inviteId: string) {
    const nextMembership = await accountRepository.acceptPartnerInvite(inviteId);
    setMembership(nextMembership);
    setIncomingInvites((current) => current.filter((invite) => invite.id !== inviteId));
  }

  async function declineInvite(inviteId: string) {
    await accountRepository.declinePartnerInvite(inviteId);
    setIncomingInvites((current) => current.filter((invite) => invite.id !== inviteId));
  }

  async function leaveHousehold() {
    await accountRepository.leaveHousehold();
    setMembership(null);
  }

  async function ensurePrimaryAccount(profile: { role: "primary" | "prep_partner"; [key: string]: unknown }) {
    if (profile.role !== "primary") {
      return null;
    }

    const nextMembership = await accountRepository.ensurePrimaryAccount(profile as never);
    setMembership(nextMembership);
    return nextMembership;
  }

  return {
    membership,
    incomingInvites,
    isLoading,
    acceptInvite,
    declineInvite,
    leaveHousehold,
    ensurePrimaryAccount,
  };
}
