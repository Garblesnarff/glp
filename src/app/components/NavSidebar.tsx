import { palette, font, sans, radii } from "../../lib/design-tokens";
import { useProfile } from "../../features/profile/hooks/useProfile";
import { useAppAuth } from "../providers/app-auth-context";
import { NavItem } from "./NavItem";

const dailyLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "◉" },
  { to: "/today", label: "Daily Log", icon: "✎" },
  { to: "/history", label: "Trends", icon: "↗" },
];

const nutritionLinks = [
  { to: "/planner", label: "Meal Planner", icon: "▤" },
  { to: "/grocery", label: "Grocery List", icon: "✓" },
  { to: "/tracker", label: "Tracker", icon: "◧" },
  { to: "/recipes", label: "Recipes", icon: "♨" },
];

const healthLinks = [
  { to: "/medication", label: "Medication", icon: "◈" },
  { to: "/weight", label: "Weight", icon: "⊘" },
  { to: "/red-flags", label: "Safety Guide", icon: "△" },
];

const connectLinks = [
  { to: "/notifications", label: "Inbox", icon: "◌" },
  { to: "/social-eating", label: "Social Eating", icon: "☺" },
];

export function NavSidebar() {
  const auth = useAppAuth();
  const { profile } = useProfile();

  const partnerLink = {
    to: "/partner",
    label: profile.role === "prep_partner" ? "Prep View" : "Partner",
    icon: "♡",
  };

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 240,
        background: "#fff",
        borderRight: `1px solid ${palette.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        overflowY: "auto",
        zIndex: 50,
      }}
    >
      <div
        style={{
          fontFamily: font,
          fontSize: 18,
          color: palette.text,
          padding: "8px 16px 20px",
        }}
      >
        GLP-1 Companion
      </div>

      <NavGroup label="Daily">
        {dailyLinks.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </NavGroup>

      <NavGroup label="Nutrition">
        {nutritionLinks.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </NavGroup>

      <NavGroup label="Health">
        {healthLinks.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
      </NavGroup>

      <NavGroup label="Connect">
        {connectLinks.map((link) => (
          <NavItem key={link.to} {...link} />
        ))}
        <NavItem {...partnerLink} />
      </NavGroup>

      <NavGroup label="Account">
        <NavItem to="/onboarding" label="Profile" icon="⚙" />
      </NavGroup>

      <div style={{ marginTop: "auto", padding: "16px 16px 8px" }}>
        {auth.user ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div
              style={{
                fontFamily: sans,
                fontSize: 12,
                color: palette.textMuted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {auth.user.email}
            </div>
            <button
              onClick={() => void auth.signOut()}
              style={{
                background: "none",
                border: `1px solid ${palette.border}`,
                borderRadius: radii.pill,
                padding: "8px 14px",
                fontFamily: sans,
                fontSize: 12,
                cursor: "pointer",
                color: palette.textMuted,
              }}
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontFamily: sans,
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1.5,
          color: palette.textMuted,
          padding: "12px 16px 6px",
          opacity: 0.7,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
