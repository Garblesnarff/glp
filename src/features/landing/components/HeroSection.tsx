import { palette, font, sans, shadows, radii } from "../../../lib/design-tokens";
import { useAppAuth } from "../../../app/providers/app-auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { SectionLabel } from "../../../components/ui/SectionLabel";

export function HeroSection() {
  const auth = useAppAuth();
  const navigate = useNavigate();

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        background: palette.gradientHero,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
        }}
      >
        <div>
          <SectionLabel>Your GLP-1 Journey</SectionLabel>
          <h1
            style={{
              fontFamily: font,
              fontSize: "clamp(36px, 5vw, 56px)",
              lineHeight: 1.02,
              margin: "16px 0 20px",
              color: palette.text,
            }}
          >
            Nourishment that meets you where you are
          </h1>
          <p
            style={{
              fontFamily: sans,
              fontSize: 17,
              lineHeight: 1.7,
              color: palette.textMuted,
              maxWidth: 520,
              margin: "0 0 32px",
            }}
          >
            Symptom-aware meal planning, daily check-ins, hydration tracking, and
            gentle support — designed around how GLP-1 medications actually change
            your relationship with food.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {auth.user ? (
              <Button onClick={() => navigate("/dashboard")} style={{ padding: "16px 28px", fontSize: 16 }}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button onClick={() => void auth.signUp()} style={{ padding: "16px 28px", fontSize: 16 }}>
                  Get Started Free
                </Button>
                <Button variant="secondary" onClick={() => void auth.signIn()} style={{ padding: "16px 28px", fontSize: 16 }}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
        <div
          style={{
            borderRadius: radii.xl,
            overflow: "hidden",
            boxShadow: shadows.lg,
          }}
        >
          <img
            src="/images/hero.png"
            alt="Person preparing a healthy meal"
            style={{ width: "100%", height: "auto", display: "block" }}
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
