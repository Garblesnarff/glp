import { palette, sans } from "../constants";

export function MacroBar({
  value,
  target,
  color,
  label,
}: {
  value: number;
  target: number;
  color: string;
  label: string;
}) {
  const pct = Math.min((value / target) * 100, 100);
  const over = value > target;

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          fontFamily: sans,
          color: palette.textMuted,
        }}
      >
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: over ? palette.danger : palette.text }}>
          {value}/{target}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: palette.border, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 3,
            background: color,
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  );
}
