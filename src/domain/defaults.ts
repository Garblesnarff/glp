import type { DailyLog, SymptomType, UserProfile } from "./types";

export const defaultSymptoms = Object.freeze(
  {
    nausea: "none",
    fullness: "none",
    constipation: "none",
    diarrhea: "none",
    reflux: "none",
    stomachPain: "none",
    fatigue: "none",
    injectionSite: "none",
  } satisfies Record<SymptomType, DailyLog["symptoms"][SymptomType]>,
);

export const defaultUserProfile: UserProfile = {
  name: "",
  role: "primary",
  currentWeight: 180,
  proteinTarget: {
    min: 114,
    max: 143,
  },
  fiberTarget: 25,
  hydrationGoal: 64,
  dietaryRestrictions: ["egg-free", "gluten-free", "no seafood", "no sausage"],
  medicationName: "",
  medicationStartDate: "",
  shotDay: "Monday",
  prepPartnerEmail: "",
};

export function createDefaultDailyLog(date: string): DailyLog {
  return {
    date,
    symptoms: { ...defaultSymptoms },
    appetiteLevel: "normal",
    hydrationOz: 0,
    foodNoiseLevel: 3,
    foodMood: "neutral",
    mealsConsumed: [],
    supplements: [],
    movement: [],
    bowelMovement: false,
    notes: "",
  };
}
