import { useEffect, useState } from "react";
import { useAppAuth } from "../../../app/providers/app-auth-context";
import { createDefaultDailyLog } from "../../../domain/defaults";
import type { DailyLog } from "../../../domain/types";
import { useAppServices } from "../../../app/providers/AppServices";
import type { LinkedPrimaryContext } from "../repository/HouseholdRepository";
import { getLocalIsoDate } from "../../../lib/dates";

function todayIsoDate() {
  return getLocalIsoDate();
}

export function useLinkedPrimaryContext(enabled: boolean) {
  const auth = useAppAuth();
  const { householdRepository } = useAppServices();
  const [linkedContext, setLinkedContext] = useState<LinkedPrimaryContext | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    const email = auth.user?.email;

    if (!enabled || !email) {
      setLinkedContext(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    void (async () => {
      const next = await householdRepository.loadLinkedPrimaryContext({
        prepPartnerEmail: email,
        date: todayIsoDate(),
        days: 7,
      });
      setLinkedContext(next);
      setIsLoading(false);
    })();
  }, [auth.user?.email, enabled, householdRepository]);

  return {
    linkedContext,
    isLoading,
    linkedTodayLog: linkedContext?.todayLog ?? createDefaultDailyLog(todayIsoDate()),
    linkedRecentLogs: linkedContext?.recentLogs ?? ([] as DailyLog[]),
  };
}
