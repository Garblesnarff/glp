import { EMPTY_WEEK_PLAN, RECIPES } from "./data/recipes";
import type { GroceryListItem, MealType, NutritionStats, Recipe, WeekPlan, WeeklyStats } from "./types";

export function formatDuration(minutes: number) {
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function cloneEmptyWeekPlan(): WeekPlan {
  return JSON.parse(JSON.stringify(EMPTY_WEEK_PLAN)) as WeekPlan;
}

export function createRecipeMap(recipes: Recipe[] = RECIPES) {
  return new Map(recipes.map((recipe) => [recipe.id, recipe]));
}

export function filterRecipes(params: {
  recipes?: Recipe[];
  search: string;
  mealFilter: MealType | "all";
  tagFilter: string;
}) {
  const { recipes = RECIPES, search, mealFilter, tagFilter } = params;
  const query = search.trim().toLowerCase();

  return recipes.filter((recipe) => {
    if (mealFilter !== "all" && recipe.meal !== mealFilter) {
      return false;
    }

    if (tagFilter !== "all" && !recipe.tags.includes(tagFilter)) {
      return false;
    }

    if (
      query &&
      !recipe.name.toLowerCase().includes(query) &&
      !recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query))
    ) {
      return false;
    }

    return true;
  });
}

export function calculateWeeklyStats(weekPlan: WeekPlan, recipeMap: Map<string, Recipe>): WeeklyStats {
  return Object.fromEntries(
    Object.entries(weekPlan).map(([day, meals]) => {
      const totals = Object.values(meals).reduce<NutritionStats>(
        (acc, recipeId) => {
          const recipe = recipeId ? recipeMap.get(recipeId) : null;
          if (recipe) {
            acc.protein += recipe.protein;
            acc.fiber += recipe.fiber;
            acc.calories += recipe.calories;
          }
          return acc;
        },
        { protein: 0, fiber: 0, calories: 0 },
      );

      return [day, totals];
    }),
  );
}

export function buildGroceryList(weekPlan: WeekPlan, recipeMap: Map<string, Recipe>): GroceryListItem[] {
  const items: Record<string, GroceryListItem> = {};

  Object.values(weekPlan).forEach((meals) => {
    Object.values(meals).forEach((recipeId) => {
      const recipe = recipeId ? recipeMap.get(recipeId) : null;
      if (!recipe) {
        return;
      }

      recipe.ingredients.forEach((ingredient) => {
        const key = ingredient.toLowerCase().trim();
        if (!items[key]) {
          items[key] = { text: ingredient, count: 0 };
        }
        items[key].count += 1;
      });
    });
  });

  return Object.values(items).sort((a, b) => a.text.localeCompare(b.text));
}

export function assignRecipeToWeekPlan(weekPlan: WeekPlan, day: string, meal: MealType, recipeId: string): WeekPlan {
  return {
    ...weekPlan,
    [day]: {
      ...weekPlan[day],
      [meal]: recipeId,
    },
  };
}

export function clearMealSlot(weekPlan: WeekPlan, day: string, meal: MealType): WeekPlan {
  return {
    ...weekPlan,
    [day]: {
      ...weekPlan[day],
      [meal]: null,
    },
  };
}
