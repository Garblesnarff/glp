import { palette, font, sans, radii, shadows } from "../../../lib/design-tokens";
import { useInView } from "../../../lib/useInView";
import { SectionLabel } from "../../../components/ui/SectionLabel";

const steps = [
  {
    number: "01",
    title: "Set up your profile",
    description:
      "Tell us about your medication, start date, dietary preferences, and support goals. Takes about 2 minutes.",
    image: "/images/step-onboarding.png",
  },
  {
    number: "02",
    title: "Check in daily",
    description:
      "Quick taps for appetite, symptoms, hydration, and mood. Your companion learns your patterns and adapts.",
    image: "/images/step-checkin.png",
  },
  {
    number: "03",
    title: "Get personalized support",
    description:
      "Meal recommendations, shot-day adjustments, and gentle reminders — all tuned to where you are in your journey.",
    image: "/images/step-support.png",
  },
];

export function HowItWorksSection() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      style={{
        padding: "96px 24px",
        background: "#fff",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2
            style={{
              fontFamily: font,
              fontSize: "clamp(28px, 4vw, 40px)",
              margin: "12px 0",
              color: palette.text,
              lineHeight: 1.1,
            }}
          >
            Simple, supportive, and built for you
          </h2>
        </div>
        <div style={{ display: "grid", gap: 48 }}>
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={inView ? "fade-in-up" : undefined}
              style={{
                display: "grid",
                gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr",
                gap: 48,
                alignItems: "center",
                direction: i % 2 === 1 ? "rtl" : "ltr",
                animationDelay: inView ? `${i * 0.15}s` : undefined,
                opacity: inView ? undefined : 0,
              }}
            >
              <div style={{ direction: "ltr" }}>
                <div
                  style={{
                    fontFamily: font,
                    fontSize: 48,
                    color: palette.accentLight,
                    marginBottom: 8,
                  }}
                >
                  {step.number}
                </div>
                <h3
                  style={{
                    fontFamily: font,
                    fontSize: 28,
                    margin: "0 0 12px",
                    color: palette.text,
                    lineHeight: 1.15,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: sans,
                    fontSize: 15,
                    color: palette.textMuted,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {step.description}
                </p>
              </div>
              <div style={{ direction: "ltr" }}>
                <img
                  src={step.image}
                  alt={step.title}
                  style={{
                    width: "100%",
                    maxWidth: 360,
                    borderRadius: radii.xl,
                    boxShadow: shadows.md,
                    display: "block",
                    margin: i % 2 === 1 ? "0 auto 0 0" : "0 0 0 auto",
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
