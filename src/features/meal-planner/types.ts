export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
export const appetiteLevels = ["none", "low", "normal"] as const;
export const portionSizes = ["mini", "half", "full"] as const;

export type MealType = (typeof mealTypes)[number];
export type RecipeAppetiteLevel = (typeof appetiteLevels)[number];
export type RecipePortion = (typeof portionSizes)[number];

export type RecipeGlp1Profile = {
  shotDayFriendly: boolean;
  nauseaFriendly: boolean;
  refluxFriendly: boolean;
  constipationSupport: "none" | "low" | "medium" | "high";
  appetiteLevel: RecipeAppetiteLevel[];
  portionFlex: RecipePortion[];
  heaviness: 1 | 2 | 3 | 4 | 5;
  texture: string[];
  avoidWhen: string[];
};

export type Recipe = {
  id: string;
  name: string;
  meal: MealType;
  time: number;
  servings: number;
  protein: number;
  fiber: number;
  calories: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
  notes?: string;
  glp1: RecipeGlp1Profile;
  allergens: string[];
  freezesWell: boolean;
  leftoverDays: number;
  canBlendOrSip: boolean;
  recommendedPortion: RecipePortion;
};

export type RecipeSeed = Omit<
  Recipe,
  "glp1" | "allergens" | "freezesWell" | "leftoverDays" | "canBlendOrSip" | "recommendedPortion"
>;

export type DayPlan = Record<MealType, string | null>;

export type WeekPlan = Record<string, DayPlan>;

export type GroceryState = Record<string, boolean>;

export type DailyTargets = {
  protein: number;
  fiber: number;
  calories: number;
};

export type NutritionStats = {
  protein: number;
  fiber: number;
  calories: number;
};

export type WeeklyStats = Record<string, NutritionStats>;

export type GroceryListItem = {
  text: string;
  count: number;
};

export type PlannerTab = "recipes" | "planner" | "grocery" | "tracker";

export type AssignSlot = {
  day: string;
  meal: MealType;
};
