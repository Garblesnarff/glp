export type FoodDiaryMealType = "breakfast" | "lunch" | "dinner" | "snack";

export type FoodDiaryEntry = {
  id: string;
  date: string;
  mealType: FoodDiaryMealType;
  foodName: string;
  calories?: number;
  proteinGrams?: number;
  notes?: string;
};
