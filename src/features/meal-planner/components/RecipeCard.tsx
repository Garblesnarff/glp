import { font, palette, sans } from "../constants";
import type { Recipe } from "../types";
import { formatDuration } from "../utils";

export function RecipeCard({
  recipe,
  onClick,
  compact = false,
  onAssign,
  contextBadges = [],
}: {
  recipe: Recipe;
  onClick: () => void;
  compact?: boolean;
  onAssign?: (recipeId: string) => void;
  contextBadges?: string[];
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: palette.card,
        borderRadius: 12,
        padding: compact ? 12 : 16,
        border: `1px solid ${palette.border}`,
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = palette.accent;
        event.currentTarget.style.boxShadow = "0 4px 12px rgba(45,106,79,0.1)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = palette.border;
        event.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: compact ? 13 : 15,
              fontFamily: font,
              fontWeight: 600,
              color: palette.text,
              lineHeight: 1.3,
            }}
          >
            {recipe.name}
          </div>
          <div style={{ fontSize: 11, color: palette.textMuted, fontFamily: sans, marginTop: 4 }}>
            {formatDuration(recipe.time)} · Makes {recipe.servings} serving{recipe.servings > 1 ? "s" : ""}
          </div>
          <div style={{ fontSize: 11, color: palette.textMuted, fontFamily: sans, marginTop: 2 }}>
            Serving: {recipe.servingSize}
          </div>
        </div>
        {onAssign ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onAssign(recipe.id);
            }}
            style={{
              background: palette.accent,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 11,
              fontFamily: sans,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + Add
          </button>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: compact ? 8 : 10, fontSize: 12, fontFamily: sans }}>
        <span style={{ color: palette.accent, fontWeight: 700 }}>{recipe.protein}g protein/serving</span>
        <span style={{ color: palette.warm, fontWeight: 700 }}>{recipe.fiber}g fiber/serving</span>
        <span style={{ color: palette.textMuted }}>{recipe.calories} cal/serving</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: palette.textMuted, fontFamily: sans }}>Estimated nutrition per serving</div>
      {contextBadges.length > 0 ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {contextBadges.map((badge) => (
            <span
              key={badge}
              style={{
                background: "#f4fbf6",
                color: palette.accent,
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 999,
                fontFamily: sans,
                fontWeight: 600,
                border: `1px solid ${palette.accentLight}`,
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}
      {!compact ? (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
          {recipe.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              style={{
                background: palette.accentSoft,
                color: palette.accent,
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 10,
                fontFamily: sans,
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
