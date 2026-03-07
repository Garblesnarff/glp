import { palette, sans } from "../../meal-planner/constants";
import { appetiteLabel } from "../support";
import type { AppetiteLevel, DailyLog, Severity, SymptomType } from "../../../domain/types";

const appetiteOptions: AppetiteLevel[] = ["none", "low", "normal"];
const symptomOrder: SymptomType[] = ["nausea", "fullness", "constipation", "diarrhea", "reflux", "stomachPain", "fatigue", "injectionSite"];
const severityOptions: Severity[] = ["none", "mild", "moderate", "severe"];

export function QuickCheckInCard({
  log,
  onSetAppetite,
  onSetSymptom,
}: {
  log: DailyLog;
  onSetAppetite: (value: AppetiteLevel) => void;
  onSetSymptom: (symptom: SymptomType, severity: Severity) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={labelStyle}>Appetite today</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {appetiteOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSetAppetite(option)}
              style={chipStyle(log.appetiteLevel === option)}
            >
              {appetiteLabel(option)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={labelStyle}>Symptoms</div>
        <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
          {symptomOrder.map((symptom) => (
            <div key={symptom} style={{ display: "grid", gap: 6 }}>
              <div style={{ fontFamily: sans, fontSize: 13, color: palette.text }}>
                {formatSymptomLabel(symptom)}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {severityOptions.map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    onClick={() => onSetSymptom(symptom, severity)}
                    style={severityStyle(log.symptoms[symptom] === severity, severity)}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatSymptomLabel(symptom: SymptomType) {
  switch (symptom) {
    case "stomachPain":
      return "Stomach pain";
    case "injectionSite":
      return "Injection-site reaction";
    default:
      return `${symptom.charAt(0).toUpperCase()}${symptom.slice(1)}`;
  }
}

function chipStyle(active: boolean) {
  return {
    borderRadius: 999,
    padding: "8px 12px",
    border: `1px solid ${active ? palette.accent : palette.border}`,
    background: active ? palette.accentSoft : "#fff",
    color: active ? palette.accent : palette.textMuted,
    fontFamily: sans,
    cursor: "pointer",
  };
}

function severityStyle(active: boolean, severity: Severity) {
  const danger = severity === "severe";

  return {
    borderRadius: 999,
    padding: "6px 10px",
    border: `1px solid ${active ? (danger ? palette.danger : palette.accent) : palette.border}`,
    background: active ? (danger ? "#ffe8eb" : palette.accentSoft) : "#fff",
    color: active ? (danger ? palette.danger : palette.accent) : palette.textMuted,
    fontFamily: sans,
    fontSize: 12,
    cursor: "pointer",
    textTransform: "capitalize" as const,
  };
}

const labelStyle = {
  fontFamily: sans,
  fontSize: 12,
  textTransform: "uppercase" as const,
  letterSpacing: 1.2,
  color: palette.textMuted,
};
