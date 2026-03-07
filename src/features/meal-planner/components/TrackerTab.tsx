import { DAILY_TARGETS } from "../data/recipes";
import { font, palette, sans } from "../constants";
import type { WeeklyStats } from "../types";
import { MacroBar } from "./MacroBar";

export function TrackerTab({ weeklyStats }: { weeklyStats: WeeklyStats }) {
  return (
    <div>
      <h2 style={{ fontFamily: font, fontSize: 20, margin: "0 0 16px" }}>Weekly Nutrition Tracker</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {Object.entries(weeklyStats).map(([day, stats]) => {
          const hasMeals = stats.protein > 0 || stats.fiber > 0;

          return (
            <div
              key={day}
              style={{
                background: palette.card,
                borderRadius: 12,
                padding: 14,
                border: `1px solid ${palette.border}`,
                opacity: hasMeals ? 1 : 0.5,
              }}
            >
              <h3 style={{ fontFamily: font, fontSize: 15, margin: "0 0 10px" }}>{day}</h3>
              <MacroBar value={stats.protein} target={DAILY_TARGETS.protein} color={palette.accent} label="Protein (g)" />
              <MacroBar value={stats.fiber} target={DAILY_TARGETS.fiber} color={palette.warm} label="Fiber (g)" />
              <MacroBar value={stats.calories} target={DAILY_TARGETS.calories} color={palette.warmLight} label="Calories" />
              {!hasMeals ? <div style={{ fontSize: 11, color: palette.textMuted, marginTop: 4, fontFamily: sans }}>No meals planned</div> : null}
            </div>
          );
        })}
      </div>

      {(() => {
        const days = Object.values(weeklyStats).filter((stats) => stats.protein > 0);
        if (days.length === 0) {
          return null;
        }

        const average = {
          protein: Math.round(days.reduce((sum, stats) => sum + stats.protein, 0) / days.length),
          fiber: Math.round(days.reduce((sum, stats) => sum + stats.fiber, 0) / days.length),
          calories: Math.round(days.reduce((sum, stats) => sum + stats.calories, 0) / days.length),
        };

        return (
          <div
            style={{
              marginTop: 16,
              background: palette.accentSoft,
              borderRadius: 12,
              padding: 16,
              border: `1px solid ${palette.accentLight}`,
            }}
          >
            <h3 style={{ fontFamily: font, fontSize: 15, margin: "0 0 10px", color: palette.accent }}>
              Weekly Average ({days.length} day{days.length > 1 ? "s" : ""} planned)
            </h3>
            <MacroBar value={average.protein} target={DAILY_TARGETS.protein} color={palette.accent} label="Avg Protein" />
            <MacroBar value={average.fiber} target={DAILY_TARGETS.fiber} color={palette.warm} label="Avg Fiber" />
            <MacroBar value={average.calories} target={DAILY_TARGETS.calories} color={palette.warmLight} label="Avg Calories" />
          </div>
        );
      })()}
    </div>
  );
}
