import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { envReadiness } from "../config/env";
import { palette, sans } from "../features/meal-planner/constants";
import { useAppAuth } from "./providers/app-auth-context";

export function AppShell({ children }: PropsWithChildren) {
  const auth = useAppAuth();

  return (
    <>
      {!envReadiness.authReady || !envReadiness.databaseReady ? (
        <div
          style={{
            background: "#fff7e8",
            borderBottom: `1px solid ${palette.border}`,
            color: palette.text,
            padding: "10px 16px",
            fontFamily: sans,
            fontSize: 12,
          }}
        >
          Running in local scaffold mode. Add WorkOS and Supabase env vars to enable hosted auth and cloud persistence.
        </div>
      ) : null}
      {auth.user ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            padding: "10px 16px",
            background: "#ffffffbf",
            borderBottom: `1px solid ${palette.border}`,
            backdropFilter: "blur(12px)",
            fontFamily: sans,
            fontSize: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span>
              Signed in as <strong>{auth.user.email}</strong>
            </span>
            <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <TopNavLink to="/">Dashboard</TopNavLink>
              <TopNavLink to="/planner">Planner</TopNavLink>
              <TopNavLink to="/grocery">Grocery</TopNavLink>
              <TopNavLink to="/tracker">Tracker</TopNavLink>
              <TopNavLink to="/onboarding">Profile</TopNavLink>
            </nav>
          </div>
          <button
            onClick={() => void auth.signOut()}
            style={{
              background: "none",
              border: `1px solid ${palette.border}`,
              borderRadius: 999,
              padding: "6px 12px",
              fontFamily: sans,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
      {children}
    </>
  );
}

function TopNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: 999,
        color: isActive ? palette.accent : palette.textMuted,
        background: isActive ? palette.accentSoft : "transparent",
        border: `1px solid ${isActive ? palette.accentLight : palette.border}`,
      })}
    >
      {children}
    </NavLink>
  );
}
