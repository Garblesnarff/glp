export const font = '"Newsreader", serif';
export const sans = '"DM Sans", sans-serif';

export const palette = {
  bg: "#faf7f2",
  card: "#ffffff",
  accent: "#2d6a4f",
  accentDark: "#1b4332",
  accentLight: "#b7e4c7",
  accentSoft: "#d8f3dc",
  warm: "#e07a5f",
  warmDark: "#c4563c",
  warmLight: "#f2cc8f",
  text: "#1b1b1b",
  textMuted: "#6b705c",
  border: "#e8e4dd",
  danger: "#c1121f",
  surface: "#ffffffdb",
  overlay: "rgba(0, 0, 0, 0.4)",
  gradientHero:
    "radial-gradient(circle at top, rgba(183, 228, 199, 0.3), transparent 35%), linear-gradient(180deg, #f8f4ed 0%, #faf7f2 45%, #f3efe7 100%)",
};

export const typography = {
  display: { size: 56, weight: 400, lineHeight: 1.02, family: font },
  h1: { size: 42, weight: 400, lineHeight: 1.05, family: font },
  h2: { size: 30, weight: 400, lineHeight: 1.1, family: font },
  h3: { size: 22, weight: 600, lineHeight: 1.2, family: font },
  body: { size: 15, weight: 400, lineHeight: 1.6, family: sans },
  caption: { size: 13, weight: 400, lineHeight: 1.5, family: sans },
  label: { size: 11, weight: 600, lineHeight: 1.2, family: sans, letterSpacing: 2, textTransform: "uppercase" as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 64,
  "5xl": 80,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const shadows = {
  sm: "0 2px 8px rgba(0, 0, 0, 0.06)",
  md: "0 8px 24px rgba(0, 0, 0, 0.08)",
  lg: "0 30px 60px rgba(0, 0, 0, 0.1)",
  glow: "0 0 24px rgba(45, 106, 79, 0.15)",
} as const;

export const transitions = {
  fast: "0.15s ease",
  normal: "0.25s ease",
  slow: "0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  spring: "0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const STORAGE_KEYS = {
  weekPlan: "glp1-meal-plan",
  groceryChecked: "glp1-grocery-checked",
};
