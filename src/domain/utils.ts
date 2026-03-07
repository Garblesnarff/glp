import type { UserProfile } from "./types";

export function calculateProteinTargetRange(weightLbs: number) {
  const weightKg = weightLbs / 2.20462;

  return {
    min: Math.round(weightKg * 1.2),
    max: Math.round(weightKg * 1.5),
  };
}

export function isProfileComplete(profile: UserProfile | null) {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.name &&
      profile.currentWeight > 0 &&
      profile.medicationName &&
      profile.medicationStartDate &&
      profile.shotDay,
  );
}

export function getDaysSince(startDate: string, referenceDate = new Date()) {
  const start = new Date(startDate);
  const diffMs = referenceDate.getTime() - start.getTime();

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getNextShotLabel(shotDay: string, referenceDate = new Date()) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const targetIndex = weekdays.indexOf(shotDay);

  if (targetIndex === -1) {
    return shotDay;
  }

  const currentIndex = referenceDate.getDay();
  const delta = (targetIndex - currentIndex + 7) % 7;

  if (delta === 0) {
    return "Today";
  }

  if (delta === 1) {
    return "Tomorrow";
  }

  return `${delta} days`;
}
