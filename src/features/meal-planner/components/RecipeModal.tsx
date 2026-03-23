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
            {recipe.protein}g protein/serving
          </span>
          <span style={{ background: "#fde8e0", color: palette.warm, padding: "4px 12px", borderRadius: 10, fontWeight: 600 }}>
            {recipe.fiber}g fiber/serving
          </span>
          <span style={{ color: palette.textMuted }}>
            {recipe.calories} cal/serving · {formatDuration(recipe.time)}
          </span>
        </div>
        <div style={{ marginTop: -4, marginBottom: 16, fontFamily: sans, fontSize: 12, color: palette.textMuted }}>
          Makes {recipe.servings} serving{recipe.servings > 1 ? "s" : ""}. Nutrition is estimated per serving and can vary by brand or topping choices.
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

        <h3 style={{ fontFamily: font, fontSize: 16, color: palette.accent, margin: "16px 0 8px" }}>GLP-1 support</h3>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {getSupportBadges(recipe).map((badge) => (
              <span
                key={badge}
                style={{
                  background: "#f4fbf6",
                  color: palette.accent,
                  fontSize: 11,
                  padding: "4px 10px",
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
            }}
          >
            <SupportStat label="Recommended portion" value={capitalize(recipe.recommendedPortion)} />
            <SupportStat label="Texture" value={recipe.glp1.texture.map(capitalize).join(", ")} />
            <SupportStat label="Constipation support" value={capitalize(recipe.glp1.constipationSupport)} />
            <SupportStat label="Leftovers" value={`${recipe.leftoverDays} day${recipe.leftoverDays === 1 ? "" : "s"}`} />
          </div>

          {recipe.glp1.avoidWhen.length > 0 ? (
            <SupportNote label="Use caution when" value={recipe.glp1.avoidWhen.join(", ")} tone="warm" />
          ) : null}
          {recipe.allergens.length > 0 ? <SupportNote label="Contains" value={recipe.allergens.join(", ")} tone="neutral" /> : null}
        </div>

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

function SupportStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${palette.border}`,
        background: palette.card,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: palette.textMuted }}>{label}</div>
      <div style={{ fontFamily: sans, fontSize: 13, color: palette.text, fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function SupportNote({ label, value, tone }: { label: string; value: string; tone: "warm" | "neutral" }) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${tone === "warm" ? palette.warmLight : palette.border}`,
        background: tone === "warm" ? `${palette.warmLight}33` : palette.card,
        padding: "10px 12px",
        fontFamily: sans,
        fontSize: 13,
        color: palette.text,
      }}
    >
      <strong>{label}:</strong> {value}
    </div>
  );
}

function getSupportBadges(recipe: Recipe) {
  return [
    ...(recipe.glp1.shotDayFriendly ? ["Shot-day friendly"] : []),
    ...(recipe.glp1.nauseaFriendly ? ["Nausea-friendly"] : []),
    ...(recipe.glp1.refluxFriendly ? ["Reflux-friendlier"] : []),
    ...(recipe.canBlendOrSip ? ["Sip or blend"] : []),
    ...(recipe.freezesWell ? ["Freezes well"] : []),
  ];
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
