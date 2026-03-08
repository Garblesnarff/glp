import type { CSSProperties } from "react";
import { palette, sans } from "../../meal-planner/constants";

export type TrendPoint = {
  label: string;
  value: number;
  note?: string;
};

export function LineTrendChart({
  title,
  points,
  color = palette.accent,
  valueSuffix = "",
}: {
  title: string;
  points: TrendPoint[];
  color?: string;
  valueSuffix?: string;
}) {
  if (points.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted }}>{title}</div>
        <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted, marginTop: 8 }}>Not enough data yet.</div>
      </div>
    );
  }

  const width = 320;
  const height = 120;
  const padding = 18;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const range = max - min || 1;

  const mapped = points.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, points.length - 1);
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });

  const path = mapped.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div style={cardStyle}>
      <div style={{ fontFamily: sans, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, color: palette.textMuted }}>{title}</div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: 140, marginTop: 10 }}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={palette.border} strokeWidth="1" />
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {mapped.map((point) => (
          <g key={`${title}:${point.label}`}>
            <circle cx={point.x} cy={point.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
          </g>
        ))}
      </svg>
      <div style={pointGridStyle}>
        {mapped.map((point) => (
          <div key={`${title}:${point.label}:legend`} style={pointItemStyle}>
            <div style={{ fontFamily: sans, fontSize: 11, color: palette.textMuted }}>{point.label}</div>
            <div style={{ fontFamily: sans, fontWeight: 700, color: palette.text }}>{point.value}{valueSuffix}</div>
            {point.note ? <div style={{ fontFamily: sans, fontSize: 11, color: palette.textMuted }}>{point.note}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "12px 14px",
};

const emptyStateStyle: CSSProperties = {
  borderRadius: 14,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "12px 14px",
};

const pointGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(64px, 1fr))",
  gap: 8,
};

const pointItemStyle: CSSProperties = {
  minWidth: 0,
};
