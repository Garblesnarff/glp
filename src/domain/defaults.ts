import type { DailyLog, ReminderPreferences, SymptomType, UserProfile } from "./types";

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

export const defaultReminderPreferences: ReminderPreferences = {
  enabled: true,
  deliveryWindow: "morning",
  quietHoursStart: "21:00",
  quietHoursEnd: "07:00",
  shotPrep: true,
  refill: true,
  hydration: true,
  constipation: true,
  doseIncrease: true,
  rotation: true,
  proteinSupport: true,
  movement: true,
};

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
  medicationSupplyDays: 28,
  refillLeadDays: 5,
  lastRefillDate: "",
  prepPartnerEmail: "",
  reminderPreferences: defaultReminderPreferences,
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
