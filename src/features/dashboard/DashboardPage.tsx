import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { getDaysSince, getNextShotLabel } from "../../domain/utils";
import { font, palette, sans } from "../meal-planner/constants";
import { useProfile } from "../profile/hooks/useProfile";

export function DashboardPage() {
  const { profile, profileReady, todayLog, isLoading } = useProfile();
  const daysSinceStart = profile.medicationStartDate ? getDaysSince(profile.medicationStartDate) : 0;
  const nextShot = getNextShotLabel(profile.shotDay);
  const hydrationPct = Math.min((todayLog.hydrationOz / profile.hydrationGoal) * 100, 100);
  const proteinTotal = todayLog.mealsConsumed.reduce((sum, meal) => sum + meal.actualProtein, 0);
  const proteinPct = Math.min((proteinTotal / profile.proteinTarget.min) * 100, 100);

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>Daily Support</div>
          <h1 style={{ fontFamily: font, fontSize: 42, margin: "8px 0 8px", lineHeight: 1.02 }}>
            {profileReady ? `Good to see you, ${profile.name}.` : "Welcome to your GLP-1 companion."}
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, maxWidth: 620, lineHeight: 1.6, margin: 0 }}>
            Your dashboard should help you manage shot days, symptoms, hydration, and food decisions in under a minute.
          </p>
        </div>
        {!profileReady ? (
          <Link to="/onboarding" style={ctaLinkStyle}>
            Finish setup
          </Link>
        ) : null}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 24 }}>
        <MetricCard title="Shot status" value={`${daysSinceStart} days in`} detail={`Next shot: ${nextShot}`} />
        <MetricCard title="Hydration" value={`${todayLog.hydrationOz} oz`} detail={`Goal: ${profile.hydrationGoal} oz`} progress={hydrationPct} />
        <MetricCard title="Protein" value={`${proteinTotal} g`} detail={`Target: ${profile.proteinTarget.min}-${profile.proteinTarget.max} g`} progress={proteinPct} />
        <MetricCard title="Appetite" value={todayLog.appetiteLevel} detail="Set during quick check-in" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 18 }}>
        <Panel title="Quick check-in">
          <div style={{ display: "grid", gap: 12 }}>
            <QuickAction label="Log symptoms" detail="15-second tap flow scaffold next" />
            <QuickAction label="Add hydration" detail="Bottle-based tracker scaffold next" />
            <QuickAction label="I feel awful" detail="Reserve this for the emergency support flow" critical />
          </div>
        </Panel>

        <Panel title="Today’s context">
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
            <li>Shot day support will prioritize gentle foods and smaller portions.</li>
            <li>Symptom-aware recommendations will live here once daily logs are wired.</li>
            <li>Prep partner context will surface here for shared accounts.</li>
          </ul>
        </Panel>
      </div>

      <div style={{ marginTop: 18 }}>
        <Panel title="Recommended meals for today">
          <p style={{ margin: "0 0 12px", fontFamily: sans, color: palette.textMuted, lineHeight: 1.6 }}>
            This is the future recommendation surface from the PRD. For now, the planner remains available, but the app is now structured so this dashboard can become the default experience.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/planner" style={secondaryLinkStyle}>
              Open planner
            </Link>
            <Link to="/onboarding" style={secondaryLinkStyle}>
              Edit profile
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  progress,
}: {
  title: string;
  value: string;
  detail: string;
  progress?: number;
}) {
  return (
    <div style={{ background: "#ffffffdb", border: `1px solid ${palette.border}`, borderRadius: 18, padding: 18 }}>
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: palette.textMuted }}>{title}</div>
      <div style={{ fontFamily: font, fontSize: 30, margin: "8px 0 6px" }}>{value}</div>
      <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>{detail}</div>
      {typeof progress === "number" ? (
        <div style={{ marginTop: 14, height: 8, borderRadius: 999, background: palette.border, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: palette.accent, borderRadius: 999 }} />
        </div>
      ) : null}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ background: "#ffffffdb", border: `1px solid ${palette.border}`, borderRadius: 18, padding: 20 }}>
      <h2 style={{ fontFamily: font, fontSize: 26, margin: "0 0 14px" }}>{title}</h2>
      {children}
    </section>
  );
}

function QuickAction({ label, detail, critical = false }: { label: string; detail: string; critical?: boolean }) {
  return (
    <button
      type="button"
      style={{
        textAlign: "left",
        borderRadius: 14,
        border: `1px solid ${critical ? "#f4c2c7" : palette.border}`,
        padding: "14px 16px",
        background: critical ? "#fff4f5" : "#fff",
        cursor: "pointer",
      }}
    >
      <div style={{ fontFamily: sans, fontWeight: 700, color: critical ? palette.danger : palette.text }}>{label}</div>
      <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted, marginTop: 4 }}>{detail}</div>
    </button>
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
