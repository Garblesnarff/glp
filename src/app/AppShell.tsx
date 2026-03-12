import type { PropsWithChildren } from "react";
import { envReadiness } from "../config/env";
import { palette, sans } from "../lib/design-tokens";
import { useAppAuth } from "./providers/app-auth-context";
import { useMediaQuery } from "../lib/useMediaQuery";
import { NavSidebar } from "./components/NavSidebar";
import { NavBottomBar } from "./components/NavBottomBar";

export function AppShell({ children }: PropsWithChildren) {
  const auth = useAppAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Unauthenticated: passthrough — the landing page owns its own nav
  if (!auth.user) {
    return <>{children}</>;
  }

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
            ...(isMobile ? {} : { marginLeft: 240 }),
          }}
        >
          Running in local scaffold mode. Add WorkOS and Supabase env vars to enable hosted auth and cloud persistence.
        </div>
      ) : null}
      {isMobile ? <NavBottomBar /> : <NavSidebar />}
      <main
        style={{
          marginLeft: isMobile ? 0 : 240,
          paddingBottom: isMobile ? 72 : 0,
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </>
  );
}
