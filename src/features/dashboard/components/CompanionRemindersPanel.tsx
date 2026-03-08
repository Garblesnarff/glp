import { Link } from "react-router-dom";
import { palette, sans } from "../../meal-planner/constants";
import type { CompanionReminder } from "../reminders";

export function CompanionRemindersPanel({ reminders }: { reminders: CompanionReminder[] }) {
  if (reminders.length === 0) {
    return (
      <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>
        No reminders are active right now. As more medication and symptom patterns build up, this panel will get more specific.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          style={{
            borderRadius: 14,
            border: `1px solid ${reminder.tone === "warn" ? "#f1dfb8" : palette.border}`,
            background: reminder.tone === "warn" ? "#fffaf1" : "#fff",
            padding: "12px 14px",
          }}
        >
          <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>{reminder.title}</div>
          <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted, lineHeight: 1.6, marginTop: 6 }}>{reminder.body}</div>
          {reminder.link ? (
            <div style={{ marginTop: 10 }}>
              <Link to={reminder.link.to} style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: palette.accent, textDecoration: "none" }}>
                {reminder.link.label} →
              </Link>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
