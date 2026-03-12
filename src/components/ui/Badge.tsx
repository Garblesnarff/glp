import type { CSSProperties, ReactNode } from "react";
import { palette, sans, radii } from "../../lib/design-tokens";

type BadgeTone = "default" | "success" | "warning" | "danger" | "accent";

const tones: Record<BadgeTone, CSSProperties> = {
  default: {
    background: "#fff",
    border: `1px solid ${palette.border}`,
    color: palette.text,
  },
  success: {
    background: palette.accentSoft,
    border: `1px solid ${palette.accentLight}`,
    color: palette.accent,
  },
  warning: {
    background: "#fffaf1",
    border: "1px solid #f1dfb8",
    color: palette.text,
  },
  danger: {
    background: "#fff4f5",
    border: "1px solid #f4c2c7",
    color: palette.danger,
  },
  accent: {
    background: palette.accentSoft,
    border: `1px solid ${palette.accentLight}`,
    color: palette.accent,
  },
};

export function Badge({
  tone = "default",
  children,
  style,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: radii.pill,
        padding: "6px 10px",
        fontFamily: sans,
        fontSize: 12,
        fontWeight: 700,
        ...tones[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
