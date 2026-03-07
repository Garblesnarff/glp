import { font, palette, sans } from "../../features/meal-planner/constants";

export function AuthStatusPage({ title, body }: { title: string; body: string }) {
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
