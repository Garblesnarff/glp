import { Card } from "../../../components/ui/Card";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { font, palette, sans } from "../../../lib/design-tokens";

export function DashboardMetricCard({
  title,
  value,
  detail,
  progress,
}: {
  title: string;
  value: string;
  detail: string;
  progress?: number;
}) {
  return (
    <Card
      variant="elevated"
      padding={18}
      style={{ borderTop: `3px solid ${palette.accentLight}` }}
    >
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: palette.textMuted }}>{title}</div>
      <div style={{ fontFamily: font, fontSize: 30, margin: "8px 0 6px" }}>{value}</div>
      <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>{detail}</div>
      {typeof progress === "number" ? (
        <ProgressBar value={progress} style={{ marginTop: 14 }} />
      ) : null}
    </Card>
  );
}
