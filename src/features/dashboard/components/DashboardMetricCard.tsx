import type { CSSProperties } from "react";
import { font, palette, sans } from "../../meal-planner/constants";

export function DashboardMetricCard({
  title,
  value,
  detail,
  progress,
}: {
  title: string;
  value: string;
  detail: string;
  progress?: number;
}) {
  return (
    <div style={cardStyle}>
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: palette.textMuted }}>{title}</div>
      <div style={{ fontFamily: font, fontSize: 30, margin: "8px 0 6px" }}>{value}</div>
      <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>{detail}</div>
      {typeof progress === "number" ? (
        <div style={{ marginTop: 14, height: 8, borderRadius: 999, background: palette.border, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: palette.accent, borderRadius: 999 }} />
        </div>
      ) : null}
    </div>
  );
}

const cardStyle: CSSProperties = {
  background: "#ffffffdb",
  border: `1px solid ${palette.border}`,
  borderRadius: 18,
  padding: 18,
};
