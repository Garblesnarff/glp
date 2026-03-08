import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { font, palette, sans } from "../meal-planner/constants";
import { DashboardPanel } from "../dashboard/components/DashboardPanel";
import { useProfile } from "../profile/hooks/useProfile";
import { getWeightTrendSummary } from "./weight";
import type { WeightLog } from "../../domain/types";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function WeightPage() {
  const { profile, recentLogs, weightLogs, saveWeightLog, isLoading } = useProfile();
  const [weight, setWeight] = useState(String(profile.currentWeight || ""));
  const [waist, setWaist] = useState("");
  const [clothesFit, setClothesFit] = useState<WeightLog["clothesFit"]>("same");
  const [note, setNote] = useState("");

  const summary = useMemo(() => getWeightTrendSummary(weightLogs, recentLogs), [weightLogs, recentLogs]);

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading weight tracking...</div>;
  }

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Weight Context
          </div>
          <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0 8px", lineHeight: 1.05 }}>
            Track progress without making the scale the hero.
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, lineHeight: 1.6, maxWidth: 660, margin: 0 }}>
            This screen keeps weight in context with hydration, protein consistency, waist change, and how clothes fit. The goal is better framing, not more scale anxiety.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/" style={secondaryLinkStyle}>Back to dashboard</Link>
          <Link to="/history" style={secondaryLinkStyle}>Open recent history</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <DashboardPanel title="Log a weigh-in">
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Weight (lbs)">
              <input value={weight} onChange={(event) => setWeight(event.target.value)} style={inputStyle} inputMode="decimal" />
            </Field>
            <Field label="Waist (optional inches)">
              <input value={waist} onChange={(event) => setWaist(event.target.value)} style={inputStyle} inputMode="decimal" />
            </Field>
            <Field label="How do clothes fit?">
              <select value={clothesFit ?? "same"} onChange={(event) => setClothesFit(event.target.value as WeightLog["clothesFit"])} style={inputStyle}>
                <option value="looser">Looser</option>
                <option value="same">Same</option>
                <option value="tighter">Tighter</option>
              </select>
            </Field>
            <Field label="Note (optional)">
              <textarea value={note} onChange={(event) => setNote(event.target.value)} style={{ ...inputStyle, minHeight: 88, resize: "vertical" }} />
            </Field>
            <button
              onClick={() => {
                const parsedWeight = Number(weight);
                if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
                  return;
                }
                void saveWeightLog({
                  id: `weight:${todayIsoDate()}`,
                  date: todayIsoDate(),
                  weight: parsedWeight,
                  waistInches: waist ? Number(waist) : undefined,
                  clothesFit,
                  note: note || undefined,
                });
              }}
              style={primaryButtonStyle}
            >
              Save weigh-in
            </button>
          </div>
        </DashboardPanel>

        <DashboardPanel title="Keep it in context">
          <div style={{ display: "grid", gap: 10 }}>
            <MetricRow label="Current profile weight" value={`${profile.currentWeight} lbs`} />
            <MetricRow label="Goal weight" value={profile.goalWeight ? `${profile.goalWeight} lbs` : "Not set"} />
            <MetricRow label="Hydration consistency" value={`${summary.hydrationDays}/7 days at 64+ oz`} />
            <MetricRow label="Protein consistency" value={`${summary.proteinDays}/7 days at 100+ g`} />
            <div style={contextBoxStyle}>{summary.framing}</div>
          </div>
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Recent trend">
          <div style={{ display: "grid", gap: 10 }}>
            {summary.latest ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <MetricCard label="Latest weigh-in" value={`${summary.latest.weight} lbs`} detail={summary.latest.date} />
                <MetricCard label="Change from last" value={summary.delta === null ? "Not enough data" : `${summary.delta > 0 ? "+" : ""}${summary.delta} lbs`} detail="Newest vs previous log" />
                <MetricCard label="Waist" value={summary.latest.waistInches ? `${summary.latest.waistInches} in` : "Not logged"} detail="Optional context" />
                <MetricCard label="Clothes fit" value={summary.latest.clothesFit ? capitalize(summary.latest.clothesFit) : "Not logged"} detail="Qualitative signal" />
              </div>
            ) : (
              <div style={{ fontFamily: sans, color: palette.textMuted }}>No weigh-ins logged yet.</div>
            )}
            <div style={{ display: "grid", gap: 8 }}>
              {weightLogs.map((entry) => (
                <div key={entry.id} style={logRowStyle}>
                  <div>
                    <div style={{ fontFamily: sans, fontWeight: 700, color: palette.text }}>{entry.weight} lbs</div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
                      {entry.date}
                      {entry.waistInches ? ` · ${entry.waistInches} in waist` : ""}
                      {entry.clothesFit ? ` · ${capitalize(entry.clothesFit)} fit` : ""}
                    </div>
                  </div>
                  {entry.note ? <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, maxWidth: 320 }}>{entry.note}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </DashboardPanel>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, color: palette.text }}>{label}</span>
      {children}
    </label>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: `1px solid ${palette.border}`, paddingBottom: 8 }}>
      <div style={{ fontFamily: sans, color: palette.textMuted }}>{label}</div>
      <div style={{ fontFamily: sans, fontWeight: 700, color: palette.text }}>{value}</div>
    </div>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div style={{ borderRadius: 14, border: `1px solid ${palette.border}`, background: "#fff", padding: "12px 14px" }}>
      <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: palette.textMuted }}>{label}</div>
      <div style={{ fontFamily: sans, fontWeight: 700, marginTop: 6, color: palette.text }}>{value}</div>
      <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>{detail}</div>
    </div>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  padding: "10px 12px",
  fontFamily: sans,
  fontSize: 14,
  background: "#fff",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "12px 16px",
  background: palette.accent,
  color: "#fff",
  fontFamily: sans,
  fontWeight: 700,
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

const contextBoxStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#f7faf7",
  border: `1px solid ${palette.border}`,
  fontFamily: sans,
  fontSize: 13,
  color: palette.text,
  lineHeight: 1.6,
};

const logRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "10px 12px",
};
