import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAppAuth } from "../providers/app-auth-context";
import { envReadiness } from "../../config/env";
import { font, palette, sans } from "../../lib/design-tokens";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const auth = useAppAuth();

  // In local/scaffold mode (no WorkOS configured), allow everything through
  if (!envReadiness.authReady) {
    return children;
  }

  // Still loading auth state
  if (auth.isLoading) {
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
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontFamily: font, fontSize: 32, marginBottom: 8, color: palette.text }}>
            Signing you in
          </div>
          <div style={{ fontFamily: sans, color: palette.textMuted, lineHeight: 1.6 }}>
            Resolving your session...
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to landing page
  if (!auth.user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
