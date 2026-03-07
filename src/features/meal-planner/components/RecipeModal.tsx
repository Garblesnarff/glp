import { font, palette, sans } from "../constants";
import type { Recipe } from "../types";
import { formatDuration } from "../utils";

export function RecipeModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          background: palette.bg,
          borderRadius: 16,
          padding: 28,
          maxWidth: 560,
          width: "100%",
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h2 style={{ fontFamily: font, fontSize: 22, margin: 0, color: palette.text, lineHeight: 1.3 }}>{recipe.name}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: palette.textMuted, padding: 4 }}
          >
            ×
          </button>
        </div>
        <div style={{ display: "flex", gap: 16, margin: "12px 0", fontFamily: sans, fontSize: 13, flexWrap: "wrap" }}>
          <span style={{ background: palette.accentSoft, color: palette.accent, padding: "4px 12px", borderRadius: 10, fontWeight: 600 }}>
            {recipe.protein}g protein
          </span>
          <span style={{ background: "#fde8e0", color: palette.warm, padding: "4px 12px", borderRadius: 10, fontWeight: 600 }}>
            {recipe.fiber}g fiber
          </span>
          <span style={{ color: palette.textMuted }}>
            {recipe.calories} cal · {formatDuration(recipe.time)}
          </span>
        </div>

        {recipe.notes ? (
          <div
            style={{
              background: `${palette.warmLight}40`,
              border: `1px solid ${palette.warmLight}`,
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              fontFamily: sans,
              fontSize: 13,
              color: palette.text,
            }}
          >
            {"💡 "}
            {recipe.notes}
          </div>
        ) : null}

        <h3 style={{ fontFamily: font, fontSize: 16, color: palette.accent, margin: "16px 0 8px" }}>Ingredients</h3>
        <ul style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, paddingLeft: 20, color: palette.text }}>
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient}>{ingredient}</li>
          ))}
        </ul>

        <h3 style={{ fontFamily: font, fontSize: 16, color: palette.accent, margin: "16px 0 8px" }}>Steps</h3>
        <ol style={{ fontFamily: sans, fontSize: 13, lineHeight: 1.8, paddingLeft: 20, color: palette.text }}>
          {recipe.steps.map((step) => (
            <li key={step} style={{ marginBottom: 6 }}>
              {step}
            </li>
          ))}
        </ol>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 16 }}>
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: palette.accentSoft,
                color: palette.accent,
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 10,
                fontFamily: sans,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
