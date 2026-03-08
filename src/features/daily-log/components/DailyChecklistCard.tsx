import type { CSSProperties } from "react";
import { palette, sans } from "../../meal-planner/constants";

const DEFAULT_SUPPLEMENTS = [
  "Protein supplement",
  "Multivitamin",
  "Vitamin D",
  "Calcium",
  "Magnesium",
];

const DEFAULT_MOVEMENT = [
  "10-minute walk",
  "Mobility",
  "Strength session",
];

export function DailyChecklistCard({
  supplements,
  movement,
  supplementTargetCount,
  movementSummary,
  onToggleSupplement,
  onToggleMovement,
}: {
  supplements: string[];
  movement: string[];
  supplementTargetCount: number;
  movementSummary: string;
  onToggleSupplement: (name: string) => void;
  onToggleMovement: (name: string) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={infoBoxStyle}>
        <div style={{ fontSize: 13, color: palette.text }}>
          Use this checklist for the common “don’t forget the basics” layer: protein support, likely deficiency coverage, and light movement to protect tolerance and lean mass.
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: palette.textMuted }}>
          {supplements.length}/{supplementTargetCount} supplement supports logged today. {movementSummary}
        </div>
      </div>

      <div>
        <div style={sectionLabelStyle}>Supplements</div>
        <div style={pillWrapStyle}>
          {DEFAULT_SUPPLEMENTS.map((item) => {
            const active = supplements.includes(item);
            return (
              <button key={item} onClick={() => onToggleSupplement(item)} style={pillButtonStyle(active)}>
                {active ? "✓ " : ""}{item}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={sectionLabelStyle}>Movement</div>
        <div style={pillWrapStyle}>
          {DEFAULT_MOVEMENT.map((item) => {
            const active = movement.includes(item);
            return (
              <button key={item} onClick={() => onToggleMovement(item)} style={pillButtonStyle(active)}>
                {active ? "✓ " : ""}{item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const infoBoxStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#f7faf7",
  border: `1px solid ${palette.border}`,
  fontFamily: sans,
};

const sectionLabelStyle: CSSProperties = {
  fontFamily: sans,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: palette.textMuted,
  marginBottom: 8,
};

const pillWrapStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

function pillButtonStyle(active: boolean): CSSProperties {
  return {
    border: `1px solid ${active ? palette.accent : palette.border}`,
    background: active ? palette.accentSoft : "#fff",
    color: active ? palette.accent : palette.text,
    borderRadius: 999,
    padding: "9px 12px",
    fontFamily: sans,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}
