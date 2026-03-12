import { palette, sans, font } from "../../../lib/design-tokens";

const metrics = [
  { value: "1,200+", label: "Meals planned" },
  { value: "14", label: "Features" },
  { value: "8", label: "Symptom types tracked" },
  { value: "24/7", label: "Gentle support" },
];

export function SocialProofBar() {
  return (
    <section
      style={{
        background: palette.accentDark,
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          textAlign: "center",
        }}
      >
        {metrics.map((m) => (
          <div key={m.label}>
            <div style={{ fontFamily: font, fontSize: 32, color: "#fff", marginBottom: 4 }}>
              {m.value}
            </div>
            <div style={{ fontFamily: sans, fontSize: 13, color: palette.accentLight, letterSpacing: 1 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
