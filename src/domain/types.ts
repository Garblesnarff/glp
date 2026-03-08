export type AccountRole = "primary" | "prep_partner";

export type SymptomType =
  | "nausea"
  | "fullness"
  | "constipation"
  | "diarrhea"
  | "reflux"
  | "stomachPain"
  | "fatigue"
  | "injectionSite";

export type Severity = "none" | "mild" | "moderate" | "severe";

export type AppetiteLevel = "none" | "low" | "normal";

export type FoodMood = "excited" | "neutral" | "anxious" | "sad" | "overwhelmed";

export type PortionSize = "mini" | "half" | "full";
export type MealTolerance = "easy" | "okay" | "rough";

export type UserProfile = {
  name: string;
  role: AccountRole;
  currentWeight: number;
  goalWeight?: number;
  proteinTarget: {
    min: number;
    max: number;
  };
  fiberTarget: number;
  hydrationGoal: number;
  dietaryRestrictions: string[];
  medicationName: string;
  medicationStartDate: string;
  shotDay: string;
  prepPartnerEmail?: string;
};

export type MedicationLog = {
  id: string;
  medication: string;
  dose: string;
  shotDay: string;
  injectionSite: string;
  date: string;
  notes?: string;
};

export type DailyLogMealEntry = {
  recipeId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  portion: PortionSize;
  actualProtein: number;
  actualFiber: number;
  actualCalories: number;
  tolerance?: MealTolerance;
  wouldRepeat?: boolean;
  notes?: string;
};

export type DailyLog = {
  date: string;
  symptoms: Record<SymptomType, Severity>;
  appetiteLevel: AppetiteLevel;
  hydrationOz: number;
  foodNoiseLevel: number;
  foodMood: FoodMood;
  mealsConsumed: DailyLogMealEntry[];
  supplements: string[];
  movement: string[];
  bowelMovement?: boolean;
  notes?: string;
};
