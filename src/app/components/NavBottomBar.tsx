import { NavLink } from "react-router-dom";
import { palette, sans, transitions } from "../../lib/design-tokens";

const tabs = [
  { to: "/dashboard", label: "Home", icon: "◉" },
  { to: "/today", label: "Log", icon: "✎" },
  { to: "/planner", label: "Plan", icon: "▤" },
  { to: "/medication", label: "Meds", icon: "◈" },
  { to: "/onboarding", label: "More", icon: "⋯" },
];

export function NavBottomBar() {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fff",
        borderTop: `1px solid ${palette.border}`,
        boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.06)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "6px 0 env(safe-area-inset-bottom, 6px)",
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "6px 12px",
            textDecoration: "none",
            fontFamily: sans,
            fontSize: 10,
            fontWeight: isActive ? 700 : 500,
            color: isActive ? palette.accent : palette.textMuted,
            transition: `color ${transitions.fast}`,
          })}
        >
          <span style={{ fontSize: 20 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
