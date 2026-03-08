import type { DailyLog, UserProfile } from "../../domain/types";

export function getConsistencySummary(profile: UserProfile, recentLogs: DailyLog[]) {
  const ordered = [...recentLogs].sort((a, b) => b.date.localeCompare(a.date));

  const hydrationStreak = countLeading(ordered, (log) => log.hydrationOz >= profile.hydrationGoal);
  const proteinStreak = countLeading(
    ordered,
    (log) => log.mealsConsumed.reduce((sum, meal) => sum + meal.actualProtein, 0) >= profile.proteinTarget.min,
  );
  const movementStreak = countLeading(ordered, (log) => log.movement.length > 0);
  const loggingStreak = countLeading(ordered, (log) => hasMeaningfulCheckIn(log));

  const wins: string[] = [];

  if (hydrationStreak >= 3) {
    wins.push(`${hydrationStreak}-day hydration streak. That consistency matters more than a noisy weigh-in.`);
  }

  if (proteinStreak >= 3) {
    wins.push(`${proteinStreak}-day protein streak. This is the kind of pattern that protects lean mass over time.`);
  }

  if (movementStreak >= 2) {
    wins.push(`${movementStreak}-day movement streak. Small repeated sessions are exactly what this app should celebrate.`);
  }

  if (wins.length === 0 && loggingStreak >= 3) {
    wins.push(`${loggingStreak}-day logging streak. Building usable data is a win even before the trends look dramatic.`);
  }

  if (wins.length === 0) {
    wins.push("No major streak is active yet. Start with hydration or protein and let the app celebrate consistency, not perfection.");
  }

  return {
    hydrationStreak,
    proteinStreak,
    movementStreak,
    loggingStreak,
    wins: wins.slice(0, 3),
  };
}

function countLeading(logs: DailyLog[], predicate: (log: DailyLog) => boolean) {
  let count = 0;

  for (const log of logs) {
    if (!predicate(log)) {
      break;
    }
    count += 1;
  }

  return count;
}

function hasMeaningfulCheckIn(log: DailyLog) {
  return (
    log.hydrationOz > 0 ||
    log.appetiteLevel !== "normal" ||
    log.mealsConsumed.length > 0 ||
    log.supplements.length > 0 ||
    log.movement.length > 0 ||
    Object.values(log.symptoms).some((severity) => severity !== "none")
  );
}
