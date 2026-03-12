import { palette, font, sans, radii, shadows, transitions } from "../../../lib/design-tokens";
import { useInView } from "../../../lib/useInView";
import { SectionLabel } from "../../../components/ui/SectionLabel";

const features = [
  {
    icon: "/images/icon-symptoms.png",
    title: "Symptom Tracking",
    description: "Log nausea, fatigue, and 6 other symptoms with severity levels. Your dashboard adapts meal suggestions based on how you feel.",
  },
  {
    icon: "/images/icon-meals.png",
    title: "Meal Planning",
    description: "GLP-1 aware recipes with protein targets, fiber ramp schedules, and portion guidance that respects your changing appetite.",
  },
  {
    icon: "/images/icon-hydration.png",
    title: "Hydration Tracking",
    description: "Quick-log water intake with personalized goals. Especially important on shot days when dehydration risk increases.",
  },
  {
    icon: "/images/icon-shot-day.png",
    title: "Shot Day Intelligence",
    description: "Automatic gentle-food suggestions and adjusted targets when your injection day arrives. Your companion knows your schedule.",
  },
  {
    icon: "/images/icon-partner.png",
    title: "Partner Workspace",
    description: "Invite a prep partner who can see your needs, get alerts on rough days, and help with meal prep without the awkward conversations.",
  },
  {
    icon: "/images/icon-emergency.png",
    title: "Emergency Support",
    description: "Rough day? Get immediate gentle-food suggestions, red-flag symptom guidance, and one-tap partner notifications.",
  },
];

export function FeaturesSection() {
  const { ref, inView } = useInView();

  return (
    <section
      ref={ref}
      style={{
        padding: "96px 24px",
        background: palette.bg,
      }}
    >
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel>Everything You Need</SectionLabel>
          <h2
            style={{
              fontFamily: font,
              fontSize: "clamp(28px, 4vw, 40px)",
              margin: "12px 0 16px",
              color: palette.text,
              lineHeight: 1.1,
            }}
          >
            Built for life on GLP-1 medications
          </h2>
          <p
            style={{
              fontFamily: sans,
              fontSize: 16,
              color: palette.textMuted,
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Every feature is designed around the real challenges people face — not generic fitness tracking.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={inView ? "fade-in-up" : undefined}
              style={{
                background: "#fff",
                border: `1px solid ${palette.border}`,
                borderRadius: radii.lg,
                padding: 28,
                transition: `transform ${transitions.fast}, box-shadow ${transitions.fast}`,
                animationDelay: inView ? `${i * 0.08}s` : undefined,
                opacity: inView ? undefined : 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = shadows.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img
                src={feature.icon}
                alt=""
                style={{ width: 56, height: 56, borderRadius: radii.md, marginBottom: 16 }}
                loading="lazy"
              />
              <h3
                style={{
                  fontFamily: sans,
                  fontSize: 18,
                  fontWeight: 700,
                  margin: "0 0 8px",
                  color: palette.text,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontFamily: sans,
                  fontSize: 14,
                  color: palette.textMuted,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
