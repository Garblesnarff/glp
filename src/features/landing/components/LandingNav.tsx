import { useState, useEffect } from "react";
import { palette, font, shadows, transitions } from "../../../lib/design-tokens";
import { useAppAuth } from "../../../app/providers/app-auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";

export function LandingNav() {
  const auth = useAppAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: `all ${transitions.normal}`,
        background: scrolled ? "#ffffffd9" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${palette.border}` : "1px solid transparent",
        boxShadow: scrolled ? shadows.sm : "none",
      }}
    >
      <div style={{ fontFamily: font, fontSize: 20, color: palette.text, fontWeight: 400 }}>
        GLP-1 Companion
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {auth.user ? (
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={() => void auth.signIn()} style={{ color: palette.text }}>
              Sign in
            </Button>
            <Button onClick={() => void auth.signUp()}>Get Started</Button>
          </>
        )}
      </div>
    </nav>
  );
}
