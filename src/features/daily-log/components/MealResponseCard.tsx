import type { CSSProperties } from "react";
import type { DailyLogMealEntry, MealTolerance, PortionSize } from "../../../domain/types";
import { palette, sans } from "../../meal-planner/constants";
import { RECIPES } from "../../meal-planner/data/recipes";
import type { Recipe } from "../../meal-planner/types";

const portions: PortionSize[] = ["mini", "half", "full"];
const tolerances: MealTolerance[] = ["easy", "okay", "rough"];

export function MealResponseCard({
  entries,
  recommendations,
  onAddRecipe,
  onUpdateEntry,
  onRemoveEntry,
}: {
  entries: DailyLogMealEntry[];
  recommendations: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onUpdateEntry: (entry: DailyLogMealEntry) => void;
  onRemoveEntry: (entry: DailyLogMealEntry) => void;
}) {
  const loggedKeys = new Set(entries.map((entry) => `${entry.recipeId}:${entry.mealType}`));
  const quickAddOptions = recommendations.filter((recipe) => !loggedKeys.has(`${recipe.id}:${recipe.meal}`)).slice(0, 4);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <div style={sectionLabelStyle}>Quick add from today&apos;s recommendations</div>
        {quickAddOptions.length === 0 ? (
          <div style={emptyTextStyle}>You have already logged the current suggested meals. Add more from the planner next.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {quickAddOptions.map((recipe) => (
              <div key={recipe.id} style={quickAddRowStyle}>
                <div>
                  <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>{recipe.name}</div>
                  <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 3 }}>
                    {capitalize(recipe.meal)} · default {recipe.recommendedPortion} portion
                  </div>
                </div>
                <button onClick={() => onAddRecipe(recipe)} style={primaryButtonStyle}>
                  Log meal
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={sectionLabelStyle}>How did meals go?</div>
        {entries.length === 0 ? (
          <div style={emptyTextStyle}>No meals logged yet. Start with a quick-add option above to capture tolerance.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {entries.map((entry) => {
              const recipe = RECIPES.find((candidate) => candidate.id === entry.recipeId);
              const title = recipe?.name ?? entry.recipeId;

              return (
                <div key={`${entry.recipeId}:${entry.mealType}`} style={entryCardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 700, color: palette.text }}>{title}</div>
                      <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
                        {capitalize(entry.mealType)} · {entry.actualProtein}g protein · {entry.actualFiber}g fiber · {entry.actualCalories} cal
                      </div>
                    </div>
                    <button onClick={() => onRemoveEntry(entry)} style={removeButtonStyle}>
                      Remove
                    </button>
                  </div>

                  <div style={controlGroupStyle}>
                    <div style={controlLabelStyle}>Portion</div>
                    <div style={pillRowStyle}>
                      {portions.map((portion) => (
                        <button
                          key={portion}
                          onClick={() => onUpdateEntry(buildUpdatedEntry(entry, recipe, portion))}
                          style={pillButtonStyle(entry.portion === portion)}
                        >
                          {capitalize(portion)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={controlGroupStyle}>
                    <div style={controlLabelStyle}>Tolerance</div>
                    <div style={pillRowStyle}>
                      {tolerances.map((tolerance) => (
                        <button
                          key={tolerance}
                          onClick={() => onUpdateEntry({ ...entry, tolerance })}
                          style={pillButtonStyle(entry.tolerance === tolerance)}
                        >
                          {capitalize(tolerance)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={controlGroupStyle}>
                    <div style={controlLabelStyle}>Would eat again?</div>
                    <div style={pillRowStyle}>
                      <button onClick={() => onUpdateEntry({ ...entry, wouldRepeat: true })} style={pillButtonStyle(entry.wouldRepeat === true)}>
                        Yes
                      </button>
                      <button onClick={() => onUpdateEntry({ ...entry, wouldRepeat: false })} style={pillButtonStyle(entry.wouldRepeat === false)}>
                        No
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function buildUpdatedEntry(entry: DailyLogMealEntry, recipe: Recipe | undefined, portion: PortionSize): DailyLogMealEntry {
  if (!recipe) {
    return { ...entry, portion };
  }

  const multiplier = getPortionMultiplier(portion);

  return {
    ...entry,
    portion,
    actualProtein: Math.round(recipe.protein * multiplier),
    actualFiber: Math.round(recipe.fiber * multiplier),
    actualCalories: Math.round(recipe.calories * multiplier),
  };
}

function getPortionMultiplier(portion: PortionSize) {
  if (portion === "mini") {
    return 0.5;
  }
  if (portion === "half") {
    return 0.75;
  }
  return 1;
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

const sectionLabelStyle: CSSProperties = {
  fontFamily: sans,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.4,
  color: palette.accent,
  marginBottom: 10,
};

const emptyTextStyle: CSSProperties = {
  fontFamily: sans,
  fontSize: 13,
  color: palette.textMuted,
  lineHeight: 1.6,
};

const quickAddRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 12px",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: "#fff",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "9px 14px",
  background: palette.accent,
  color: "#fff",
  fontFamily: sans,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const removeButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: palette.danger,
  fontFamily: sans,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const entryCardStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  borderRadius: 14,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "14px 16px",
};

const controlGroupStyle: CSSProperties = {
  display: "grid",
  gap: 6,
};

const controlLabelStyle: CSSProperties = {
  fontFamily: sans,
  fontSize: 12,
  fontWeight: 700,
  color: palette.text,
};

const pillRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

function pillButtonStyle(active: boolean): CSSProperties {
  return {
    border: `1px solid ${active ? palette.accent : palette.border}`,
    background: active ? palette.accentSoft : "#fff",
    color: active ? palette.accent : palette.textMuted,
    borderRadius: 999,
    padding: "7px 11px",
    fontFamily: sans,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}
