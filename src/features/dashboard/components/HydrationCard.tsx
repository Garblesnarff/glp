import { palette, sans } from "../../meal-planner/constants";

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
          <button
            key={ounces}
            type="button"
            onClick={() => onAddWater(ounces)}
            style={{
              borderRadius: 999,
              padding: "10px 14px",
              border: `1px solid ${palette.border}`,
              background: "#fff",
              color: palette.text,
              fontFamily: sans,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            +{ounces} oz
          </button>
        ))}
      </div>
    </div>
  );
}
