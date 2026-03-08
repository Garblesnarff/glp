import type { DailyLog, WeightLog } from "../../domain/types";
import type { TrendPoint } from "../history/components/LineTrendChart";

export function getWeightTrendSummary(weightLogs: WeightLog[], recentLogs: DailyLog[]) {
  const latest = weightLogs[0] ?? null;
  const previous = weightLogs[1] ?? null;
  const delta = latest && previous ? Math.round((latest.weight - previous.weight) * 10) / 10 : null;
  const hydrationDays = recentLogs.filter((log) => log.hydrationOz >= 64).length;
  const proteinDays = recentLogs.filter((log) => log.mealsConsumed.reduce((sum, meal) => sum + meal.actualProtein, 0) >= 100).length;

  const consistencyScore = hydrationDays + proteinDays;
  let framing = "The scale is one data point. Consistency with hydration and protein deserves more attention than day-to-day noise.";

  if (consistencyScore >= 8) {
    framing = "Hydration and protein consistency both look strong. That is the behavior pattern worth protecting, regardless of a single weigh-in.";
  } else if (consistencyScore <= 3) {
    framing = "Before reacting to the scale, rebuild the basics: hydration, protein, and meal tolerance consistency.";
  }

  return {
    latest,
    previous,
    delta,
    hydrationDays,
    proteinDays,
    framing,
  };
}

export function getWeightChartSeries(weightLogs: WeightLog[]) {
  return [...weightLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      label: formatShortDate(entry.date),
      value: entry.weight,
      note: entry.clothesFit ? `${entry.clothesFit} fit` : undefined,
    })) satisfies TrendPoint[];
}

function formatShortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
