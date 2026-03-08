export type AccountRole = "primary" | "prep_partner";
export type ReminderDeliveryWindow = "morning" | "afternoon" | "evening";

export type ReminderPreferences = {
  enabled: boolean;
  deliveryWindow: ReminderDeliveryWindow;
  quietHoursStart: string;
  quietHoursEnd: string;
  shotPrep: boolean;
  refill: boolean;
  hydration: boolean;
  constipation: boolean;
  doseIncrease: boolean;
  rotation: boolean;
  proteinSupport: boolean;
  movement: boolean;
};

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
export type PartnerInviteStatus = "pending" | "accepted" | "revoked";
export type SupportAlertStatus = "active" | "resolved";
export type AccountMembership = {
  accountId: string;
  role: AccountRole;
};

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
  medicationSupplyDays: number;
  refillLeadDays: number;
  lastRefillDate?: string;
  prepPartnerEmail?: string;
  reminderPreferences: ReminderPreferences;
};

export type MedicationLog = {
  id: string;
  medication: string;
  dose: string;
  shotDay: string;
  injectionSite: string;
  date: string;
  status?: "completed" | "delayed" | "missed";
  isDoseIncrease?: boolean;
  notes?: string;
};

export type WeightLog = {
  id: string;
  date: string;
  weight: number;
  waistInches?: number;
  clothesFit?: "looser" | "same" | "tighter";
  note?: string;
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

export type PartnerInvite = {
  id: string;
  accountId?: string;
  invitedEmail: string;
  role: "prep_partner";
  status: PartnerInviteStatus;
  createdAt: string;
};

export type SupportAlert = {
  id: string;
  accountId?: string;
  createdByUserId?: string;
  kind: "rough_day";
  status: SupportAlertStatus;
  note?: string;
  createdAt: string;
  resolvedAt?: string;
};

export type NotificationJobStatus = "scheduled" | "sent" | "cancelled";
export type NotificationDeliveryStatus = "new" | "acknowledged";

export type NotificationJob = {
  id: string;
  sourceReminderId: string;
  title: string;
  body: string;
  linkTo?: string;
  sendAt: string;
  channel: "in_app";
  status: NotificationJobStatus;
};

export type NotificationDelivery = {
  id: string;
  sourceJobId: string;
  sourceReminderId: string;
  title: string;
  body: string;
  linkTo?: string;
  deliveredAt: string;
  channel: "in_app";
  status: NotificationDeliveryStatus;
};
