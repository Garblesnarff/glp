import type { CSSProperties } from "react";
import { palette, sans } from "../../meal-planner/constants";
import type { Recipe } from "../../meal-planner/types";

export function ConstipationSupportCard({
  daysSinceBowelMovement,
  escalationActive,
  movementDone,
  bowelMovementToday,
  recipeSuggestions,
  prompts,
  onToggleBowelMovement,
  onToggleMovement,
}: {
  daysSinceBowelMovement: number | null;
  escalationActive: boolean;
  movementDone: boolean;
  bowelMovementToday: boolean;
  recipeSuggestions: Recipe[];
  prompts: string[];
  onToggleBowelMovement: (value: boolean) => void;
  onToggleMovement: (value: boolean) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={escalationActive ? escalationBoxStyle : infoBoxStyle}>
        {daysSinceBowelMovement === null
          ? "No bowel movement has been logged recently. Start tracking here so the app can spot when constipation support needs to escalate."
          : daysSinceBowelMovement === 0
            ? "A bowel movement is logged for today. Keep fluids and gentle movement going to stay ahead of constipation."
            : `Last bowel movement was ${daysSinceBowelMovement} day${daysSinceBowelMovement === 1 ? "" : "s"} ago.`}
        {escalationActive ? " Constipation has been persisting. Consider escalating support and contacting your clinician if it continues." : ""}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => onToggleBowelMovement(!bowelMovementToday)} style={pillButtonStyle(bowelMovementToday)}>
          {bowelMovementToday ? "Bowel movement logged" : "Log bowel movement today"}
        </button>
        <button onClick={() => onToggleMovement(!movementDone)} style={pillButtonStyle(movementDone)}>
          {movementDone ? "Short walk done" : "Log 10-min walk"}
        </button>
      </div>

      <ul style={{ margin: 0, paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
        {prompts.map((prompt) => (
          <li key={prompt}>{prompt}</li>
        ))}
      </ul>

      <div>
        <div style={{ fontFamily: sans, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, color: palette.textMuted, marginBottom: 8 }}>
          Gentler fiber ideas
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {recipeSuggestions.map((recipe) => (
            <div key={recipe.id} style={recipeRowStyle}>
              <div>
                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>{recipe.name}</div>
                <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 3 }}>
                  {recipe.fiber}g fiber · {recipe.protein}g protein
                </div>
              </div>
              <span style={fiberBadgeStyle(recipe.glp1.constipationSupport)}>{recipe.glp1.constipationSupport} support</span>
            </div>
          ))}
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
  fontSize: 13,
  color: palette.text,
};

const escalationBoxStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#fff4f5",
  border: "1px solid #f4c2c7",
  fontFamily: sans,
  fontSize: 13,
  color: palette.danger,
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

const recipeRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "10px 12px",
};

function fiberBadgeStyle(level: "none" | "low" | "medium" | "high"): CSSProperties {
  const background = level === "high" ? "#eef5ff" : level === "medium" ? "#f4fbf6" : "#fffaf1";
  const border = level === "high" ? "#c6daf8" : level === "medium" ? palette.accentLight : "#f1dfb8";
  const color = level === "high" ? "#244a7c" : level === "medium" ? palette.accent : palette.text;

  return {
    borderRadius: 999,
    padding: "6px 10px",
    background,
    border: `1px solid ${border}`,
    color,
    fontFamily: sans,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  };
}
