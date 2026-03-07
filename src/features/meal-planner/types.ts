export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;

export type MealType = (typeof mealTypes)[number];

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
};

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
