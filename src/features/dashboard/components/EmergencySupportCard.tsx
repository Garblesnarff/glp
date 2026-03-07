import { Link } from "react-router-dom";
import { palette, sans } from "../../meal-planner/constants";
import type { Recipe } from "../../meal-planner/types";

export function EmergencySupportCard({
  hydrationProgress,
  redFlagActive,
  foods,
}: {
  hydrationProgress: string;
  redFlagActive: boolean;
  foods: Recipe[];
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>
        Rough day support: hydrate first, choose the gentlest foods available, and watch for red-flag symptoms.
      </div>
      <div style={{ fontFamily: sans, fontSize: 13, color: palette.text }}>
        <strong>Hydration:</strong> {hydrationProgress}
      </div>
      <div>
        <div style={{ fontFamily: sans, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, color: palette.textMuted, marginBottom: 6 }}>
          Gentle foods
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {foods.map((food) => (
            <div key={food.id} style={{ borderRadius: 12, padding: "10px 12px", background: "#fff", border: `1px solid ${palette.border}` }}>
              <div style={{ fontFamily: sans, fontWeight: 700 }}>{food.name}</div>
              <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted }}>
                {food.protein}g protein · {food.calories} cal
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          borderRadius: 14,
          padding: "12px 14px",
          background: redFlagActive ? "#fff4f5" : "#fffaf1",
          border: `1px solid ${redFlagActive ? "#f4c2c7" : "#f1dfb8"}`,
          fontFamily: sans,
          fontSize: 13,
          color: redFlagActive ? palette.danger : palette.text,
        }}
      >
        {redFlagActive
          ? "Severe stomach pain is logged today. Use the red-flag guidance and consider contacting your doctor."
          : "Red flags include severe abdominal pain, pain radiating to the back, nonstop vomiting, or dehydration signs."}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/red-flags" style={{ color: palette.danger, fontFamily: sans, fontWeight: 700, textDecoration: "none" }}>
          Open red-flag guidance →
        </Link>
        <Link to="/today" style={{ color: palette.accent, fontFamily: sans, fontWeight: 700, textDecoration: "none" }}>
          Open daily log →
        </Link>
      </div>
    </div>
  );
}
