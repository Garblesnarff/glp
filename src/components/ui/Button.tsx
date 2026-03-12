import type { CSSProperties, ButtonHTMLAttributes } from "react";
import { palette, sans, radii, transitions } from "../../lib/design-tokens";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: radii.pill,
  fontFamily: sans,
  fontWeight: 700,
  fontSize: 14,
  padding: "12px 20px",
  cursor: "pointer",
  transition: `all ${transitions.fast}`,
  border: "none",
};

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: palette.accent,
    color: "#fff",
  },
  secondary: {
    background: "#fff",
    color: palette.text,
    border: `1px solid ${palette.border}`,
  },
  ghost: {
    background: "transparent",
    color: palette.textMuted,
  },
  danger: {
    background: palette.danger,
    color: "#fff",
  },
};

export function Button({ variant = "primary", style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{ ...baseStyle, ...variants[variant], ...style }}
    />
  );
}
