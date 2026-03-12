import type { CSSProperties, ReactNode } from "react";
import { palette, sans } from "../../lib/design-tokens";

export function SectionLabel({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 2,
        color: color ?? palette.accent,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
