import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { font, palette, sans } from "../meal-planner/constants";
import { useProfile } from "../profile/hooks/useProfile";
import { DashboardPanel } from "../dashboard/components/DashboardPanel";
import { getCompanionReminders } from "../dashboard/reminders";
import { CompanionRemindersPanel } from "../dashboard/components/CompanionRemindersPanel";

const shotDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const injectionSites = ["Left abdomen", "Right abdomen", "Left thigh", "Right thigh", "Left arm", "Right arm"];

type MedicationDraft = {
  medication: string;
  dose: string;
  shotDay: string;
  injectionSite: string;
  date: string;
  status: "completed" | "delayed" | "missed";
  isDoseIncrease: boolean;
  notes: string;
};

export function MedicationTimelinePage() {
  const { profile, medicationLogs, saveMedicationLog, recentLogs, todayLog, isLoading } = useProfile();
  const [draft, setDraft] = useState<MedicationDraft>({
    medication: profile.medicationName,
    dose: "",
    shotDay: profile.shotDay,
    injectionSite: injectionSites[0],
    date: new Date().toISOString().slice(0, 10),
    status: "completed" as const,
    isDoseIncrease: false,
    notes: "",
  });

  const latestLog = medicationLogs[0] ?? null;
  const symptomDays = recentLogs.filter((log) => Object.values(log.symptoms).some((severity) => severity !== "none")).length;
  const doseIncreaseCount = medicationLogs.filter((log) => log.isDoseIncrease).length;
  const delayedOrMissedCount = medicationLogs.filter((log) => log.status === "delayed" || log.status === "missed").length;
  const nextSuggestedSite = useMemo(() => getNextInjectionSite(latestLog?.injectionSite), [latestLog?.injectionSite]);
  const reminders = getCompanionReminders(profile, todayLog, recentLogs, medicationLogs);

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading medication timeline...</div>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await saveMedicationLog({
      id: crypto.randomUUID(),
      medication: draft.medication || profile.medicationName,
      dose: draft.dose,
      shotDay: draft.shotDay,
      injectionSite: draft.injectionSite,
      date: draft.date,
      status: draft.status,
      isDoseIncrease: draft.isDoseIncrease,
      notes: draft.notes || undefined,
    });

    setDraft((current) => ({
      ...current,
      dose: "",
      date: new Date().toISOString().slice(0, 10),
      status: "completed",
      isDoseIncrease: false,
      notes: "",
      injectionSite: nextSuggestedSite,
    }));
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Medication Timeline
          </div>
          <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0 8px", lineHeight: 1.05 }}>
            Log shots, doses, and escalation weeks.
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
            This is the first timeline surface for dose changes, injection-site rotation, and missed or delayed shots. It sets up the correlation work between medication changes and symptoms.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/" style={secondaryLinkStyle}>
            Back to dashboard
          </Link>
          <Link to="/history" style={secondaryLinkStyle}>
            View history
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginTop: 22 }}>
        <SummaryCard label="Current medication" value={profile.medicationName || "Not set"} detail={`Shot day: ${profile.shotDay}`} />
        <SummaryCard label="Latest dose" value={latestLog?.dose ?? "None logged"} detail={latestLog ? latestLog.date : "No injections logged yet"} />
        <SummaryCard label="Dose increases" value={`${doseIncreaseCount}`} detail="Logged escalation events" />
        <SummaryCard label="Rough symptom days" value={`${symptomDays}/7`} detail="Recent symptom context" />
        <SummaryCard label="Delayed or missed" value={`${delayedOrMissedCount}`} detail="Shot adherence alerts" />
        <SummaryCard label="Next site rotation" value={nextSuggestedSite} detail="Simple injection-site rotation prompt" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <DashboardPanel title="Log injection">
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <Field label="Medication">
              <input value={draft.medication} onChange={(event) => setDraft((current) => ({ ...current, medication: event.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Dose">
              <input value={draft.dose} onChange={(event) => setDraft((current) => ({ ...current, dose: event.target.value }))} placeholder="e.g. 0.5 mg" style={inputStyle} />
            </Field>
            <Field label="Date">
              <input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Shot day">
              <select value={draft.shotDay} onChange={(event) => setDraft((current) => ({ ...current, shotDay: event.target.value }))} style={inputStyle}>
                {shotDays.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Injection site">
              <select value={draft.injectionSite} onChange={(event) => setDraft((current) => ({ ...current, injectionSite: event.target.value }))} style={inputStyle}>
                {injectionSites.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as "completed" | "delayed" | "missed" }))}
                style={inputStyle}
              >
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="missed">Missed</option>
              </select>
            </Field>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={draft.isDoseIncrease}
                onChange={(event) => setDraft((current) => ({ ...current, isDoseIncrease: event.target.checked }))}
              />
              <span>This was a dose increase week</span>
            </label>
            <Field label="Notes">
              <textarea value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} rows={4} style={textareaStyle} />
            </Field>
            <button type="submit" style={primaryButtonStyle}>
              Save medication log
            </button>
          </form>
        </DashboardPanel>

        <DashboardPanel title="Timeline">
          {medicationLogs.length === 0 ? (
            <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>
              No medication logs yet. Start with the most recent shot so dose changes and rough weeks can be tracked over time.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {medicationLogs.map((log) => (
                <div key={log.id} style={timelineRowStyle}>
                  <div>
                    <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>
                      {log.medication} · {log.dose}
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
                      {log.date} · {log.shotDay} · {log.injectionSite}
                    </div>
                    {log.notes ? <div style={{ fontFamily: sans, fontSize: 12, color: palette.text, marginTop: 6 }}>{log.notes}</div> : null}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span style={statusBadgeStyle(log.status ?? "completed")}>{capitalize(log.status ?? "completed")}</span>
                    {log.isDoseIncrease ? <span style={doseIncreaseBadgeStyle}>Dose increase</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title="Medication companion reminders">
          <CompanionRemindersPanel reminders={reminders.filter((reminder) => reminder.link?.to === "/medication" || reminder.id === "shot-prep")} />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, fontFamily: sans, fontSize: 13, color: palette.text }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function getNextInjectionSite(current?: string) {
  if (!current) {
    return injectionSites[0];
  }

  const currentIndex = injectionSites.indexOf(current);
  if (currentIndex === -1) {
    return injectionSites[0];
  }

  return injectionSites[(currentIndex + 1) % injectionSites.length];
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

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

const inputStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  fontFamily: sans,
  fontSize: 14,
  background: "#fff",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontFamily: sans,
  fontSize: 13,
  color: palette.text,
};

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

const timelineRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "12px 14px",
};

function statusBadgeStyle(status: "completed" | "delayed" | "missed"): CSSProperties {
  return {
    borderRadius: 999,
    padding: "6px 10px",
    background: status === "completed" ? "#f4fbf6" : status === "delayed" ? "#fff8ec" : "#fff4f5",
    border: `1px solid ${status === "completed" ? palette.accentLight : status === "delayed" ? "#f1dfb8" : "#f4c2c7"}`,
    color: status === "completed" ? palette.accent : status === "delayed" ? palette.text : palette.danger,
    fontFamily: sans,
    fontSize: 12,
    fontWeight: 700,
  };
}

const doseIncreaseBadgeStyle: CSSProperties = {
  borderRadius: 999,
  padding: "6px 10px",
  background: "#eef5ff",
  border: "1px solid #c6daf8",
  color: "#244a7c",
  fontFamily: sans,
  fontSize: 12,
  fontWeight: 700,
};
