import { palette, sans } from "../../../lib/design-tokens";

export function FooterSection() {
  return (
    <footer
      style={{
        background: palette.bg,
        borderTop: `1px solid ${palette.border}`,
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>
          © {new Date().getFullYear()} GLP-1 Companion. Built with care.
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <span style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>Privacy</span>
          <span style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>Terms</span>
          <span style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>Support</span>
        </div>
      </div>
    </footer>
  );
}
