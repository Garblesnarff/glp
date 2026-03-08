import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { DashboardPanel } from "../dashboard/components/DashboardPanel";
import { font, palette, sans } from "../meal-planner/constants";
import { useNotificationCenter } from "./hooks/useNotificationCenter";

export function NotificationsPage() {
  const { deliveries, isLoading, runDeliveryCycle, acknowledgeDelivery } = useNotificationCenter();
  const [running, setRunning] = useState(false);

  async function handleRunCycle() {
    setRunning(true);
    try {
      await runDeliveryCycle();
    } finally {
      setRunning(false);
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Notification Inbox
          </div>
          <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0 8px", lineHeight: 1.05 }}>
            Delivered companion reminders.
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
            This is the in-app delivery surface behind the new notification worker foundation. Scheduled jobs land here once a delivery cycle runs.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => void handleRunCycle()} style={primaryButtonStyle} disabled={running}>
            {running ? "Running delivery cycle..." : "Run delivery cycle"}
          </button>
          <Link to="/medication" style={secondaryLinkStyle}>
            Reminder settings
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 22 }}>
        <SummaryCard label="Delivered" value={`${deliveries.length}`} detail="Total inbox items" />
        <SummaryCard
          label="New"
          value={`${deliveries.filter((delivery) => delivery.status === "new").length}`}
          detail="Still unacknowledged"
        />
        <SummaryCard
          label="Latest delivery"
          value={deliveries[0] ? formatDateTime(deliveries[0].deliveredAt) : "None yet"}
          detail="Most recent execution"
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Inbox">
          {isLoading ? (
            <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>Loading inbox...</div>
          ) : deliveries.length === 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>
                No delivered reminders yet. Use the medication page to refresh scheduled jobs, then run a delivery cycle here or via the Bun worker.
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to="/medication" style={secondaryLinkStyle}>
                  Open medication timeline
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {deliveries.map((delivery) => (
                <div key={delivery.id} style={deliveryRowStyle(delivery.status === "new")}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 700, color: palette.text }}>{delivery.title}</div>
                      <span style={statusBadgeStyle(delivery.status)}>{delivery.status === "new" ? "New" : "Acknowledged"}</span>
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted }}>
                      {formatDateTime(delivery.deliveredAt)} · {delivery.channel}
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 13, color: palette.text, lineHeight: 1.6 }}>{delivery.body}</div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {delivery.linkTo ? (
                      <Link to={delivery.linkTo} style={secondaryLinkStyle}>
                        Open related page
                      </Link>
                    ) : null}
                    {delivery.status === "new" ? (
                      <button type="button" onClick={() => void acknowledgeDelivery(delivery.id)} style={secondaryButtonStyle}>
                        Mark reviewed
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${palette.border}`, background: "#fff", padding: "12px 14px" }}>
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: palette.textMuted }}>{label}</div>
      <div style={{ fontFamily: sans, fontWeight: 700, marginTop: 6, color: palette.text }}>{value}</div>
      <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function deliveryRowStyle(isNew: boolean): CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
    borderRadius: 12,
    border: `1px solid ${isNew ? palette.accentLight : palette.border}`,
    background: isNew ? "#f7fbf8" : "#fff",
    padding: "14px 16px",
  };
}

function statusBadgeStyle(status: "new" | "acknowledged"): CSSProperties {
  return {
    borderRadius: 999,
    padding: "5px 10px",
    background: status === "new" ? palette.accentSoft : "#f5f5f5",
    border: `1px solid ${status === "new" ? palette.accentLight : palette.border}`,
    color: status === "new" ? palette.accent : palette.textMuted,
    fontFamily: sans,
    fontSize: 12,
    fontWeight: 700,
  };
}

const primaryButtonStyle: CSSProperties = {
  background: palette.accent,
  color: "#fff",
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  fontFamily: sans,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  background: "#fff",
  color: palette.text,
  border: `1px solid ${palette.border}`,
  borderRadius: 999,
  padding: "11px 16px",
  fontFamily: sans,
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  border: `1px solid ${palette.border}`,
  color: palette.text,
  textDecoration: "none",
  padding: "11px 16px",
  fontFamily: sans,
  fontWeight: 600,
};
