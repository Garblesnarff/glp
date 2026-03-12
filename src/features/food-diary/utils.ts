import type { FoodDiaryEntry } from "./types";

export function sortFoodDiaryEntries(entries: FoodDiaryEntry[]): FoodDiaryEntry[] {
  return [...entries].sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return a.mealType.localeCompare(b.mealType) || a.foodName.localeCompare(b.foodName);
  });
}

export function getFoodDiaryTotals(entries: FoodDiaryEntry[]) {
  return entries.reduce(
    (acc, entry) => {
      acc.calories += entry.calories ?? 0;
      acc.proteinGrams += entry.proteinGrams ?? 0;
      return acc;
    },
    { calories: 0, proteinGrams: 0 },
  );
}
