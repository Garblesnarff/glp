import type { DailyLog, MedicationLog, UserProfile } from "../../domain/types";
import { getDaysSinceLastBowelMovement, isShotDaySupportActive } from "./support";

export type CompanionReminder = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "warn";
  link?: {
    label: string;
    to: string;
  };
};

const injectionSites = ["Left abdomen", "Right abdomen", "Left thigh", "Right thigh", "Left arm", "Right arm"];

export function getCompanionReminders(profile: UserProfile, log: DailyLog, recentLogs: DailyLog[], medicationLogs: MedicationLog[]) {
  if (!profile.reminderPreferences.enabled) {
    return [];
  }

  const reminders: CompanionReminder[] = [];
  const latestMedicationLog = medicationLogs[0] ?? null;
  const shotTomorrow = getDaysUntilShot(profile.shotDay) === 1;
  const daysSinceBowelMovement = getDaysSinceLastBowelMovement(log, recentLogs);
  const hydrationRemaining = Math.max(0, profile.hydrationGoal - log.hydrationOz);
  const latestDoseIncrease = medicationLogs.find((entry) => entry.isDoseIncrease);
  const doseIncreaseRecent = latestDoseIncrease ? daysSinceDate(latestDoseIncrease.date) <= 7 : false;
  const proteinToday = log.mealsConsumed.reduce((sum, meal) => sum + meal.actualProtein, 0);
  const recentStrengthDays = recentLogs.filter((entry) => entry.movement.includes("Strength session")).length;

  if (shotTomorrow && profile.reminderPreferences.shotPrep) {
    reminders.push({
      id: "shot-prep",
      title: "Shot day is tomorrow",
      body: "Prep gentler foods tonight so tomorrow starts with easy options instead of decisions.",
      tone: "info",
      link: {
        label: "Open planner",
        to: "/planner",
      },
    });
  }

  if (doseIncreaseRecent && profile.reminderPreferences.doseIncrease) {
    reminders.push({
      id: "dose-increase-week",
      title: "Dose increase week",
      body: `Your most recent dose increase was on ${latestDoseIncrease?.date}. Expect symptom load to be less predictable this week and keep gentler foods ready.`,
      tone: "warn",
      link: {
        label: "Open medication timeline",
        to: "/medication",
      },
    });
  }

  if ((hydrationRemaining >= 24 || isShotDaySupportActive(profile)) && profile.reminderPreferences.hydration) {
    reminders.push({
      id: "hydration-nudge",
      title: "Keep hydration moving",
      body: hydrationRemaining > 0 ? `${hydrationRemaining} oz remain toward today's hydration goal.` : "You hit your hydration goal. Keep sipping steadily if symptoms are active.",
      tone: hydrationRemaining >= 32 ? "warn" : "info",
      link: {
        label: "Open daily log",
        to: "/today",
      },
    });
  }

  if (daysSinceBowelMovement !== null && daysSinceBowelMovement >= 2 && profile.reminderPreferences.constipation) {
    reminders.push({
      id: "constipation-escalation",
      title: "Constipation support is due",
      body: `It has been ${daysSinceBowelMovement} day${daysSinceBowelMovement === 1 ? "" : "s"} since the last logged bowel movement. Push water, movement, and gentler fiber today.`,
      tone: daysSinceBowelMovement >= 3 ? "warn" : "info",
      link: {
        label: "Open daily log",
        to: "/today",
      },
    });
  }

  if (!log.movement.includes("10-minute walk") && log.symptoms.constipation !== "none" && profile.reminderPreferences.movement) {
    reminders.push({
      id: "movement-nudge",
      title: "Short walk still open",
      body: "A 10-minute walk is not logged yet today. Light movement often helps more than waiting when constipation is active.",
      tone: "info",
      link: {
        label: "Open daily log",
        to: "/today",
      },
    });
  }

  if (!log.supplements.includes("Protein supplement") && log.appetiteLevel !== "normal" && proteinToday < 60 && profile.reminderPreferences.proteinSupport) {
    reminders.push({
      id: "protein-support",
      title: "Protein support is still open",
      body: "Appetite is reduced and protein intake is still light today. A shake or other protein supplement may be the lowest-friction catch-up move.",
      tone: "info",
      link: {
        label: "Open daily log",
        to: "/today",
      },
    });
  }

  if (!log.movement.includes("Strength session") && recentStrengthDays === 0 && profile.reminderPreferences.movement) {
    reminders.push({
      id: "strength-consistency",
      title: "No strength work logged this week",
      body: "Protein helps most when some resistance work is happening too. Even one short strength session this week would move the needle.",
      tone: "info",
      link: {
        label: "Open daily log",
        to: "/today",
      },
    });
  }

  if (latestMedicationLog?.injectionSite && profile.reminderPreferences.rotation) {
    reminders.push({
      id: "rotation-nudge",
      title: "Rotate injection site",
      body: `Last logged site was ${latestMedicationLog.injectionSite}. Consider ${getNextInjectionSite(latestMedicationLog.injectionSite)} for the next shot.`,
      tone: "info",
      link: {
        label: "Open medication timeline",
        to: "/medication",
      },
    });
  }

  return reminders.slice(0, 7);
}

function getDaysUntilShot(shotDay: string, referenceDate = new Date()) {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shotDayIndex = weekdays.indexOf(shotDay);

  if (shotDayIndex === -1) {
    return 7;
  }

  return (shotDayIndex - referenceDate.getDay() + 7) % 7;
}

function daysSinceDate(date: string, referenceDate = new Date()) {
  const target = new Date(`${date}T12:00:00`);
  const diffMs = referenceDate.getTime() - target.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getNextInjectionSite(current: string) {
  const currentIndex = injectionSites.indexOf(current);
  if (currentIndex === -1) {
    return injectionSites[0];
  }
  return injectionSites[(currentIndex + 1) % injectionSites.length];
}
