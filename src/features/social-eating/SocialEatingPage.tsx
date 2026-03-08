import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { font, palette, sans } from "../meal-planner/constants";
import { DashboardPanel } from "../dashboard/components/DashboardPanel";
import { useProfile } from "../profile/hooks/useProfile";
import { getCuisinePlaybook, getDiningOutContext, getSocialScripts } from "./playbook";

export function SocialEatingPage() {
  const { profile, todayLog, isLoading } = useProfile();

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading social eating playbook...</div>;
  }

  const context = getDiningOutContext(profile, todayLog);
  const cuisines = getCuisinePlaybook(profile, todayLog);
  const scripts = getSocialScripts();

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Social Eating
          </div>
          <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0 8px", lineHeight: 1.05 }}>
            Dining out without guessing.
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
            This playbook turns restaurant and gathering decisions into a calmer, lower-friction process. It is meant to help when appetite is unpredictable or social pressure is high.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/" style={secondaryLinkStyle}>Back to dashboard</Link>
          <Link to="/today" style={secondaryLinkStyle}>Open daily log</Link>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <DashboardPanel title="Today’s dining-out context">
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
            {context.messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Cuisine playbook">
          <div style={cardGridStyle}>
            {cuisines.map((cuisine) => (
              <div key={cuisine.id} style={cuisineCardStyle}>
                <div style={{ fontFamily: font, fontSize: 24, color: palette.text }}>{cuisine.title}</div>
                <div style={sectionLabelStyle}>Best bets</div>
                <ul style={listStyle}>
                  {cuisine.bestBets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div style={sectionLabelStyle}>Watch out for</div>
                <ul style={listStyle}>
                  {cuisine.caution.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div style={portionBoxStyle}>{cuisine.portionMove}</div>
              </div>
            ))}
          </div>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Family gathering and pressure scripts">
          <div style={{ display: "grid", gap: 10 }}>
            {scripts.map((script) => (
              <div key={script} style={scriptRowStyle}>
                {script}
              </div>
            ))}
            <div style={noteBoxStyle}>
              Doggy-bag strategy: order assuming you will eat half, box the rest early, and treat stopping as success rather than failure.
            </div>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
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

const cardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const cuisineCardStyle: CSSProperties = {
  borderRadius: 16,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "14px 16px",
  display: "grid",
  gap: 10,
};

const sectionLabelStyle: CSSProperties = {
  fontFamily: sans,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: palette.textMuted,
};

const listStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  fontFamily: sans,
  fontSize: 13,
  color: palette.textMuted,
  lineHeight: 1.7,
};

const portionBoxStyle: CSSProperties = {
  borderRadius: 12,
  padding: "10px 12px",
  background: palette.accentSoft,
  color: palette.accent,
  fontFamily: sans,
  fontSize: 13,
  lineHeight: 1.6,
};

const scriptRowStyle: CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "12px 14px",
  fontFamily: sans,
  fontSize: 14,
  color: palette.text,
  lineHeight: 1.6,
};

const noteBoxStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#fffaf1",
  border: "1px solid #f1dfb8",
  fontFamily: sans,
  fontSize: 13,
  color: palette.text,
  lineHeight: 1.6,
};
