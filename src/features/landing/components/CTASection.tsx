import { palette, font, sans } from "../../../lib/design-tokens";
import { useAppAuth } from "../../../app/providers/app-auth-context";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";

export function CTASection() {
  const auth = useAppAuth();
  const navigate = useNavigate();

  return (
    <section
      style={{
        background: palette.accent,
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: font,
            fontSize: "clamp(28px, 4vw, 40px)",
            color: "#fff",
            margin: "0 0 16px",
            lineHeight: 1.1,
          }}
        >
          Start feeling supported today
        </h2>
        <p
          style={{
            fontFamily: sans,
            fontSize: 16,
            color: palette.accentLight,
            lineHeight: 1.6,
            margin: "0 0 32px",
          }}
        >
          No judgment, no calorie counting guilt. Just practical, compassionate support for your GLP-1 journey.
        </p>
        {auth.user ? (
          <Button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "#fff",
              color: palette.accent,
              padding: "16px 32px",
              fontSize: 16,
            }}
          >
            Go to Dashboard
          </Button>
        ) : (
          <Button
            onClick={() => void auth.signUp()}
            style={{
              background: "#fff",
              color: palette.accent,
              padding: "16px 32px",
              fontSize: 16,
            }}
          >
            Create Your Free Account
          </Button>
        )}
        <p
          style={{
            fontFamily: sans,
            fontSize: 13,
            color: palette.accentLight,
            marginTop: 16,
            opacity: 0.8,
          }}
        >
          Free to use. Your data stays private. No spam.
        </p>
      </div>
    </section>
  );
}
