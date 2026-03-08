import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { font, palette, sans } from "../meal-planner/constants";
import { useProfile } from "../profile/hooks/useProfile";
import type { UserProfile } from "../../domain/types";

const restrictionOptions = ["egg-free", "gluten-free", "dairy-free", "no seafood", "no sausage"];
const shotDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useProfile();
  const [draft, setDraft] = useState<UserProfile>(profile);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveProfile(draft);
    navigate("/");
  }

  function setField<Key extends keyof UserProfile>(key: Key, value: UserProfile[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleRestriction(restriction: string) {
    setDraft((current) => ({
      ...current,
      dietaryRestrictions: current.dietaryRestrictions.includes(restriction)
        ? current.dietaryRestrictions.filter((item) => item !== restriction)
        : [...current.dietaryRestrictions, restriction],
    }));
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
          Guided Setup
        </div>
        <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0 10px", lineHeight: 1.05 }}>Set up your GLP-1 companion.</h1>
        <p style={{ fontFamily: sans, color: palette.textMuted, fontSize: 15, lineHeight: 1.6, maxWidth: 620 }}>
          This onboarding is the data foundation for the dashboard, shot-day support, symptom tracking, and prep partner workflow.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
        <Section title="Role">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <RoleButton active={draft.role === "primary"} onClick={() => setField("role", "primary")}>
              Primary user
            </RoleButton>
            <RoleButton active={draft.role === "prep_partner"} onClick={() => setField("role", "prep_partner")}>
              Prep partner
            </RoleButton>
          </div>
        </Section>

        <Section title="Profile">
          <Field label="Name">
            <input value={draft.name} onChange={(event) => setField("name", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Current weight (lbs)">
            <input
              type="number"
              min={1}
              value={draft.currentWeight}
              onChange={(event) => setField("currentWeight", Number(event.target.value))}
              style={inputStyle}
            />
          </Field>
          <Field label="Goal weight (optional)">
            <input
              type="number"
              min={1}
              value={draft.goalWeight ?? ""}
              onChange={(event) => setField("goalWeight", event.target.value ? Number(event.target.value) : undefined)}
              style={inputStyle}
            />
          </Field>
        </Section>

        <Section title="Medication">
          <Field label="Medication name">
            <input value={draft.medicationName} onChange={(event) => setField("medicationName", event.target.value)} style={inputStyle} />
          </Field>
          <Field label="Medication start date">
            <input
              type="date"
              value={draft.medicationStartDate}
              onChange={(event) => setField("medicationStartDate", event.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Shot day">
            <select value={draft.shotDay} onChange={(event) => setField("shotDay", event.target.value)} style={inputStyle}>
              {shotDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Typical supply days">
            <input
              type="number"
              min={1}
              value={draft.medicationSupplyDays}
              onChange={(event) => setField("medicationSupplyDays", Number(event.target.value))}
              style={inputStyle}
            />
          </Field>
        </Section>

        <Section title="Restrictions">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {restrictionOptions.map((restriction) => (
              <button
                key={restriction}
                type="button"
                onClick={() => toggleRestriction(restriction)}
                style={{
                  borderRadius: 999,
                  padding: "10px 14px",
                  border: `1px solid ${draft.dietaryRestrictions.includes(restriction) ? palette.accent : palette.border}`,
                  background: draft.dietaryRestrictions.includes(restriction) ? palette.accentSoft : "#fff",
                  color: draft.dietaryRestrictions.includes(restriction) ? palette.accent : palette.textMuted,
                  fontFamily: sans,
                  cursor: "pointer",
                }}
              >
                {restriction}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Prep partner">
          <Field label="Prep partner email (optional for now)">
            <input
              type="email"
              value={draft.prepPartnerEmail ?? ""}
              onChange={(event) => setField("prepPartnerEmail", event.target.value)}
              style={inputStyle}
            />
          </Field>
        </Section>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          <button type="submit" style={primaryButtonStyle}>
            Save profile
          </button>
          <Link to="/" style={secondaryLinkStyle}>
            Back to dashboard
          </Link>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ background: "#ffffffd9", border: `1px solid ${palette.border}`, borderRadius: 18, padding: 20 }}>
      <h2 style={{ fontFamily: font, fontSize: 24, margin: "0 0 14px" }}>{title}</h2>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6, fontFamily: sans, fontSize: 13, color: palette.text }}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function RoleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 14,
        padding: "12px 16px",
        border: `1px solid ${active ? palette.accent : palette.border}`,
        background: active ? palette.accentSoft : "#fff",
        color: active ? palette.accent : palette.text,
        fontFamily: sans,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  fontFamily: sans,
  fontSize: 14,
  background: "#fff",
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

const secondaryLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: `1px solid ${palette.border}`,
  borderRadius: 999,
  padding: "12px 18px",
  fontFamily: sans,
  color: palette.text,
  textDecoration: "none",
};
