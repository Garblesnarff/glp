import { palette, sans } from "../constants";
import type { PlannerTab } from "../types";

export function TabButton({
  id,
  label,
  icon,
  activeTab,
  onSelect,
}: {
  id: PlannerTab;
  label: string;
  icon: string;
  activeTab: PlannerTab;
  onSelect: (id: PlannerTab) => void;
}) {
  return (
    <button
      onClick={() => onSelect(id)}
      style={{
        flex: 1,
        padding: "10px 0",
        fontFamily: sans,
        fontSize: 12,
        fontWeight: 600,
        border: "none",
        borderBottom: activeTab === id ? `2.5px solid ${palette.accent}` : "2.5px solid transparent",
        background: "none",
        color: activeTab === id ? palette.accent : palette.textMuted,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {icon} {label}
    </button>
  );
}
