import type { CSSProperties, ReactNode } from "react";
import { palette, sans } from "../../features/meal-planner/constants";

export function StatusNotice({
  tone,
  children,
  marginBottom = 0,
}: {
  tone: "success" | "error";
  children: ReactNode;
  marginBottom?: number;
}) {
  return (
    <div role="status" aria-live="polite" style={statusNoticeStyle(tone, marginBottom)}>
      {children}
    </div>
  );
}

function statusNoticeStyle(tone: "success" | "error", marginBottom: number): CSSProperties {
  return {
    marginBottom,
    borderRadius: 14,
    padding: "12px 14px",
    background: tone === "success" ? "#f4fbf6" : "#fff4f5",
    border: `1px solid ${tone === "success" ? palette.accentLight : "#f4c2c7"}`,
    color: tone === "success" ? palette.text : palette.danger,
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 1.6,
  };
}

