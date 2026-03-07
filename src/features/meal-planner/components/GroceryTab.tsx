import { font, palette, sans } from "../constants";
import type { GroceryListItem, GroceryState } from "../types";

export function GroceryTab({
  groceryList,
  groceryChecked,
  onToggleGrocery,
}: {
  groceryList: GroceryListItem[];
  groceryChecked: GroceryState;
  onToggleGrocery: (item: string) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: font, fontSize: 20, margin: 0 }}>Grocery List</h2>
        <span style={{ fontSize: 12, fontFamily: sans, color: palette.textMuted }}>
          {groceryList.filter((item) => groceryChecked[item.text]).length}/{groceryList.length} items
        </span>
      </div>

      {groceryList.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: palette.textMuted, fontFamily: sans }}>
          Add meals to your weekly plan to generate a grocery list
        </div>
      ) : (
        <div style={{ display: "grid", gap: 4 }}>
          {groceryList.map((item) => (
            <div
              key={item.text}
              onClick={() => onToggleGrocery(item.text)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: palette.card,
                borderRadius: 8,
                border: `1px solid ${palette.border}`,
                cursor: "pointer",
                opacity: groceryChecked[item.text] ? 0.5 : 1,
                textDecoration: groceryChecked[item.text] ? "line-through" : "none",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  flexShrink: 0,
                  border: `2px solid ${groceryChecked[item.text] ? palette.accent : palette.border}`,
                  background: groceryChecked[item.text] ? palette.accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 12,
                }}
              >
                {groceryChecked[item.text] ? "✓" : ""}
              </div>
              <span style={{ fontFamily: sans, fontSize: 13, flex: 1 }}>{item.text}</span>
              {item.count > 1 ? <span style={{ fontSize: 11, color: palette.textMuted, fontFamily: sans }}>×{item.count}</span> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
