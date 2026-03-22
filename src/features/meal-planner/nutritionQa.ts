import type { Recipe } from "./types";

export type Nutrients = {
  calories: number;
  protein: number;
  fiber: number;
};

export type IngredientEstimate = {
  ingredient: string;
  nutrients: Nutrients;
  parsed: boolean;
  assumed: boolean;
  note?: string;
};

export type RecipeNutritionQaResult = {
  recipeId: string;
  name: string;
  servings: number;
  stored: Nutrients;
  estimated: Nutrients;
  estimatedBatch: Nutrients;
  delta: Nutrients;
  matchedIngredients: number;
  assumedIngredients: number;
  skippedIngredients: string[];
  coverage: number;
  confidence: "high" | "medium" | "low";
  score: number;
};

export type QaThresholds = {
  calories: number;
  protein: number;
  fiber: number;
  minimumCoverage: number;
};

type SupportedRecipe = Pick<Recipe, "id" | "name" | "servings" | "protein" | "fiber" | "calories" | "ingredients">;
type Unit = "bag" | "can" | "clove" | "cup" | "head" | "item" | "lb" | "oz" | "packet" | "pint" | "slice" | "scoop" | "stalk" | "tbsp" | "tsp";

type ParsedAmount = {
  quantity: number | null;
  unit: Unit | null;
  remainder: string;
};

type Rule = {
  pattern: RegExp;
  units: Partial<Record<Unit, Nutrients>>;
  defaultUnit?: Unit;
  ignore?: boolean;
  fallback?: (recipe: SupportedRecipe, ingredient: string) => { quantity: number; unit: Unit; note: string } | null;
};

const ZERO: Nutrients = { calories: 0, protein: 0, fiber: 0 };

export const DEFAULT_QA_THRESHOLDS: QaThresholds = {
  calories: 80,
  protein: 8,
  fiber: 4,
  minimumCoverage: 0.7,
};

const UNIT_ALIASES: Record<string, Unit> = {
  bag: "bag",
  bags: "bag",
  can: "can",
  cans: "can",
  clove: "clove",
  cloves: "clove",
  cup: "cup",
  cups: "cup",
  head: "head",
  heads: "head",
  lb: "lb",
  lbs: "lb",
  ounce: "oz",
  ounces: "oz",
  oz: "oz",
  packet: "packet",
  packets: "packet",
  pint: "pint",
  pints: "pint",
  scoop: "scoop",
  scoops: "scoop",
  slice: "slice",
  slices: "slice",
  stalk: "stalk",
  stalks: "stalk",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tsp: "tsp",
};

const RULES: Rule[] = [
  {
    pattern:
      /\b(salt|pepper|paprika|cumin|turmeric|thyme|rosemary|sage|oregano|italian seasoning|garam masala|curry powder|cinnamon|baking powder|bay leaves|dried herbs|fresh rosemary|fresh dill|black pepper|garlic powder|smoked paprika|ginger|minced ginger|vinegar|lemon juice|juice of|lime|cilantro|mustard|herbs for garnish|garnish|optional topping|dark chocolate drizzle|dark chocolate shavings|flaky sea salt|seasoning)\b/,
    units: {},
    ignore: true,
  },
  {
    pattern: /greek yogurt/,
    defaultUnit: "cup",
    units: { cup: { calories: 130, protein: 23, fiber: 0 } },
  },
  {
    pattern: /cottage cheese/,
    defaultUnit: "cup",
    units: { cup: { calories: 180, protein: 24, fiber: 0 } },
  },
  {
    pattern: /almond milk/,
    defaultUnit: "cup",
    units: { cup: { calories: 30, protein: 1, fiber: 0.5 } },
  },
  {
    pattern: /coconut milk/,
    defaultUnit: "cup",
    units: {
      can: { calories: 240, protein: 3, fiber: 2 },
      cup: { calories: 45, protein: 0.5, fiber: 0 },
    },
  },
  {
    pattern: /(pea protein|protein powder)/,
    defaultUnit: "scoop",
    units: { scoop: { calories: 120, protein: 24, fiber: 1 } },
  },
  {
    pattern: /\bvanilla(?: extract)?\b/,
    units: {},
    ignore: true,
  },
  {
    pattern: /(rolled oats|gf oats|steel cut oats|oats\b)/,
    defaultUnit: "cup",
    units: { cup: { calories: 300, protein: 10, fiber: 8 } },
  },
  {
    pattern: /oat flour/,
    defaultUnit: "cup",
    units: { cup: { calories: 400, protein: 14, fiber: 8 } },
  },
  {
    pattern: /quinoa/,
    defaultUnit: "cup",
    units: { cup: { calories: 222, protein: 8, fiber: 5 } },
    fallback: (_recipe, ingredient) =>
      /\b(dry|rinsed)\b/.test(ingredient.toLowerCase())
        ? { quantity: 3, unit: "cup", note: "treated dry quinoa as cooked-yield cups" }
        : null,
  },
  {
    pattern: /brown rice/,
    defaultUnit: "cup",
    units: { cup: { calories: 216, protein: 5, fiber: 3.5 } },
  },
  {
    pattern: /\brice\b/,
    defaultUnit: "cup",
    units: { cup: { calories: 205, protein: 4, fiber: 1 } },
    fallback: (recipe, ingredient) =>
      ingredient.includes("for serving")
        ? { quantity: recipe.servings * 0.5, unit: "cup", note: "assumed 1/2 cup cooked rice per serving" }
        : null,
  },
  {
    pattern: /hashbrowns/,
    defaultUnit: "cup",
    units: { cup: { calories: 70, protein: 1.5, fiber: 2 } },
  },
  {
    pattern: /chia seeds?/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 960, protein: 32, fiber: 80 },
      tbsp: { calories: 60, protein: 2, fiber: 5 },
    },
  },
  {
    pattern: /ground flaxseed|flaxseed/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 600, protein: 21, fiber: 32 },
      tbsp: { calories: 37, protein: 1.3, fiber: 2 },
    },
  },
  {
    pattern: /olive oil|sesame oil|coconut oil/,
    defaultUnit: "tbsp",
    units: { tbsp: { calories: 120, protein: 0, fiber: 0 } },
  },
  {
    pattern: /maple syrup|honey/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 832, protein: 0, fiber: 0 },
      tbsp: { calories: 52, protein: 0, fiber: 0 },
    },
  },
  {
    pattern: /bbq sauce/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 360, protein: 0, fiber: 0 },
      tbsp: { calories: 23, protein: 0, fiber: 0 },
    },
  },
  {
    pattern: /almond butter/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 1520, protein: 56, fiber: 32 },
      tbsp: { calories: 95, protein: 3.5, fiber: 2 },
    },
  },
  {
    pattern: /peanut butter/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 1520, protein: 64, fiber: 24 },
      tbsp: { calories: 95, protein: 4, fiber: 1.5 },
      tsp: { calories: 32, protein: 1.3, fiber: 0.5 },
    },
  },
  {
    pattern: /walnuts/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 785, protein: 18, fiber: 8 },
      tbsp: { calories: 49, protein: 1.1, fiber: 0.5 },
    },
  },
  {
    pattern: /pecans/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 780, protein: 10, fiber: 11 },
      tbsp: { calories: 49, protein: 0.6, fiber: 0.7 },
    },
  },
  {
    pattern: /sliced almonds|chopped almonds|almonds/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 680, protein: 24, fiber: 16 },
      tbsp: { calories: 43, protein: 1.5, fiber: 1 },
    },
  },
  {
    pattern: /chopped peanuts|peanuts/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 854, protein: 38, fiber: 12 },
      tbsp: { calories: 53, protein: 2.4, fiber: 0.8 },
    },
  },
  {
    pattern: /pumpkin seeds/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 720, protein: 38, fiber: 10 },
      tbsp: { calories: 45, protein: 2.4, fiber: 0.6 },
    },
  },
  {
    pattern: /dark chocolate chips|mini dark chocolate chips/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 805, protein: 10, fiber: 8 },
      oz: { calories: 140, protein: 2, fiber: 1 },
      tbsp: { calories: 50, protein: 0.6, fiber: 0.5 },
    },
  },
  {
    pattern: /cocoa powder/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 190, protein: 16, fiber: 32 },
      tbsp: { calories: 12, protein: 1, fiber: 2 },
    },
  },
  {
    pattern: /graham-style crackers/,
    defaultUnit: "cup",
    units: { cup: { calories: 480, protein: 8, fiber: 2 } },
  },
  {
    pattern: /granola/,
    defaultUnit: "cup",
    units: { cup: { calories: 440, protein: 10, fiber: 6 } },
  },
  {
    pattern: /hummus/,
    defaultUnit: "cup",
    units: { cup: { calories: 420, protein: 12, fiber: 12 } },
  },
  {
    pattern: /black beans/,
    defaultUnit: "can",
    units: {
      can: { calories: 330, protein: 21, fiber: 18 },
      cup: { calories: 227, protein: 15, fiber: 15 },
    },
    fallback: (recipe, ingredient) =>
      ingredient.includes("side")
        ? { quantity: recipe.servings * 0.5, unit: "cup", note: "assumed 1/2 cup black beans per serving" }
        : null,
  },
  {
    pattern: /kidney beans/,
    defaultUnit: "can",
    units: {
      can: { calories: 330, protein: 21, fiber: 18 },
      cup: { calories: 225, protein: 15, fiber: 13 },
    },
  },
  {
    pattern: /pinto beans/,
    defaultUnit: "can",
    units: {
      can: { calories: 330, protein: 21, fiber: 18 },
      cup: { calories: 245, protein: 15, fiber: 15 },
    },
  },
  {
    pattern: /white beans/,
    defaultUnit: "can",
    units: {
      can: { calories: 350, protein: 24, fiber: 16 },
      cup: { calories: 250, protein: 17, fiber: 11 },
    },
  },
  {
    pattern: /chickpeas/,
    defaultUnit: "can",
    units: {
      can: { calories: 400, protein: 21, fiber: 18 },
      cup: { calories: 269, protein: 15, fiber: 12 },
    },
  },
  {
    pattern: /lentils/,
    defaultUnit: "cup",
    units: { cup: { calories: 230, protein: 18, fiber: 16 } },
    fallback: (_recipe, ingredient) =>
      /\b(dry|rinsed)\b/.test(ingredient.toLowerCase())
        ? { quantity: 3, unit: "cup", note: "treated dry lentils as cooked-yield cups" }
        : null,
  },
  {
    pattern: /corn tortillas/,
    defaultUnit: "item",
    units: { item: { calories: 50, protein: 1, fiber: 1 } },
    fallback: (recipe) => ({ quantity: recipe.servings * 2, unit: "item", note: "assumed 2 tortillas per serving" }),
  },
  {
    pattern: /crackers/,
    units: {},
    ignore: true,
  },
  {
    pattern: /salsa verde|salsa/,
    defaultUnit: "cup",
    units: { cup: { calories: 70, protein: 2, fiber: 4 } },
  },
  {
    pattern: /enchilada sauce/,
    defaultUnit: "cup",
    units: { cup: { calories: 100, protein: 3, fiber: 2 } },
  },
  {
    pattern: /tomato sauce/,
    defaultUnit: "can",
    units: { can: { calories: 80, protein: 4, fiber: 4 } },
  },
  {
    pattern: /tomato paste/,
    defaultUnit: "tbsp",
    units: { tbsp: { calories: 13, protein: 0.7, fiber: 0.8 } },
  },
  {
    pattern: /diced tomatoes|cherry tomatoes|tomatoes/,
    defaultUnit: "cup",
    units: {
      can: { calories: 80, protein: 4, fiber: 4 },
      cup: { calories: 30, protein: 1.5, fiber: 2 },
      lb: { calories: 80, protein: 4, fiber: 5 },
      pint: { calories: 60, protein: 3, fiber: 4 },
    },
  },
  {
    pattern: /corn\b/,
    defaultUnit: "cup",
    units: {
      can: { calories: 140, protein: 5, fiber: 4 },
      cup: { calories: 134, protein: 5, fiber: 4 },
    },
  },
  {
    pattern: /feta/,
    defaultUnit: "cup",
    units: { cup: { calories: 400, protein: 21, fiber: 0 } },
    fallback: (_recipe, ingredient) =>
      ingredient.trim() === "feta cheese" || ingredient.trim() === "feta"
        ? { quantity: 0.5, unit: "cup", note: "assumed 1/2 cup feta for recipe" }
        : null,
  },
  {
    pattern: /tahini dressing/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 1280, protein: 32, fiber: 16 },
      tbsp: { calories: 80, protein: 2, fiber: 1 },
    },
    fallback: () => ({ quantity: 4, unit: "tbsp", note: "assumed 1/4 cup dressing for recipe" }),
  },
  {
    pattern: /shredded mexican cheese|shredded cheddar cheese|shredded mozzarella|cheddar cheese|shredded cheese|\bcheese\b/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 440, protein: 28, fiber: 0 },
      oz: { calories: 110, protein: 7, fiber: 0 },
      slice: { calories: 80, protein: 5, fiber: 0 },
    },
    fallback: (_recipe, ingredient) =>
      ingredient.trim() === "shredded cheese" ? { quantity: 1, unit: "cup", note: "assumed 1 cup shredded cheese for recipe" } : null,
  },
  {
    pattern: /sour cream/,
    defaultUnit: "tbsp",
    units: {
      cup: { calories: 480, protein: 8, fiber: 0 },
      tbsp: { calories: 30, protein: 0.5, fiber: 0 },
    },
    fallback: (_recipe, ingredient) =>
      ingredient.trim() === "sour cream" ? { quantity: 0.5, unit: "cup", note: "assumed 1/2 cup sour cream for recipe" } : null,
  },
  {
    pattern: /kalamata olives|olives/,
    defaultUnit: "cup",
    units: { cup: { calories: 180, protein: 1, fiber: 3 } },
  },
  {
    pattern: /chicken breast/,
    defaultUnit: "lb",
    units: { lb: { calories: 544, protein: 104, fiber: 0 } },
  },
  {
    pattern: /chicken thighs/,
    defaultUnit: "lb",
    units: { lb: { calories: 680, protein: 88, fiber: 0 } },
  },
  {
    pattern: /ground turkey|lean ground turkey/,
    defaultUnit: "lb",
    units: { lb: { calories: 700, protein: 88, fiber: 0 } },
  },
  {
    pattern: /deli turkey/,
    defaultUnit: "slice",
    units: { slice: { calories: 25, protein: 5, fiber: 0 } },
  },
  {
    pattern: /lean ground beef|ground beef/,
    defaultUnit: "lb",
    units: { lb: { calories: 800, protein: 88, fiber: 0 } },
  },
  {
    pattern: /lean beef stew meat|lean beef strips|lean beef sirloin|lean beef roast|beef stew meat|beef/,
    defaultUnit: "lb",
    units: {
      lb: { calories: 750, protein: 100, fiber: 0 },
      oz: { calories: 47, protein: 6.25, fiber: 0 },
    },
  },
  {
    pattern: /pork tenderloin|pork shoulder|ground pork/,
    defaultUnit: "lb",
    units: { lb: { calories: 700, protein: 92, fiber: 0 } },
  },
  {
    pattern: /pork chops/,
    defaultUnit: "item",
    units: {
      item: { calories: 240, protein: 35, fiber: 0 },
      lb: { calories: 760, protein: 96, fiber: 0 },
    },
  },
  {
    pattern: /mixed berries|berries|strawberries/,
    defaultUnit: "cup",
    units: { cup: { calories: 70, protein: 1, fiber: 4 } },
  },
  {
    pattern: /banana/,
    defaultUnit: "item",
    units: { item: { calories: 105, protein: 1.3, fiber: 3 } },
  },
  {
    pattern: /mango/,
    defaultUnit: "cup",
    units: { cup: { calories: 100, protein: 1, fiber: 3 } },
  },
  {
    pattern: /pineapple|peaches/,
    defaultUnit: "cup",
    units: { cup: { calories: 80, protein: 1, fiber: 2 } },
  },
  {
    pattern: /avocado/,
    defaultUnit: "item",
    units: { item: { calories: 240, protein: 3, fiber: 10 } },
  },
  {
    pattern: /spinach/,
    defaultUnit: "cup",
    units: { cup: { calories: 7, protein: 1, fiber: 0.7 } },
  },
  {
    pattern: /kale/,
    defaultUnit: "cup",
    units: { cup: { calories: 33, protein: 2, fiber: 1.3 } },
  },
  {
    pattern: /mixed greens|romaine|lettuce|butter lettuce/,
    defaultUnit: "cup",
    units: { cup: { calories: 8, protein: 0.5, fiber: 0.6 } },
  },
  {
    pattern: /broccoli/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 31, protein: 2.5, fiber: 2.4 },
      head: { calories: 155, protein: 12, fiber: 12 },
    },
  },
  {
    pattern: /bell peppers and onions/,
    defaultUnit: "cup",
    units: { cup: { calories: 35, protein: 1, fiber: 2.5 } },
  },
  {
    pattern: /carrots\/celery\/bell pepper/,
    defaultUnit: "cup",
    units: { cup: { calories: 30, protein: 1, fiber: 2.5 } },
  },
  {
    pattern: /bell pepper|bell peppers/,
    defaultUnit: "item",
    units: {
      cup: { calories: 30, protein: 1, fiber: 2.5 },
      item: { calories: 35, protein: 1, fiber: 2.5 },
    },
  },
  {
    pattern: /onion/,
    defaultUnit: "item",
    units: {
      cup: { calories: 64, protein: 2, fiber: 3 },
      item: { calories: 44, protein: 1, fiber: 2 },
    },
  },
  {
    pattern: /garlic/,
    defaultUnit: "clove",
    units: { clove: { calories: 4.5, protein: 0.2, fiber: 0 } },
  },
  {
    pattern: /carrot/,
    defaultUnit: "item",
    units: {
      cup: { calories: 52, protein: 1.2, fiber: 3.6 },
      item: { calories: 25, protein: 0.6, fiber: 1.7 },
    },
  },
  {
    pattern: /celery/,
    defaultUnit: "stalk",
    units: {
      cup: { calories: 19, protein: 1, fiber: 1.6 },
      stalk: { calories: 6, protein: 0.3, fiber: 0.6 },
    },
  },
  {
    pattern: /sweet potato/,
    defaultUnit: "item",
    units: {
      cup: { calories: 114, protein: 2, fiber: 4 },
      item: { calories: 112, protein: 2, fiber: 4 },
      lb: { calories: 390, protein: 7, fiber: 14 },
    },
  },
  {
    pattern: /baby potatoes|potatoes/,
    defaultUnit: "item",
    units: {
      cup: { calories: 130, protein: 3, fiber: 3 },
      item: { calories: 110, protein: 3, fiber: 2 },
      lb: { calories: 350, protein: 9, fiber: 8 },
    },
  },
  {
    pattern: /parsnips|turnips/,
    defaultUnit: "item",
    units: { item: { calories: 80, protein: 1.5, fiber: 4 } },
  },
  {
    pattern: /cucumber/,
    defaultUnit: "item",
    units: {
      cup: { calories: 16, protein: 0.7, fiber: 1 },
      item: { calories: 45, protein: 2, fiber: 1.5 },
    },
  },
  {
    pattern: /zucchini/,
    defaultUnit: "item",
    units: { item: { calories: 33, protein: 2.5, fiber: 2 } },
  },
  {
    pattern: /acorn squash/,
    defaultUnit: "item",
    units: { item: { calories: 172, protein: 4, fiber: 9 } },
  },
  {
    pattern: /cauliflower rice/,
    defaultUnit: "bag",
    units: {
      bag: { calories: 80, protein: 6, fiber: 6 },
      cup: { calories: 25, protein: 2, fiber: 2 },
    },
  },
  {
    pattern: /mushrooms/,
    defaultUnit: "cup",
    units: {
      cup: { calories: 15, protein: 2, fiber: 1 },
      lb: { calories: 100, protein: 13, fiber: 5 },
    },
  },
  {
    pattern: /asparagus/,
    defaultUnit: "lb",
    units: {
      cup: { calories: 27, protein: 3, fiber: 3 },
      lb: { calories: 90, protein: 10, fiber: 10 },
    },
  },
  {
    pattern: /brussels sprouts/,
    defaultUnit: "lb",
    units: {
      cup: { calories: 56, protein: 4, fiber: 4 },
      lb: { calories: 194, protein: 13, fiber: 14 },
    },
  },
  {
    pattern: /green beans/,
    defaultUnit: "lb",
    units: {
      cup: { calories: 31, protein: 2, fiber: 3.5 },
      lb: { calories: 140, protein: 8, fiber: 16 },
    },
  },
  {
    pattern: /green cabbage|cabbage/,
    defaultUnit: "cup",
    units: {
      bag: { calories: 100, protein: 6, fiber: 8 },
      cup: { calories: 22, protein: 1, fiber: 2 },
      head: { calories: 176, protein: 8, fiber: 16 },
    },
    fallback: (recipe, ingredient) =>
      ingredient.trim() === "cabbage slaw"
        ? { quantity: recipe.servings * 0.5, unit: "cup", note: "assumed 1/2 cup slaw per serving" }
        : null,
  },
  {
    pattern: /apple/,
    defaultUnit: "item",
    units: { item: { calories: 95, protein: 0.5, fiber: 4.5 } },
  },
  {
    pattern: /dates/,
    defaultUnit: "item",
    units: { item: { calories: 66, protein: 0.4, fiber: 1.6 } },
  },
  {
    pattern: /coleslaw mix/,
    defaultUnit: "bag",
    units: { bag: { calories: 100, protein: 6, fiber: 8 } },
  },
  {
    pattern: /tamari|soy sauce|worcestershire sauce/,
    defaultUnit: "tbsp",
    units: { tbsp: { calories: 10, protein: 1, fiber: 0 } },
  },
];

export function estimateRecipeNutrition(recipe: SupportedRecipe): RecipeNutritionQaResult {
  const estimates = recipe.ingredients.map((ingredient) => estimateIngredient(recipe, ingredient));
  const estimatedBatch = estimates.reduce(
    (totals, estimate) => addNutrients(totals, estimate.nutrients),
    { calories: 0, protein: 0, fiber: 0 },
  );
  const estimated = divideNutrients(estimatedBatch, recipe.servings);
  const stored = {
    calories: recipe.calories,
    protein: recipe.protein,
    fiber: recipe.fiber,
  };
  const matchedIngredients = estimates.filter((estimate) => estimate.parsed).length;
  const assumedIngredients = estimates.filter((estimate) => estimate.assumed).length;
  const skippedIngredients = estimates.filter((estimate) => !estimate.parsed).map((estimate) => estimate.ingredient);
  const coverage = recipe.ingredients.length === 0 ? 1 : matchedIngredients / recipe.ingredients.length;
  const confidence = coverage >= 0.85 ? "high" : coverage >= 0.65 ? "medium" : "low";
  const delta = {
    calories: roundToWhole(estimated.calories - stored.calories),
    protein: roundToWhole(estimated.protein - stored.protein),
    fiber: roundToWhole(estimated.fiber - stored.fiber),
  };

  return {
    recipeId: recipe.id,
    name: recipe.name,
    servings: recipe.servings,
    stored,
    estimated,
    estimatedBatch,
    delta,
    matchedIngredients,
    assumedIngredients,
    skippedIngredients,
    coverage,
    confidence,
    score:
      Math.abs(delta.calories) / 50 +
      Math.abs(delta.protein) / 5 +
      Math.abs(delta.fiber) / 2 +
      assumedIngredients * 0.4 +
      (1 - coverage) * 4,
  };
}

export function findRecipeNutritionOutliers(
  recipes: SupportedRecipe[],
  thresholds: QaThresholds = DEFAULT_QA_THRESHOLDS,
): RecipeNutritionQaResult[] {
  return recipes
    .map((recipe) => estimateRecipeNutrition(recipe))
    .filter((result) => isOutlier(result, thresholds))
    .sort((left, right) => right.score - left.score);
}

export function formatQaRow(result: RecipeNutritionQaResult) {
  return [
    padEnd(result.recipeId, 4),
    padEnd(trimLabel(result.name, 34), 34),
    padStart(`${Math.round(result.coverage * 100)}%`, 5),
    padStart(`${result.stored.calories}/${result.stored.protein}/${result.stored.fiber}`, 13),
    padStart(`${result.estimated.calories}/${result.estimated.protein}/${result.estimated.fiber}`, 13),
    padStart(`${signed(result.delta.calories)}/${signed(result.delta.protein)}/${signed(result.delta.fiber)}`, 14),
  ].join("  ");
}

export function formatQaDetail(result: RecipeNutritionQaResult) {
  const skipped =
    result.skippedIngredients.length > 0 ? `skipped: ${result.skippedIngredients.join(" | ")}` : "skipped: none";

  return `${result.recipeId} ${result.name}
  servings: ${result.servings} | coverage: ${Math.round(result.coverage * 100)}% | confidence: ${result.confidence} | assumed: ${result.assumedIngredients}
  stored per serving: ${result.stored.calories} cal, ${result.stored.protein}g protein, ${result.stored.fiber}g fiber
  estimated per serving: ${result.estimated.calories} cal, ${result.estimated.protein}g protein, ${result.estimated.fiber}g fiber
  delta: ${signed(result.delta.calories)} cal, ${signed(result.delta.protein)}g protein, ${signed(result.delta.fiber)}g fiber
  ${skipped}`;
}

function estimateIngredient(recipe: SupportedRecipe, ingredient: string): IngredientEstimate {
  const normalized = normalizeIngredient(ingredient);
  const parsed = parseAmount(normalized);

  for (const rule of RULES) {
    if (!rule.pattern.test(normalized)) {
      continue;
    }

    if (rule.ignore) {
      return {
        ingredient,
        nutrients: ZERO,
        parsed: true,
        assumed: false,
        note: "ignored low-impact ingredient",
      };
    }

    const fallback = rule.fallback?.(recipe, ingredient);
    const resolved = resolveQuantity(parsed, rule, fallback);

    if (!resolved) {
      return { ingredient, nutrients: ZERO, parsed: false, assumed: false };
    }

    const perUnit = rule.units[resolved.unit];

    if (!perUnit) {
      return { ingredient, nutrients: ZERO, parsed: false, assumed: false };
    }

    return {
      ingredient,
      nutrients: scaleNutrients(perUnit, resolved.quantity),
      parsed: true,
      assumed: resolved.assumed,
      note: resolved.note,
    };
  }

  return { ingredient, nutrients: ZERO, parsed: false, assumed: false };
}

function resolveQuantity(
  parsed: ParsedAmount,
  rule: Rule,
  fallback: { quantity: number; unit: Unit; note: string } | null | undefined,
) {
  const shouldConvertDryToCookedYield =
    (rule.pattern.source.includes("quinoa") || rule.pattern.source.includes("lentils")) && parsed.remainder.includes("dry");

  if (parsed.quantity !== null) {
    if (parsed.unit && rule.units[parsed.unit]) {
      return {
        quantity: shouldConvertDryToCookedYield && parsed.unit === "cup" ? parsed.quantity * 3 : parsed.quantity,
        unit: parsed.unit,
        assumed: shouldConvertDryToCookedYield,
        note: shouldConvertDryToCookedYield ? "converted dry grain/legume to cooked-yield cups" : undefined,
      };
    }

    if (!parsed.unit && rule.units.item) {
      return { quantity: parsed.quantity, unit: "item" as const, assumed: true, note: "assumed count-based ingredient" };
    }

    if (!parsed.unit && rule.defaultUnit && rule.units[rule.defaultUnit]) {
      let quantity = parsed.quantity;
      let note = "assumed default unit";

      if (shouldConvertDryToCookedYield) {
        quantity = parsed.quantity * 3;
        note = "converted dry grain/legume to cooked-yield cups";
      }

      return {
        quantity,
        unit: rule.defaultUnit,
        assumed: true,
        note,
      };
    }
  }

  if (fallback) {
    return { ...fallback, assumed: true };
  }

  if (rule.defaultUnit && rule.units[rule.defaultUnit]) {
    return { quantity: 1, unit: rule.defaultUnit, assumed: true, note: "assumed default quantity of 1" };
  }

  return null;
}

function isOutlier(result: RecipeNutritionQaResult, thresholds: QaThresholds) {
  return (
    result.coverage < thresholds.minimumCoverage ||
    Math.abs(result.delta.calories) >= thresholds.calories ||
    Math.abs(result.delta.protein) >= thresholds.protein ||
    Math.abs(result.delta.fiber) >= thresholds.fiber
  );
}

function parseAmount(ingredient: string): ParsedAmount {
  let remainder = ingredient.trim();
  let quantity: number | null = null;

  const mixedMatch = remainder.match(/^(\d+)\s+(\d+)\/(\d+)\b/);
  if (mixedMatch) {
    quantity = Number(mixedMatch[1]) + Number(mixedMatch[2]) / Number(mixedMatch[3]);
    remainder = remainder.slice(mixedMatch[0].length).trim();
  } else {
    const fractionMatch = remainder.match(/^(\d+)\/(\d+)\b/);
    if (fractionMatch) {
      quantity = Number(fractionMatch[1]) / Number(fractionMatch[2]);
      remainder = remainder.slice(fractionMatch[0].length).trim();
    } else {
      const numberMatch = remainder.match(/^(\d+(?:\.\d+)?)\b/);
      if (numberMatch) {
        quantity = Number(numberMatch[1]);
        remainder = remainder.slice(numberMatch[0].length).trim();
      }
    }
  }

  const unitMatch = remainder.match(/^([a-z]+)/);
  const unit = unitMatch ? UNIT_ALIASES[unitMatch[1]] ?? null : null;

  if (unitMatch && unit) {
    remainder = remainder.slice(unitMatch[0].length).trim();
  }

  if (quantity !== null && unit === null && /^(large|medium|small)\b/.test(remainder)) {
    remainder = remainder.replace(/^(large|medium|small)\s+/, "");
  }

  return {
    quantity,
    unit,
    remainder,
  };
}

function normalizeIngredient(ingredient: string) {
  return ingredient
    .toLowerCase()
    .replace(/—/g, " ")
    .replace(/[(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scaleNutrients(base: Nutrients, multiplier: number): Nutrients {
  return {
    calories: roundToWhole(base.calories * multiplier),
    protein: roundToWhole(base.protein * multiplier),
    fiber: roundToWhole(base.fiber * multiplier),
  };
}

function divideNutrients(base: Nutrients, divisor: number): Nutrients {
  return {
    calories: roundToWhole(base.calories / divisor),
    protein: roundToWhole(base.protein / divisor),
    fiber: roundToWhole(base.fiber / divisor),
  };
}

function addNutrients(left: Nutrients, right: Nutrients): Nutrients {
  return {
    calories: left.calories + right.calories,
    protein: left.protein + right.protein,
    fiber: left.fiber + right.fiber,
  };
}

function roundToWhole(value: number) {
  return Math.round(value);
}

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

function trimLabel(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}

function padEnd(value: string, length: number) {
  return value.padEnd(length, " ");
}

function padStart(value: string, length: number) {
  return value.padStart(length, " ");
}
