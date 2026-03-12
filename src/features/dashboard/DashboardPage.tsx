import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { secondaryLinkStyle } from "../../components/ui/styles";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { SectionLabel } from "../../components/ui/SectionLabel";
import { getDaysSince, getFiberRampTarget, getNextShotLabel } from "../../domain/utils";
import { palette, sans, font, typography, spacing } from "../../lib/design-tokens";
import { RecipeCard } from "../meal-planner/components/RecipeCard";
import { RecipeModal } from "../meal-planner/components/RecipeModal";
import type { Recipe } from "../meal-planner/types";
import { useProfile } from "../profile/hooks/useProfile";
import { useAccountLinking } from "../account/hooks/useAccountLinking";
import { useSupportAlerts } from "../support-alerts/hooks/useSupportAlerts";
import { DashboardMetricCard } from "./components/DashboardMetricCard";
import { CompanionRemindersPanel } from "./components/CompanionRemindersPanel";
import { DashboardPanel } from "./components/DashboardPanel";
import { EmergencySupportCard } from "./components/EmergencySupportCard";
import { HydrationCard } from "./components/HydrationCard";
import { QuickCheckInCard } from "./components/QuickCheckInCard";
import { getConsistencySummary } from "./consistency";
import { getCompanionReminders } from "./reminders";
import {
  getActiveSymptoms,
  getDashboardMealRecommendations,
  getDashboardMessages,
  getEmergencyFoods,
  getFoodRelationshipSupport,
  getHydrationStatus,
  getRecipeRecommendationReasons,
  getSupportHabitsSummary,
  hasRedFlagSymptoms,
  isShotDaySupportActive,
} from "./support";

export function DashboardPage() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const {
    profile,
    profileReady,
    todayLog,
    recentLogs,
    medicationLogs,
    isLoading,
    addHydration,
    setAppetiteLevel,
    setSymptomSeverity,
    setFoodNoiseLevel,
    setFoodMood,
  } =
    useProfile();
  const { membership } = useAccountLinking();
  const { activeAlerts, createRoughDayAlert } = useSupportAlerts();
  const daysSinceStart = profile.medicationStartDate ? getDaysSince(profile.medicationStartDate) : 0;
  const nextShot = getNextShotLabel(profile.shotDay);
  const hydrationPct = Math.min((todayLog.hydrationOz / profile.hydrationGoal) * 100, 100);
  const proteinTotal = todayLog.mealsConsumed.reduce((sum, meal) => sum + meal.actualProtein, 0);
  const proteinPct = Math.min((proteinTotal / profile.proteinTarget.min) * 100, 100);
  const fiberRamp = getFiberRampTarget(profile.fiberTarget, profile.medicationStartDate);
  const activeSymptoms = getActiveSymptoms(todayLog);
  const dashboardMessages = getDashboardMessages(profile, todayLog);
  const shotDayActive = isShotDaySupportActive(profile);
  const hydrationStatus = getHydrationStatus(profile, todayLog);
  const emergencyFoods = getEmergencyFoods(profile, todayLog);
  const mealRecommendations = getDashboardMealRecommendations(profile, todayLog, undefined, recentLogs);
  const redFlagActive = hasRedFlagSymptoms(todayLog);
  const roughDayAlertActive = activeAlerts.some((alert) => alert.kind === "rough_day");
  const reminders = getCompanionReminders(profile, todayLog, recentLogs, medicationLogs);
  const supportHabits = getSupportHabitsSummary(todayLog, recentLogs);
  const consistency = getConsistencySummary(profile, recentLogs);
  const foodRelationshipSupport = getFoodRelationshipSupport(todayLog, recentLogs);

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading dashboard...</div>;
  }

  return (
    <Container>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <SectionLabel>Daily Support</SectionLabel>
          <h1 style={{ fontFamily: font, fontSize: typography.display.size, margin: "8px 0 8px", lineHeight: typography.display.lineHeight }}>
            {profileReady ? `Good to see you, ${profile.name}.` : "Welcome to your GLP-1 companion."}
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, maxWidth: 620, lineHeight: 1.6, margin: 0 }}>
            {profile.role === "prep_partner"
              ? "Your dashboard surfaces the current support context so you can prep, shop, and respond quickly."
              : "Your dashboard now captures daily symptoms, hydration, appetite, and rough-day support instead of just linking out to the planner."}
          </p>
        </div>
        {!profileReady ? (
          <Link to="/onboarding" style={{ textDecoration: "none" }}>
            <Button>Finish setup</Button>
          </Link>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: spacing.xl, marginTop: spacing.xl }}>
        <DashboardMetricCard title="Shot status" value={`${daysSinceStart} days in`} detail={`Next shot: ${nextShot}`} />
        <DashboardMetricCard title="Hydration" value={`${todayLog.hydrationOz} oz`} detail={`Goal: ${profile.hydrationGoal} oz`} progress={hydrationPct} />
        <DashboardMetricCard title="Protein" value={`${proteinTotal} g`} detail={`Target: ${profile.proteinTarget.min}-${profile.proteinTarget.max} g`} progress={proteinPct} />
        <DashboardMetricCard title="Fiber ramp" value={`${fiberRamp.currentTarget} g`} detail={`${fiberRamp.stageLabel} · full ${fiberRamp.fullTarget} g`} />
        <DashboardMetricCard title="Appetite" value={todayLog.appetiteLevel} detail="Updated in quick check-in" />
        <DashboardMetricCard title="Food noise" value={`${todayLog.foodNoiseLevel}/5`} detail={todayLog.foodMood} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: spacing.xl, marginTop: spacing.xl }}>
        <DashboardPanel title="Quick check-in">
          <QuickCheckInCard
            log={todayLog}
            onSetAppetite={(value) => void setAppetiteLevel(value)}
            onSetSymptom={(symptom, severity) => void setSymptomSeverity(symptom, severity)}
            onSetFoodNoise={(value) => void setFoodNoiseLevel(value)}
            onSetFoodMood={(value) => void setFoodMood(value)}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <Link to="/today" style={secondaryLinkStyle}>Open full daily log</Link>
            <Link to="/partner" style={secondaryLinkStyle}>{profile.role === "prep_partner" ? "Open prep view" : "Partner workspace"}</Link>
            <Link to="/medication" style={secondaryLinkStyle}>Medication timeline</Link>
            <Link to="/weight" style={secondaryLinkStyle}>Weight context</Link>
            <Link to="/social-eating" style={secondaryLinkStyle}>Social eating</Link>
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
            <Link to="/today" style={secondaryLinkStyle}>Open hydration log</Link>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: spacing.xl, marginTop: spacing.xl }}>
        <DashboardPanel title="Today's context">
          <div style={{ display: "grid", gap: 10 }}>
            {shotDayActive ? <div style={noticeStyle}>Shot-day mode is active. Favor gentle foods, slower eating, and smaller portions.</div> : null}
            {activeSymptoms.length > 0 ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {activeSymptoms.map(([symptom, severity]) => (
                  <Badge key={symptom} tone={severity === "severe" ? "danger" : severity === "moderate" ? "warning" : "default"}>
                    {symptom} · {severity}
                  </Badge>
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
            canNotifyPartner={profile.role === "primary" && Boolean(membership)}
            supportAlertSent={roughDayAlertActive}
            onNotifyPartner={() => {
              if (!roughDayAlertActive) {
                void createRoughDayAlert(buildRoughDayAlertNote(activeSymptoms.map(([symptom]) => symptom), todayLog.appetiteLevel));
              }
            }}
          />
        </DashboardPanel>
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <DashboardPanel title="Companion reminders">
          <CompanionRemindersPanel reminders={reminders} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
            <Link to="/notifications" style={secondaryLinkStyle}>Open notification inbox</Link>
            <Link to="/medication" style={secondaryLinkStyle}>Manage reminder settings</Link>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <DashboardPanel title="Protein + movement support">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={supportHabits.proteinSupplementLogged ? "success" : "warning"}>
                {supportHabits.proteinSupplementLogged ? "Protein support logged" : "Protein support open"}
              </Badge>
              <Badge tone={supportHabits.strengthLoggedToday ? "success" : "warning"}>
                {supportHabits.strengthLoggedToday ? "Strength logged today" : `${supportHabits.recentStrengthDays}/7 strength days`}
              </Badge>
              <Badge tone={supportHabits.recentMovementDays >= 3 ? "success" : "warning"}>
                {supportHabits.recentMovementDays}/7 movement days
              </Badge>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
              {supportHabits.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/today" style={secondaryLinkStyle}>Open checklist</Link>
              <Link to="/history" style={secondaryLinkStyle}>Review habit trend</Link>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <DashboardPanel title="Consistency wins">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={consistency.hydrationStreak >= 3 ? "success" : "warning"}>{consistency.hydrationStreak} hydration days</Badge>
              <Badge tone={consistency.proteinStreak >= 3 ? "success" : "warning"}>{consistency.proteinStreak} protein days</Badge>
              <Badge tone={consistency.movementStreak >= 2 ? "success" : "warning"}>{consistency.movementStreak} movement days</Badge>
              <Badge tone={consistency.loggingStreak >= 3 ? "success" : "warning"}>{consistency.loggingStreak} logging days</Badge>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
              {consistency.wins.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/weight" style={secondaryLinkStyle}>See weight in context</Link>
              <Link to="/history" style={secondaryLinkStyle}>Review recent trend</Link>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: spacing.xl }}>
        <DashboardPanel title="Food relationship support">
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={todayLog.foodNoiseLevel <= 2 ? "success" : "warning"}>Food noise {todayLog.foodNoiseLevel}/5</Badge>
              <Badge tone={todayLog.foodMood === "neutral" || todayLog.foodMood === "excited" ? "success" : "warning"}>{todayLog.foodMood}</Badge>
              <Badge tone={foodRelationshipSupport.previousAverageNoise >= todayLog.foodNoiseLevel ? "success" : "warning"}>
                Recent avg {foodRelationshipSupport.previousAverageNoise}/5
              </Badge>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
              {foodRelationshipSupport.messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/social-eating" style={secondaryLinkStyle}>Open social eating playbook</Link>
              <Link to="/today" style={secondaryLinkStyle}>Update food check-in</Link>
            </div>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: spacing.xl }}>
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
            <Link to="/planner" style={secondaryLinkStyle}>Open planner</Link>
            <Link to="/history" style={secondaryLinkStyle}>View recent history</Link>
            <Link to="/onboarding" style={secondaryLinkStyle}>Edit profile</Link>
          </div>
        </DashboardPanel>
      </div>

      {selectedRecipe ? <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} /> : null}
    </Container>
  );
}

function buildRoughDayAlertNote(symptoms: string[], appetiteLevel: string) {
  const symptomLabel = symptoms.length > 0 ? symptoms.slice(0, 3).join(", ") : "symptoms not specified";
  return `Rough day support requested. Appetite: ${appetiteLevel}. Symptoms: ${symptomLabel}.`;
}

const noticeStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#f4fbf6",
  border: `1px solid ${palette.accentLight}`,
  fontFamily: sans,
  color: palette.accent,
  fontSize: 13,
};
