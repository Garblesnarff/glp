import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getDaysSince, getNextShotLabel } from "../../domain/utils";
import { palette, sans, font } from "../meal-planner/constants";
import { RecipeCard } from "../meal-planner/components/RecipeCard";
import { RecipeModal } from "../meal-planner/components/RecipeModal";
import type { Recipe } from "../meal-planner/types";
import { useProfile } from "../profile/hooks/useProfile";
import { DashboardMetricCard } from "./components/DashboardMetricCard";
import { DashboardPanel } from "./components/DashboardPanel";
import { EmergencySupportCard } from "./components/EmergencySupportCard";
import { HydrationCard } from "./components/HydrationCard";
import { QuickCheckInCard } from "./components/QuickCheckInCard";
import {
  getActiveSymptoms,
  getDashboardMealRecommendations,
  getDashboardMessages,
  getEmergencyFoods,
  getHydrationStatus,
  getRecipeRecommendationReasons,
  hasRedFlagSymptoms,
  isShotDaySupportActive,
} from "./support";

export function DashboardPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const { profile, profileReady, todayLog, recentLogs, isLoading, addHydration, setAppetiteLevel, setSymptomSeverity } = useProfile();
  const daysSinceStart = profile.medicationStartDate ? getDaysSince(profile.medicationStartDate) : 0;
  const nextShot = getNextShotLabel(profile.shotDay);
  const hydrationPct = Math.min((todayLog.hydrationOz / profile.hydrationGoal) * 100, 100);
  const proteinTotal = todayLog.mealsConsumed.reduce((sum, meal) => sum + meal.actualProtein, 0);
  const proteinPct = Math.min((proteinTotal / profile.proteinTarget.min) * 100, 100);
  const activeSymptoms = getActiveSymptoms(todayLog);
  const dashboardMessages = getDashboardMessages(profile, todayLog);
  const shotDayActive = isShotDaySupportActive(profile);
  const hydrationStatus = getHydrationStatus(profile, todayLog);
  const emergencyFoods = getEmergencyFoods(profile, todayLog);
  const mealRecommendations = getDashboardMealRecommendations(profile, todayLog, undefined, recentLogs);
  const redFlagActive = hasRedFlagSymptoms(todayLog);

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Daily Support
          </div>
          <h1 style={{ fontFamily: font, fontSize: 42, margin: "8px 0 8px", lineHeight: 1.02 }}>
            {profileReady ? `Good to see you, ${profile.name}.` : "Welcome to your GLP-1 companion."}
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, maxWidth: 620, lineHeight: 1.6, margin: 0 }}>
            Your dashboard now captures daily symptoms, hydration, appetite, and rough-day support instead of just linking out to the planner.
          </p>
        </div>
        {!profileReady ? (
          <Link to="/onboarding" style={ctaLinkStyle}>
            Finish setup
          </Link>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 24 }}>
        <DashboardMetricCard title="Shot status" value={`${daysSinceStart} days in`} detail={`Next shot: ${nextShot}`} />
        <DashboardMetricCard title="Hydration" value={`${todayLog.hydrationOz} oz`} detail={`Goal: ${profile.hydrationGoal} oz`} progress={hydrationPct} />
        <DashboardMetricCard title="Protein" value={`${proteinTotal} g`} detail={`Target: ${profile.proteinTarget.min}-${profile.proteinTarget.max} g`} progress={proteinPct} />
        <DashboardMetricCard title="Appetite" value={todayLog.appetiteLevel} detail="Updated in quick check-in" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 18 }}>
        <DashboardPanel title="Quick check-in">
          <QuickCheckInCard
            log={todayLog}
            onSetAppetite={(value) => void setAppetiteLevel(value)}
            onSetSymptom={(symptom, severity) => void setSymptomSeverity(symptom, severity)}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <Link to="/today" style={secondaryLinkStyle}>
              Open full daily log
            </Link>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Hydration">
          <HydrationCard
            hydrationOz={todayLog.hydrationOz}
            hydrationGoal={profile.hydrationGoal}
            statusMessage={hydrationStatus}
            onAddWater={(ounces) => void addHydration(ounces)}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <Link to="/today" style={secondaryLinkStyle}>
              Open hydration log
            </Link>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16, marginTop: 18 }}>
        <DashboardPanel title="Today’s context">
          <div style={{ display: "grid", gap: 10 }}>
            {shotDayActive ? <div style={noticeStyle}>Shot-day mode is active. Favor gentle foods, slower eating, and smaller portions.</div> : null}
            {activeSymptoms.length > 0 ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {activeSymptoms.map(([symptom, severity]) => (
                  <span key={symptom} style={symptomBadgeStyle(severity)}>
                    {symptom} · {severity}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontFamily: sans, fontSize: 14, color: palette.textMuted }}>
                No symptoms logged today yet.
              </div>
            )}
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
              {dashboardMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </div>
        </DashboardPanel>

        <DashboardPanel title="I feel awful">
          <EmergencySupportCard
            hydrationProgress={hydrationStatus}
            redFlagActive={redFlagActive}
            foods={emergencyFoods}
          />
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 18 }}>
        <DashboardPanel title="Recommended meals for today">
          <p style={{ margin: "0 0 12px", fontFamily: sans, color: palette.textMuted, lineHeight: 1.6 }}>
            These suggestions now react to shot-day support, symptoms, and the enriched GLP-1 recipe profile. Open a recipe to see the support fit in more detail.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {mealRecommendations.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                compact
                contextBadges={getRecipeRecommendationReasons(recipe, profile, todayLog, recentLogs)}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            <Link to="/planner" style={secondaryLinkStyle}>
              Open planner
            </Link>
            <Link to="/history" style={secondaryLinkStyle}>
              View recent history
            </Link>
            <Link to="/onboarding" style={secondaryLinkStyle}>
              Edit profile
            </Link>
          </div>
        </DashboardPanel>
      </div>

      {selectedRecipe ? <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} /> : null}
    </div>
  );
}

const ctaLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  background: palette.accent,
  color: "#fff",
  textDecoration: "none",
  padding: "12px 18px",
  fontFamily: sans,
  fontWeight: 700,
};

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

const noticeStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#f4fbf6",
  border: `1px solid ${palette.accentLight}`,
  fontFamily: sans,
  color: palette.accent,
  fontSize: 13,
};

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
