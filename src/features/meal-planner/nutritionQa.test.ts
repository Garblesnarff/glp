import { describe, expect, test } from "bun:test";
import { RECIPES, RECIPE_SEEDS } from "./data/recipes";
import { estimateRecipeNutrition, findRecipeNutritionOutliers } from "./nutritionQa";

describe("recipe nutrition QA", () => {
  test("keeps ingredient coverage high enough to estimate nutrition", () => {
    const coverage = RECIPE_SEEDS.map((recipe) => estimateRecipeNutrition(recipe).coverage);

    expect(Math.min(...coverage)).toBeGreaterThanOrEqual(0.7);
  });

  test("keeps raw recipe seeds aligned with ingredient-based estimates", () => {
    expect(findRecipeNutritionOutliers(RECIPE_SEEDS)).toHaveLength(0);
  });

  test("exports recipes with normalized per-serving nutrition", () => {
    expect(findRecipeNutritionOutliers(RECIPES)).toHaveLength(0);
  });
});
