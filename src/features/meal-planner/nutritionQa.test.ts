import { describe, expect, test } from "bun:test";
import { RECIPES, RECIPE_SEEDS } from "./data/recipes";
import { estimateRecipeNutrition, findRecipeNutritionOutliers } from "./nutritionQa";

const EXPLICIT_INGREDIENT_ALLOWLIST = [
  /^salt/i,
  /^pepper/i,
  /^fresh herbs/i,
  /^fresh parsley/i,
  /^fresh cilantro/i,
  /^fresh dill/i,
  /^cilantro$/i,
  /^lime$/i,
  /^cinnamon/i,
  /^flaky sea salt$/i,
  /^sprinkle of cinnamon$/i,
  /^juice of/i,
  /^juice and zest/i,
  /^dark chocolate drizzle$/i,
  /^dark chocolate shavings/i,
];

function ingredientHasExplicitQuantity(ingredient: string) {
  return /^\s*[\d.]/.test(ingredient) || EXPLICIT_INGREDIENT_ALLOWLIST.some((pattern) => pattern.test(ingredient));
}

describe("recipe nutrition QA", () => {
  test("keeps ingredient lines explicit enough for a human cook to shop from them", () => {
    const vagueIngredients = RECIPE_SEEDS.flatMap((recipe) =>
      recipe.ingredients
        .filter((ingredient) => !ingredientHasExplicitQuantity(ingredient))
        .map((ingredient) => `${recipe.id}: ${ingredient}`),
    );

    expect(vagueIngredients).toEqual([]);
  });

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
