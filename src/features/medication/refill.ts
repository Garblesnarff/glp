import type { UserProfile } from "../../domain/types";
import { getLocalIsoDate } from "../../lib/dates";

export function getRefillSummary(profile: UserProfile, referenceDate = new Date()) {
  if (!profile.lastRefillDate) {
    return {
      nextRefillDate: null,
      daysUntilRefill: null,
      refillDueSoon: false,
      refillOverdue: false,
      message: "No refill date is logged yet. Add the last refill so the app can warn you before you run low.",
    };
  }

  const refillDate = new Date(`${profile.lastRefillDate}T12:00:00`);
  const nextRefillDate = new Date(refillDate);
  nextRefillDate.setDate(nextRefillDate.getDate() + profile.medicationSupplyDays);

  const diffMs = nextRefillDate.getTime() - referenceDate.getTime();
  const daysUntilRefill = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const refillDueSoon = daysUntilRefill <= profile.refillLeadDays;
  const refillOverdue = daysUntilRefill < 0;

  let message = `${Math.max(daysUntilRefill, 0)} day${Math.abs(daysUntilRefill) === 1 ? "" : "s"} until the next refill target.`;
  if (refillOverdue) {
    message = `Refill appears overdue by ${Math.abs(daysUntilRefill)} day${Math.abs(daysUntilRefill) === 1 ? "" : "s"}.`;
  } else if (refillDueSoon) {
    message = `Refill is coming up within ${profile.refillLeadDays} day${profile.refillLeadDays === 1 ? "" : "s"}.`;
  }

  return {
    nextRefillDate: getLocalIsoDate(nextRefillDate),
    daysUntilRefill,
    refillDueSoon,
    refillOverdue,
    message,
  };
}
