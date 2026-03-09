import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { secondaryLinkStyle } from "../../components/ui/styles";
import { font, palette, sans } from "../meal-planner/constants";
import { useProfile } from "../profile/hooks/useProfile";
import { DashboardPanel } from "../dashboard/components/DashboardPanel";
import { HydrationCard } from "../dashboard/components/HydrationCard";
import { QuickCheckInCard } from "../dashboard/components/QuickCheckInCard";
import { RecentTrendsCard } from "./components/RecentTrendsCard";
import { MealResponseCard } from "./components/MealResponseCard";
import { ConstipationSupportCard } from "./components/ConstipationSupportCard";
import { DailyChecklistCard } from "./components/DailyChecklistCard";
import { RECIPES } from "../meal-planner/data/recipes";
import {
  getActiveSymptoms,
  getConstipationSupportPlan,
  getDailyChecklistSummary,
  getDashboardMealRecommendations,
  getDashboardMessages,
  getHydrationRiskSummary,
  getHydrationStatus,
  getRecentLogTrendSummary,
  hasRedFlagSymptoms,
  needsElectrolytePrompt,
} from "../dashboard/support";
import { getFiberRampTarget } from "../../domain/utils";

export function DailyLogPage() {
  const {
    profile,
    todayLog,
    recentLogs,
    isLoading,
    addHydration,
    setAppetiteLevel,
    setSymptomSeverity,
    setFoodNoiseLevel,
    setFoodMood,
    saveMealEntry,
    removeMealEntry,
    setBowelMovement,
    setBristolStoolType,
    toggleMovementActivity,
    toggleSupplement,
  } = useProfile();

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading daily log...</div>;
  }

  const activeSymptoms = getActiveSymptoms(todayLog);
  const contextMessages = getDashboardMessages(profile, todayLog);
  const hydrationStatus = getHydrationStatus(profile, todayLog);
  const hydrationRisk = getHydrationRiskSummary(profile, todayLog);
  const electrolytePrompt = needsElectrolytePrompt(todayLog);
  const redFlagActive = hasRedFlagSymptoms(todayLog);
  const trendSummary = getRecentLogTrendSummary(recentLogs);
  const mealRecommendations = getDashboardMealRecommendations(profile, todayLog, RECIPES, recentLogs);
  const constipationPlan = getConstipationSupportPlan(profile, todayLog, recentLogs, RECIPES);
  const checklistSummary = getDailyChecklistSummary(todayLog);
  const fiberRamp = getFiberRampTarget(profile.fiberTarget, profile.medicationStartDate);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Daily Log
          </div>
          <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0 8px", lineHeight: 1.05 }}>
            Log today’s symptoms and hydration.
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, lineHeight: 1.6, maxWidth: 620, margin: 0 }}>
            This route is the dedicated version of the dashboard check-in. It is optimized for quick daily updates and should become the main data source for shot-day support and recommendations.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/" style={secondaryLinkStyle}>
            Back to dashboard
          </Link>
          <Link to="/history" style={secondaryLinkStyle}>
            View recent history
          </Link>
          <Link to="/red-flags" style={redLinkStyle}>
            Red-flag help
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 0.95fr", gap: 16, marginTop: 22 }}>
        <DashboardPanel title="Symptoms and appetite">
          <QuickCheckInCard
            log={todayLog}
            onSetAppetite={(value) => void setAppetiteLevel(value)}
            onSetSymptom={(symptom, severity) => void setSymptomSeverity(symptom, severity)}
            onSetFoodNoise={(value) => void setFoodNoiseLevel(value)}
            onSetFoodMood={(value) => void setFoodMood(value)}
          />
        </DashboardPanel>

        <DashboardPanel title="Hydration">
          <HydrationCard
            hydrationOz={todayLog.hydrationOz}
            hydrationGoal={profile.hydrationGoal}
            statusMessage={hydrationStatus}
            onAddWater={(ounces) => void addHydration(ounces)}
          />
          <div style={hydrationRiskBoxStyle(hydrationRisk.level)}>
            {hydrationRisk.message}
          </div>
          {electrolytePrompt ? (
            <div style={warningBoxStyle}>
              GI symptoms are active today. Consider adding electrolytes if tolerated and keep fluids steady.
            </div>
          ) : null}
        </DashboardPanel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 16, marginTop: 16 }}>
        <DashboardPanel title="Today’s summary">
          {activeSymptoms.length === 0 ? (
            <div style={{ fontFamily: sans, color: palette.textMuted }}>No symptoms logged yet today.</div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeSymptoms.map(([symptom, severity]) => (
                <span key={symptom} style={symptomBadgeStyle(severity)}>
                  {symptom} · {severity}
                </span>
              ))}
            </div>
          )}
          <ul style={{ margin: "14px 0 0", paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
            {contextMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </DashboardPanel>

        <DashboardPanel title="Safety check">
          <div style={redFlagActive ? criticalBoxStyle : advisoryBoxStyle}>
            {redFlagActive
              ? "Severe stomach pain is currently logged. Review the red-flag screen now and consider contacting your doctor."
              : "Use the red-flag screen if symptoms become severe, persistent, or dehydration signs appear."}
          </div>
          <div style={{ marginTop: 12 }}>
            <Link to="/red-flags" style={redLinkStyle}>
              Open red-flag guidance
            </Link>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Supplements and movement">
          <DailyChecklistCard
            supplements={todayLog.supplements}
            movement={todayLog.movement}
            supplementTargetCount={checklistSummary.supplementTargetCount}
            movementSummary={checklistSummary.movementSummary}
            onToggleSupplement={(value) => void toggleSupplement(value)}
            onToggleMovement={(value) => void toggleMovementActivity(value)}
          />
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Constipation support">
          <ConstipationSupportCard
            daysSinceBowelMovement={constipationPlan.daysSinceBowelMovement}
            escalationActive={constipationPlan.escalationActive}
            movementDone={constipationPlan.movementDone}
            bowelMovementToday={Boolean(todayLog.bowelMovement)}
            bristolStoolType={todayLog.bristolStoolType}
            recipeSuggestions={constipationPlan.recipeSuggestions}
            prompts={constipationPlan.prompts}
            currentFiberTarget={fiberRamp.currentTarget}
            fiberStageLabel={fiberRamp.stageLabel}
            onToggleBowelMovement={(value) => void setBowelMovement(value)}
            onSetBristolStoolType={(value) => void setBristolStoolType(value)}
            onToggleMovement={() => void toggleMovementActivity("10-minute walk")}
          />
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Meal response">
          <MealResponseCard
            entries={todayLog.mealsConsumed}
            recommendations={mealRecommendations}
            onAddRecipe={(recipe) =>
              void saveMealEntry({
                recipeId: recipe.id,
                mealType: recipe.meal,
                portion: recipe.recommendedPortion,
                actualProtein: scaleMacro(recipe.protein, recipe.recommendedPortion),
                actualFiber: scaleMacro(recipe.fiber, recipe.recommendedPortion),
                actualCalories: scaleMacro(recipe.calories, recipe.recommendedPortion),
                tolerance: "okay",
              })
            }
            onUpdateEntry={(entry) => void saveMealEntry(entry)}
            onRemoveEntry={(entry) => void removeMealEntry(entry)}
          />
        </DashboardPanel>
      </div>
      
      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Last 7 days">
          <RecentTrendsCard
            symptomDays={trendSummary.symptomDays}
            avgHydrationOz={trendSummary.avgHydrationOz}
            constipationDays={trendSummary.constipationDays}
            nauseaDays={trendSummary.nauseaDays}
            lowAppetiteDays={trendSummary.lowAppetiteDays}
            avgFoodNoise={trendSummary.avgFoodNoise}
            difficultFoodMoodDays={trendSummary.difficultFoodMoodDays}
            supplementDays={trendSummary.supplementDays}
            proteinSupplementDays={trendSummary.proteinSupplementDays}
            movementDays={trendSummary.movementDays}
            strengthDays={trendSummary.strengthDays}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <Link to="/history" style={secondaryLinkStyle}>
              Explore day-by-day history
            </Link>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

function scaleMacro(value: number, portion: "mini" | "half" | "full") {
  if (portion === "mini") {
    return Math.round(value * 0.5);
  }
  if (portion === "half") {
    return Math.round(value * 0.75);
  }
  return value;
}

const redLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  border: `1px solid #f4c2c7`,
  color: palette.danger,
  textDecoration: "none",
  padding: "11px 16px",
  fontFamily: sans,
  fontWeight: 700,
  background: "#fff4f5",
};

const warningBoxStyle: CSSProperties = {
  marginTop: 14,
  borderRadius: 14,
  padding: "12px 14px",
  background: "#fffaf1",
  border: "1px solid #f1dfb8",
  fontFamily: sans,
  fontSize: 13,
  color: palette.text,
};

function hydrationRiskBoxStyle(level: "low" | "moderate" | "high"): CSSProperties {
  if (level === "high") {
    return {
      marginTop: 14,
      borderRadius: 14,
      padding: "12px 14px",
      background: "#fff4f5",
      border: "1px solid #f4c2c7",
      fontFamily: sans,
      fontSize: 13,
      color: palette.danger,
    };
  }

  if (level === "moderate") {
    return {
      marginTop: 14,
      borderRadius: 14,
      padding: "12px 14px",
      background: "#fffaf1",
      border: "1px solid #f1dfb8",
      fontFamily: sans,
      fontSize: 13,
      color: palette.text,
    };
  }

  return {
    marginTop: 14,
    borderRadius: 14,
    padding: "12px 14px",
    background: "#f7faf7",
    border: `1px solid ${palette.border}`,
    fontFamily: sans,
    fontSize: 13,
    color: palette.textMuted,
  };
}

const advisoryBoxStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#fffaf1",
  border: "1px solid #f1dfb8",
  fontFamily: sans,
  fontSize: 13,
  color: palette.text,
};

const criticalBoxStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#fff4f5",
  border: "1px solid #f4c2c7",
  fontFamily: sans,
  fontSize: 13,
  color: palette.danger,
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
