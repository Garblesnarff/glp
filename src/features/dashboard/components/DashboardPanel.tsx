import type { ReactNode } from "react";
import { Card } from "../../../components/ui/Card";
import { font, radii } from "../../../lib/design-tokens";

export function DashboardPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card variant="elevated" padding={24} style={{ borderRadius: radii.xl }}>
      <h2 style={{ fontFamily: font, fontSize: 26, margin: "0 0 14px" }}>{title}</h2>
      {children}
    </Card>
  );
}
