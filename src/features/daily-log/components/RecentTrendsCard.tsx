import type { CSSProperties } from "react";
import { palette, sans } from "../../meal-planner/constants";

export function RecentTrendsCard({
  symptomDays,
  avgHydrationOz,
  constipationDays,
  nauseaDays,
  lowAppetiteDays,
  avgFoodNoise,
  difficultFoodMoodDays,
  supplementDays,
  proteinSupplementDays,
  movementDays,
  strengthDays,
}: {
  symptomDays: number;
  avgHydrationOz: number;
  constipationDays: number;
  nauseaDays: number;
  lowAppetiteDays: number;
  avgFoodNoise: number;
  difficultFoodMoodDays: number;
  supplementDays: number;
  proteinSupplementDays: number;
  movementDays: number;
  strengthDays: number;
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={metricGridStyle}>
        <TrendMetric label="Symptom days" value={`${symptomDays}/7`} />
        <TrendMetric label="Avg hydration" value={`${avgHydrationOz} oz`} />
        <TrendMetric label="Nausea days" value={`${nauseaDays}`} />
        <TrendMetric label="Low appetite days" value={`${lowAppetiteDays}`} />
        <TrendMetric label="Avg food noise" value={`${avgFoodNoise}/5`} />
        <TrendMetric label="Hard food days" value={`${difficultFoodMoodDays}`} />
        <TrendMetric label="Supplement days" value={`${supplementDays}/7`} />
        <TrendMetric label="Movement days" value={`${movementDays}/7`} />
      </div>
      <div style={{ fontFamily: sans, color: palette.textMuted, fontSize: 13, lineHeight: 1.6 }}>
        Constipation was logged on {constipationDays} of the last 7 tracked days. Protein supplement support was logged on {proteinSupplementDays} day{proteinSupplementDays === 1 ? "" : "s"}, and strength work on {strengthDays} day{strengthDays === 1 ? "" : "s"}.
      </div>
    </div>
  );
}

function TrendMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${palette.border}`, padding: "12px 14px", background: "#fff" }}>
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: palette.textMuted }}>
        {label}
      </div>
      <div style={{ fontFamily: sans, fontWeight: 700, color: palette.text, marginTop: 6 }}>{value}</div>
    </div>
  );
}

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};
