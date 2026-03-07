import type { ReactNode } from "react";
import { font, palette } from "../../meal-planner/constants";

export function DashboardPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ background: "#ffffffdb", border: `1px solid ${palette.border}`, borderRadius: 18, padding: 20 }}>
      <h2 style={{ fontFamily: font, fontSize: 26, margin: "0 0 14px" }}>{title}</h2>
      {children}
    </section>
  );
}
