import { MEAL_TYPES } from "../data/recipes";
import { font, palette, sans } from "../constants";
import type { AssignSlot, MealType, Recipe, WeekPlan, WeeklyStats } from "../types";

export function PlannerTab({
  weekPlan,
  weeklyStats,
  recipeMap,
  assignSlot,
  onCancelAssign,
  onSelectRecipe,
  onClearSlot,
  onStartAssigning,
  onClearWeek,
}: {
  weekPlan: WeekPlan;
  weeklyStats: WeeklyStats;
  recipeMap: Map<string, Recipe>;
  assignSlot: AssignSlot | null;
  onCancelAssign: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onClearSlot: (day: string, meal: MealType) => void;
  onStartAssigning: (day: string, meal: MealType) => void;
  onClearWeek: () => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: font, fontSize: 20, margin: 0 }}>Weekly Plan</h2>
        <button
          onClick={onClearWeek}
          style={{
            background: "none",
            border: `1px solid ${palette.danger}`,
            color: palette.danger,
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 11,
            fontFamily: sans,
            cursor: "pointer",
          }}
        >
          Clear Week
        </button>
      </div>

      {assignSlot ? (
        <div
          style={{
            background: `${palette.warmLight}50`,
            border: `1px solid ${palette.warmLight}`,
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12,
            fontFamily: sans,
            fontSize: 13,
          }}
        >
          {"🔍 Picking "}
          <strong>{assignSlot.meal}</strong>
          {" for "}
          <strong>{assignSlot.day}</strong>
          {" — go to Recipes tab or pick below"}
          <button
            onClick={onCancelAssign}
            style={{
              marginLeft: 12,
              background: "none",
              border: "none",
              color: palette.danger,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
        </div>
      ) : null}

      {Object.entries(weekPlan).map(([day, meals]) => (
        <div
          key={day}
          style={{
            background: palette.card,
            borderRadius: 12,
            padding: 14,
            marginBottom: 10,
            border: `1px solid ${palette.border}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 style={{ fontFamily: font, fontSize: 16, margin: 0 }}>{day}</h3>
            <div style={{ fontSize: 11, fontFamily: sans, color: palette.textMuted }}>
              <span style={{ color: palette.accent, fontWeight: 600 }}>{weeklyStats[day]?.protein ?? 0}g P</span>
              {" · "}
              <span style={{ color: palette.warm, fontWeight: 600 }}>{weeklyStats[day]?.fiber ?? 0}g F</span>
              {" · "}
              {weeklyStats[day]?.calories ?? 0} cal
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            {MEAL_TYPES.map((meal) => {
              const recipeId = meals[meal];
              const recipe = recipeId ? recipeMap.get(recipeId) ?? null : null;

              return (
                <div
                  key={`${day}-${meal}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: recipe ? `${palette.accentSoft}60` : palette.bg,
                    border: `1px dashed ${recipe ? "transparent" : palette.border}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: sans,
                      textTransform: "uppercase",
                      color: palette.textMuted,
                      width: 60,
                      flexShrink: 0,
                      fontWeight: 600,
                    }}
                  >
                    {meal}
                  </span>
                  {recipe ? (
                    <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: sans, fontSize: 13, cursor: "pointer" }} onClick={() => onSelectRecipe(recipe)}>
                        {recipe.name}
                      </span>
                      <button
                        onClick={() => onClearSlot(day, meal)}
                        style={{
                          background: "none",
                          border: "none",
                          color: palette.danger,
                          cursor: "pointer",
                          fontSize: 14,
                          padding: 4,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onStartAssigning(day, meal)}
                      style={{
                        background: "none",
                        border: "none",
                        color: palette.accent,
                        cursor: "pointer",
                        fontFamily: sans,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      + Choose recipe
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
