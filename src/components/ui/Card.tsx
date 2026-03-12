import type { CSSProperties, ReactNode } from "react";
import { palette, radii, shadows, transitions } from "../../lib/design-tokens";

type CardVariant = "elevated" | "flat" | "glass";

const variants: Record<CardVariant, CSSProperties> = {
  elevated: {
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    boxShadow: shadows.sm,
  },
  flat: {
    background: "#fff",
    border: `1px solid ${palette.border}`,
  },
  glass: {
    background: "#ffffffd9",
    backdropFilter: "blur(16px)",
    border: `1px solid ${palette.border}`,
    boxShadow: shadows.md,
  },
};

export function Card({
  variant = "elevated",
  padding = 20,
  children,
  style,
  className,
}: {
  variant?: CardVariant;
  padding?: number;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        borderRadius: radii.lg,
        padding,
        transition: `transform ${transitions.fast}, box-shadow ${transitions.fast}`,
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </div>
  );
}
