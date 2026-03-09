import type { CSSProperties } from "react";
import { palette, sans } from "../../features/meal-planner/constants";

export const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  border: `1px solid ${palette.border}`,
  color: palette.text,
  textDecoration: "none",
  padding: "11px 16px",
  fontFamily: sans,
  fontWeight: 600,
};

export const primaryButtonStyle: CSSProperties = {
  background: palette.accent,
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  fontFamily: sans,
  fontWeight: 700,
  cursor: "pointer",
};

export const inputStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  fontFamily: sans,
  fontSize: 14,
  background: "#fff",
};

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

export const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontFamily: sans,
  fontSize: 13,
  color: palette.text,
};

