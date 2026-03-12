import { Button } from "../../../components/ui/Button";
import { palette, sans } from "../../../lib/design-tokens";

const increments = [8, 12, 16];

export function HydrationCard({
  hydrationOz,
  hydrationGoal,
  statusMessage,
  onAddWater,
}: {
  hydrationOz: number;
  hydrationGoal: number;
  statusMessage: string;
  onAddWater: (ounces: number) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontFamily: sans, fontWeight: 700, color: palette.text }}>{hydrationOz} oz logged</div>
        <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted, marginTop: 4 }}>
          Goal: {hydrationGoal} oz. {statusMessage}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {increments.map((ounces) => (
          <Button key={ounces} variant="secondary" onClick={() => onAddWater(ounces)} style={{ padding: "10px 14px" }}>
            +{ounces} oz
          </Button>
        ))}
      </div>
    </div>
  );
}
