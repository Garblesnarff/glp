import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { secondaryLinkStyle } from "../components/ui/styles";
import { font, palette, sans } from "../features/meal-planner/constants";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled app error", error, errorInfo);
  }

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

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
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            borderRadius: 20,
            padding: 28,
            border: `1px solid ${palette.border}`,
            background: "#ffffffd9",
            boxShadow: "0 18px 40px rgba(0,0,0,0.07)",
          }}
        >
          <div style={{ fontFamily: sans, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: palette.danger }}>
            App Error
          </div>
          <h1 style={{ fontFamily: font, fontSize: 34, lineHeight: 1.05, margin: "10px 0 12px", color: palette.text }}>
            Something went wrong.
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, lineHeight: 1.6, color: palette.textMuted, margin: 0 }}>
            The app hit an unexpected error. Refresh the page to try again. If this keeps happening, use the dashboard link below after reload and check the last action that triggered it.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "12px 18px",
                background: palette.accent,
                color: "#fff",
                fontFamily: sans,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Refresh app
            </button>
            <Link to="/" style={secondaryLinkStyle}>
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
