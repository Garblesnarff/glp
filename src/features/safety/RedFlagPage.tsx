import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { font, palette, sans } from "../meal-planner/constants";

const redFlags = [
  "Severe or persistent abdominal pain",
  "Pain that radiates to the back",
  "Ongoing vomiting that will not stop",
  "Signs of dehydration such as dizziness, dark urine, or dry mouth",
  "Possible gallbladder symptoms such as upper abdominal pain or jaundice",
];

export function RedFlagPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 80px" }}>
      <div style={heroStyle}>
        <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.danger }}>
          Safety Guidance
        </div>
        <h1 style={{ fontFamily: font, fontSize: 40, margin: "10px 0 12px", lineHeight: 1.05 }}>
          Contact your doctor or get help if these symptoms appear.
        </h1>
        <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, lineHeight: 1.6, margin: 0 }}>
          This is the dedicated red-flag screen from the PRD. Keep it easy to find and never bury it behind the recipe workflow.
        </p>
      </div>

      <div style={sectionStyle}>
        <ul style={{ margin: 0, paddingLeft: 22, fontFamily: sans, fontSize: 15, lineHeight: 1.9, color: palette.text }}>
          {redFlags.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div style={sectionStyle}>
        <h2 style={{ fontFamily: font, fontSize: 28, margin: "0 0 12px" }}>What to do right now</h2>
        <div style={{ display: "grid", gap: 10, fontFamily: sans, color: palette.textMuted, lineHeight: 1.7 }}>
          <div>1. Stop trying to push food if symptoms are severe.</div>
          <div>2. Focus on hydration only if you can tolerate it safely.</div>
          <div>3. Use medical guidance instead of trying to manage severe symptoms through meal planning.</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/today" style={secondaryLinkStyle}>
          Back to daily log
        </Link>
        <Link to="/" style={secondaryLinkStyle}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

const heroStyle: CSSProperties = {
  borderRadius: 20,
  padding: 24,
  background: "linear-gradient(180deg, #fff4f5 0%, #fff 100%)",
  border: "1px solid #f4c2c7",
};

const sectionStyle: CSSProperties = {
  marginTop: 16,
  borderRadius: 18,
  padding: 20,
  background: "#ffffffdb",
  border: `1px solid ${palette.border}`,
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
