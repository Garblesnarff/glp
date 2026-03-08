import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { font, palette, sans } from "../meal-planner/constants";
import { DashboardPanel } from "../dashboard/components/DashboardPanel";
import { useProfile } from "../profile/hooks/useProfile";
import { getActiveSymptoms, getHydrationRiskSummary, getRecentLogTrendSummary, getRecentMealFeedbackSummary } from "../dashboard/support";
import type { DailyLog } from "../../domain/types";
import { RECIPES } from "../meal-planner/data/recipes";

export function HistoryPage() {
  const { profile, recentLogs, isLoading } = useProfile();

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading history...</div>;
  }

  const trendSummary = getRecentLogTrendSummary(recentLogs);
  const mealFeedbackSummary = getRecentMealFeedbackSummary(recentLogs);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Recent History
          </div>
          <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0 8px", lineHeight: 1.05 }}>
            Review the last 7 days.
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
            This is the first browsable history view. It makes symptoms, hydration risk, and appetite patterns inspectable day by day instead of only summarized in a single card.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/" style={secondaryLinkStyle}>
            Back to dashboard
          </Link>
          <Link to="/today" style={secondaryLinkStyle}>
            Back to daily log
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <DashboardPanel title="7-day snapshot">
          <div style={snapshotGridStyle}>
            <SnapshotMetric label="Symptom days" value={`${trendSummary.symptomDays}/7`} />
            <SnapshotMetric label="Avg hydration" value={`${trendSummary.avgHydrationOz} oz`} />
            <SnapshotMetric label="Constipation days" value={`${trendSummary.constipationDays}`} />
            <SnapshotMetric label="Nausea days" value={`${trendSummary.nauseaDays}`} />
            <SnapshotMetric label="Low appetite days" value={`${trendSummary.lowAppetiteDays}`} />
            <SnapshotMetric label="Meals logged" value={`${mealFeedbackSummary.loggedMeals}`} />
            <SnapshotMetric label="Easy meals" value={`${mealFeedbackSummary.easyMeals}`} />
            <SnapshotMetric label="Rough meals" value={`${mealFeedbackSummary.roughMeals}`} />
          </div>
        </DashboardPanel>
      </div>

      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        {recentLogs.length === 0 ? (
          <DashboardPanel title="No recent logs">
            <div style={{ fontFamily: sans, color: palette.textMuted }}>
              Start using the daily log and this history view will fill in automatically.
            </div>
          </DashboardPanel>
        ) : (
          recentLogs.map((log) => <HistoryDayCard key={log.date} log={log} hydrationGoal={profile.hydrationGoal} />)
        )}
      </div>
    </div>
  );
}

function HistoryDayCard({ log, hydrationGoal }: { log: DailyLog; hydrationGoal: number }) {
  const activeSymptoms = getActiveSymptoms(log);
  const hydrationRisk = getHydrationRiskSummary(
    {
      name: "",
      role: "primary",
      currentWeight: 0,
      proteinTarget: { min: 0, max: 0 },
      fiberTarget: 0,
      hydrationGoal,
      dietaryRestrictions: [],
      medicationName: "",
      medicationStartDate: "",
      shotDay: "Monday",
    },
    log,
  );

  return (
    <DashboardPanel title={formatDateLabel(log.date)}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <HistoryMetric label="Hydration" value={`${log.hydrationOz} oz`} detail={`Goal ${hydrationGoal} oz`} />
        <HistoryMetric label="Appetite" value={formatAppetite(log.appetiteLevel)} detail="Morning check-in" />
        <HistoryMetric label="Food mood" value={capitalize(log.foodMood)} detail="Food relationship" />
        <HistoryMetric label="Food noise" value={`${log.foodNoiseLevel}/5`} detail="Thinking about food" />
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <div style={riskBoxStyle(hydrationRisk.level)}>{hydrationRisk.message}</div>

        {log.mealsConsumed.length > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            {log.mealsConsumed.map((meal) => {
              const recipe = RECIPES.find((candidate) => candidate.id === meal.recipeId);
              return (
                <div key={`${meal.recipeId}:${meal.mealType}`} style={mealRowStyle}>
                  <div>
                    <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>
                      {recipe?.name ?? meal.recipeId}
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
                      {capitalize(meal.mealType)} · {capitalize(meal.portion)} portion
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {meal.tolerance ? <span style={mealBadgeStyle(meal.tolerance === "rough" ? "rough" : "normal")}>{capitalize(meal.tolerance)}</span> : null}
                    {meal.wouldRepeat === true ? <span style={mealBadgeStyle("normal")}>Would repeat</span> : null}
                    {meal.wouldRepeat === false ? <span style={mealBadgeStyle("rough")}>Would skip</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {activeSymptoms.length > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {activeSymptoms.map(([symptom, severity]) => (
              <span key={symptom} style={symptomBadgeStyle(severity)}>
                {formatSymptomLabel(symptom)} · {severity}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>No symptoms were logged for this day.</div>
        )}
      </div>
    </DashboardPanel>
  );
}

function SnapshotMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${palette.border}`, background: "#fff", padding: "12px 14px" }}>
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: palette.textMuted }}>{label}</div>
      <div style={{ fontFamily: sans, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function HistoryMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${palette.border}`, background: "#fff", padding: "12px 14px" }}>
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: palette.textMuted }}>{label}</div>
      <div style={{ fontFamily: sans, fontWeight: 700, marginTop: 6, color: palette.text }}>{value}</div>
      <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function formatDateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatAppetite(value: DailyLog["appetiteLevel"]) {
  if (value === "none") {
    return "No appetite";
  }
  if (value === "low") {
    return "Low appetite";
  }
  return "Normal appetite";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatSymptomLabel(symptom: string) {
  if (symptom === "stomachPain") {
    return "Stomach pain";
  }
  if (symptom === "injectionSite") {
    return "Injection-site";
  }
  return symptom;
}

const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  border: `1px solid ${palette.border}`,
  color: palette.text,
  textDecoration: "none",
  padding: "11px 16px",
  fontFamily: sans,
  fontWeight: 600,
};

const snapshotGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 10,
};

const mealRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "10px 12px",
};

function riskBoxStyle(level: "low" | "moderate" | "high"): CSSProperties {
  if (level === "high") {
    return {
      borderRadius: 14,
      padding: "12px 14px",
      background: "#fff4f5",
      border: "1px solid #f4c2c7",
      color: palette.danger,
      fontFamily: sans,
      fontSize: 13,
    };
  }
  if (level === "moderate") {
    return {
      borderRadius: 14,
      padding: "12px 14px",
      background: "#fffaf1",
      border: "1px solid #f1dfb8",
      color: palette.text,
      fontFamily: sans,
      fontSize: 13,
    };
  }
  return {
    borderRadius: 14,
    padding: "12px 14px",
    background: "#f7faf7",
    border: `1px solid ${palette.border}`,
    color: palette.textMuted,
    fontFamily: sans,
    fontSize: 13,
  };
}

function symptomBadgeStyle(severity: string): CSSProperties {
  const isSevere = severity === "severe";
  const isModerate = severity === "moderate";

  return {
    borderRadius: 999,
    padding: "6px 10px",
    background: isSevere ? "#fff4f5" : isModerate ? "#fff8ec" : "#f7faf7",
    border: `1px solid ${isSevere ? "#f4c2c7" : isModerate ? "#f1dfb8" : palette.border}`,
    color: isSevere ? palette.danger : palette.text,
    fontFamily: sans,
    fontSize: 12,
    textTransform: "capitalize",
  };
}

function mealBadgeStyle(tone: "normal" | "rough"): CSSProperties {
  return {
    borderRadius: 999,
    padding: "6px 10px",
    background: tone === "rough" ? "#fff4f5" : "#f4fbf6",
    border: `1px solid ${tone === "rough" ? "#f4c2c7" : palette.accentLight}`,
    color: tone === "rough" ? palette.danger : palette.accent,
    fontFamily: sans,
    fontSize: 12,
    fontWeight: 700,
  };
}
