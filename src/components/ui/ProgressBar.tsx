import type { CSSProperties } from "react";
import { palette, radii, transitions } from "../../lib/design-tokens";

export function ProgressBar({
  value,
  color,
  height = 8,
  style,
}: {
  value: number;
  color?: string;
  height?: number;
  style?: CSSProperties;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div
      style={{
        height,
        borderRadius: radii.pill,
        background: palette.border,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          background: color ?? palette.accent,
          borderRadius: radii.pill,
          transition: `width ${transitions.slow}`,
        }}
      />
    </div>
  );
}
