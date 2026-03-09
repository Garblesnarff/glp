import type { CSSProperties, FormEvent } from "react";
import { Link } from "react-router-dom";
import type { AccountMembership, AppetiteLevel, PartnerInvite, SupportAlert } from "../../../domain/types";
import type { Recipe } from "../../meal-planner/types";
import { DashboardPanel } from "../../dashboard/components/DashboardPanel";
import { RecipeCard } from "../../meal-planner/components/RecipeCard";
import { palette, sans } from "../../meal-planner/constants";
import { inputStyle, primaryButtonStyle, secondaryLinkStyle } from "../../../components/ui/styles";

export function HouseholdLinkNotice({
  linkedMessage,
}: {
  linkedMessage: string | null;
}) {
  if (!linkedMessage) {
    return null;
  }

  return <div style={{ ...linkStateStyle, marginTop: 18 }}>{linkedMessage}</div>;
}

export function ConnectedHouseholdPanel({
  linkedContextName,
  onLeaveHousehold,
}: {
  linkedContextName?: string;
  onLeaveHousehold: () => void;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <DashboardPanel title="Connected household">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontFamily: sans, fontSize: 14, color: palette.textMuted, lineHeight: 1.7 }}>
            {linkedContextName
              ? `You are connected to ${linkedContextName} as a prep partner.`
              : "You are linked as a prep partner, but the household context looks incomplete."}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/planner" style={secondaryLinkStyle}>
              Open shared planner
            </Link>
            <button onClick={onLeaveHousehold} style={revokeButtonStyle}>
              Leave household link
            </button>
          </div>
        </div>
      </DashboardPanel>
    </div>
  );
}

export function IncomingInvitesPanel({
  invites,
  onAccept,
  onDecline,
}: {
  invites: PartnerInvite[];
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
}) {
  if (invites.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <DashboardPanel title="Incoming partner invites">
        <div style={{ display: "grid", gap: 10 }}>
          {invites.map((invite) => (
            <div key={invite.id} style={inviteRowStyle}>
              <div>
                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>{invite.invitedEmail}</div>
                <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 3 }}>
                  Pending invite · {formatInviteDate(invite.createdAt)} · Accepting this will join the shared household.
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => onAccept(invite.id)} style={primaryButtonStyle}>
                  Accept invite
                </button>
                <button onClick={() => onDecline(invite.id)} style={revokeButtonStyle}>
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}

export function SupportAlertsPanel({
  alerts,
  onResolve,
}: {
  alerts: SupportAlert[];
  onResolve: (alertId: string) => void;
}) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <DashboardPanel title="Support alerts">
        <div style={{ display: "grid", gap: 10 }}>
          {alerts.map((alert) => (
            <div key={alert.id} style={alertRowStyle}>
              <div>
                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>
                  Rough day support requested
                </div>
                <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
                  {formatInviteDate(alert.createdAt)}
                </div>
                {alert.note ? (
                  <div style={{ fontFamily: sans, fontSize: 12, color: palette.text, marginTop: 6, lineHeight: 1.5 }}>{alert.note}</div>
                ) : null}
              </div>
              <button onClick={() => onResolve(alert.id)} style={primaryButtonStyle}>
                Mark handled
              </button>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}

export function PartnerSummaryGrid({
  daysSinceStart,
  nextShot,
  hydrationOz,
  hydrationStatus,
  appetiteLevel,
  membership,
}: {
  daysSinceStart: number;
  nextShot: string;
  hydrationOz: number;
  hydrationStatus: string;
  appetiteLevel: AppetiteLevel;
  membership: AccountMembership | null;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 22 }}>
      <SummaryCard label="Shot cadence" value={`${daysSinceStart} days in`} detail={`Next shot: ${nextShot}`} />
      <SummaryCard label="Hydration status" value={`${hydrationOz} oz`} detail={hydrationStatus} />
      <SummaryCard label="Appetite" value={formatAppetite(appetiteLevel)} detail="Current check-in state" />
      <SummaryCard
        label="Account link"
        value={membership ? capitalize(membership.role.replace("_", " ")) : "Not linked"}
        detail={membership ? "Shared account membership active" : "Accept an invite or complete primary setup"}
      />
    </div>
  );
}

export function PartnerGuidanceGrid({
  isPrepPartner,
  shotDayActive,
  contextMessages,
  activeSymptoms,
  inviteEmail,
  setInviteEmail,
  invites,
  onInviteSubmit,
  onRevokeInvite,
}: {
  isPrepPartner: boolean;
  shotDayActive: boolean;
  contextMessages: string[];
  activeSymptoms: Array<[string, string]>;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  invites: PartnerInvite[];
  onInviteSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRevokeInvite: (inviteId: string) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
      <DashboardPanel title={isPrepPartner ? "What to prep today" : "Partner prep guidance"}>
        <div style={{ display: "grid", gap: 10 }}>
          {shotDayActive ? <div style={noticeStyle}>Shot-day support is active. Smaller, gentler meals should lead the plan.</div> : null}
          <ul style={{ margin: 0, paddingLeft: 18, fontFamily: sans, color: palette.textMuted, lineHeight: 1.8, fontSize: 14 }}>
            {contextMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          {activeSymptoms.length > 0 ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeSymptoms.map(([symptom, severity]) => (
                <span key={symptom} style={symptomBadgeStyle(severity)}>
                  {symptom} · {severity}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </DashboardPanel>

      <DashboardPanel title={isPrepPartner ? "Prep actions" : "Invite status"}>
        {isPrepPartner ? (
          <div style={{ display: "grid", gap: 10 }}>
            <PartnerAction text="Check the grocery route for missing ingredients." link="/grocery" />
            <PartnerAction text="Review the weekly plan before batch cooking." link="/planner" />
            <PartnerAction text="Open today’s log if symptoms change before cooking." link="/today" />
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <form onSubmit={onInviteSubmit} style={{ display: "grid", gap: 10 }}>
              <label style={{ display: "grid", gap: 6, fontFamily: sans, fontSize: 13, color: palette.text }}>
                <span>Prep partner email</span>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="partner@example.com"
                  style={inputStyle}
                />
              </label>
              <button type="submit" style={primaryButtonStyle}>
                Send invite scaffold
              </button>
            </form>

            <div style={{ display: "grid", gap: 8 }}>
              {invites.length === 0 ? (
                <div style={{ fontFamily: sans, fontSize: 13, color: palette.textMuted }}>
                  No partner invites yet. This UI is now ready for the shared-account flow.
                </div>
              ) : (
                invites.map((invite) => (
                  <div key={invite.id} style={inviteRowStyle}>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>{invite.invitedEmail}</div>
                      <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 3 }}>
                        {capitalize(invite.status)} · {formatInviteDate(invite.createdAt)}
                      </div>
                    </div>
                    {invite.status === "pending" ? (
                      <button onClick={() => onRevokeInvite(invite.id)} style={revokeButtonStyle}>
                        Revoke
                      </button>
                    ) : invite.status === "accepted" ? (
                      <span style={acceptedBadgeStyle}>Connected</span>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}

export function PartnerRecommendationsPanel({
  isPrepPartner,
  recommendations,
  onSelectRecipe,
  getContextBadges,
}: {
  isPrepPartner: boolean;
  recommendations: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  getContextBadges: (recipe: Recipe) => string[];
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <DashboardPanel title={isPrepPartner ? "Recommended meals to prep" : "Meals your partner can lean on today"}>
        <div style={{ display: "grid", gap: 10 }}>
          {recommendations.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => onSelectRecipe(recipe)}
              compact
              contextBadges={getContextBadges(recipe)}
            />
          ))}
        </div>
      </DashboardPanel>
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

function PartnerAction({ text, link }: { text: string; link: string }) {
  return (
    <Link to={link} style={partnerActionStyle}>
      {text}
    </Link>
  );
}

function formatAppetite(value: AppetiteLevel) {
  if (value === "none") return "No appetite";
  if (value === "low") return "Low appetite";
  return "Normal appetite";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatInviteDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const partnerActionStyle: CSSProperties = {
  display: "block",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  textDecoration: "none",
  padding: "12px 14px",
  fontFamily: sans,
  color: palette.text,
  fontWeight: 600,
};

const noticeStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#f4fbf6",
  border: `1px solid ${palette.accentLight}`,
  fontFamily: sans,
  color: palette.accent,
  fontSize: 13,
};

const inviteRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  background: "#fff",
  padding: "10px 12px",
};

const linkStateStyle: CSSProperties = {
  borderRadius: 14,
  padding: "12px 14px",
  background: "#f7faf7",
  border: `1px solid ${palette.border}`,
  fontFamily: sans,
  fontSize: 13,
  color: palette.text,
};

const alertRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
  borderRadius: 12,
  border: "1px solid #f1dfb8",
  background: "#fffaf1",
  padding: "12px 14px",
};

const revokeButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: palette.danger,
  fontFamily: sans,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const acceptedBadgeStyle: CSSProperties = {
  borderRadius: 999,
  padding: "8px 12px",
  background: palette.accentSoft,
  border: `1px solid ${palette.accentLight}`,
  color: palette.accent,
  fontFamily: sans,
  fontSize: 12,
  fontWeight: 700,
};

function symptomBadgeStyle(severity: string): CSSProperties {
  const isSevere = severity === "severe";
  const isModerate = severity === "moderate";

  return {
    borderRadius: 999,
    padding: "6px 10px",
    background: isSevere ? "#fff4f5" : isModerate ? "#fff8ec" : "#f7faf7",
    border: `1px solid ${isSevere ? "#f4c2c7" : isModerate ? "#f1dfb8" : palette.border}`,
    color: isSevere ? palette.danger : palette.text,
    fontFamily: sans,
    fontSize: 12,
    textTransform: "capitalize",
  };
}
