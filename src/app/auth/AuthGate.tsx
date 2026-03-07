import type { PropsWithChildren } from "react";
import { useAppAuth } from "../providers/app-auth-context";
import { envReadiness } from "../../config/env";
import { font, palette, sans } from "../../features/meal-planner/constants";

export function AuthGate({ children }: PropsWithChildren) {
  const auth = useAppAuth();

  if (!envReadiness.authReady) {
    return children;
  }

  if (auth.isLoading || window.location.pathname === "/auth/callback" || window.location.pathname === "/login") {
    return (
      <CenteredMessage
        title="Signing you in"
        body="WorkOS is resolving your session and handing control back to the app."
      />
    );
  }

  if (!auth.user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background:
            "radial-gradient(circle at top, rgba(183, 228, 199, 0.3), transparent 35%), linear-gradient(180deg, #f8f4ed 0%, #faf7f2 45%, #f3efe7 100%)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#ffffffd9",
            backdropFilter: "blur(16px)",
            borderRadius: 20,
            padding: 32,
            border: `1px solid ${palette.border}`,
            boxShadow: "0 30px 60px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Hosted Login
          </div>
          <h1 style={{ fontFamily: font, fontSize: 36, margin: "10px 0 12px", lineHeight: 1.05 }}>
            Sign in to keep meal plans synced across devices.
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.6, color: palette.textMuted, margin: 0 }}>
            Authentication is handled by WorkOS. Your planner data will be stored in your hosted Supabase instance once both services are configured.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
            <button
              onClick={() => void auth.signIn()}
              style={primaryButtonStyle}
            >
              Sign in
            </button>
            <button
              onClick={() => void auth.signUp()}
              style={secondaryButtonStyle}
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

function CenteredMessage({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: palette.bg,
      }}
    >
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <h1 style={{ fontFamily: font, fontSize: 32, marginBottom: 10 }}>{title}</h1>
        <p style={{ fontFamily: sans, color: palette.textMuted, lineHeight: 1.6, margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

const primaryButtonStyle: React.CSSProperties = {
  background: palette.accent,
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "12px 20px",
  fontFamily: sans,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#fff",
  color: palette.text,
  border: `1px solid ${palette.border}`,
  borderRadius: 999,
  padding: "12px 20px",
  fontFamily: sans,
  fontWeight: 700,
  cursor: "pointer",
};
