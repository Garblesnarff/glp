import { describe, expect, it } from "vitest";
import { getFoodDiaryTotals, sortFoodDiaryEntries } from "./utils";
import type { FoodDiaryEntry } from "./types";

describe("food diary utils", () => {
  it("sorts entries by date descending", () => {
    const entries: FoodDiaryEntry[] = [
      { id: "3", date: "2026-01-09", mealType: "dinner", foodName: "Chicken bowl" },
      { id: "1", date: "2026-01-10", mealType: "breakfast", foodName: "Greek yogurt" },
      { id: "2", date: "2026-01-10", mealType: "snack", foodName: "Protein shake" },
    ];

    expect(sortFoodDiaryEntries(entries).map((entry) => entry.id)).toEqual(["1", "2", "3"]);
  });

  it("computes calories and protein totals", () => {
    const entries: FoodDiaryEntry[] = [
      { id: "1", date: "2026-01-10", mealType: "breakfast", foodName: "Greek yogurt", calories: 180, proteinGrams: 17 },
      { id: "2", date: "2026-01-10", mealType: "snack", foodName: "Protein shake", calories: 150, proteinGrams: 30 },
      { id: "3", date: "2026-01-10", mealType: "dinner", foodName: "Soup" },
    ];

    expect(getFoodDiaryTotals(entries)).toEqual({ calories: 330, proteinGrams: 47 });
  });
});
