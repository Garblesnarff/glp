import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAppAuth } from "../../app/providers/app-auth-context";
import { getDaysSince, getNextShotLabel } from "../../domain/utils";
import { DashboardPanel } from "../dashboard/components/DashboardPanel";
import {
  getActiveSymptoms,
  getDashboardMealRecommendations,
  getDashboardMessages,
  getHydrationStatus,
  getRecipeRecommendationReasons,
  isShotDaySupportActive,
} from "../dashboard/support";
import { RecipeCard } from "../meal-planner/components/RecipeCard";
import { RecipeModal } from "../meal-planner/components/RecipeModal";
import { font, palette, sans } from "../meal-planner/constants";
import type { Recipe } from "../meal-planner/types";
import { usePartnerInvites } from "./hooks/usePartnerInvites";
import { useLinkedPrimaryContext } from "./hooks/useLinkedPrimaryContext";
import { useAccountLinking } from "../account/hooks/useAccountLinking";
import { useProfile } from "../profile/hooks/useProfile";

export function PartnerWorkspacePage() {
  const auth = useAppAuth();
  const { profile, todayLog, recentLogs, isLoading: profileLoading } = useProfile();
  const { invites, isLoading: invitesLoading, createInvite, revokeInvite } = usePartnerInvites();
  const { membership, incomingInvites, isLoading: accountLoading, acceptInvite } = useAccountLinking();
  const { linkedContext, isLoading: linkedLoading, linkedTodayLog, linkedRecentLogs } = useLinkedPrimaryContext(profile.role === "prep_partner");
  const [inviteEmail, setInviteEmail] = useState(profile.prepPartnerEmail ?? auth.user?.email ?? "");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    setInviteEmail(profile.prepPartnerEmail ?? auth.user?.email ?? "");
  }, [auth.user?.email, profile.prepPartnerEmail]);

  const householdProfile = profile.role === "prep_partner" && linkedContext ? linkedContext.profile : profile;
  const householdTodayLog = profile.role === "prep_partner" ? linkedTodayLog : todayLog;
  const householdRecentLogs = profile.role === "prep_partner" ? linkedRecentLogs : recentLogs;
  const recommendations = useMemo(
    () => getDashboardMealRecommendations(householdProfile, householdTodayLog, undefined, householdRecentLogs),
    [householdProfile, householdRecentLogs, householdTodayLog],
  );
  const activeSymptoms = getActiveSymptoms(householdTodayLog);
  const contextMessages = getDashboardMessages(householdProfile, householdTodayLog);
  const hydrationStatus = getHydrationStatus(householdProfile, householdTodayLog);
  const shotDayActive = isShotDaySupportActive(householdProfile);
  const nextShot = getNextShotLabel(householdProfile.shotDay);
  const daysSinceStart = householdProfile.medicationStartDate ? getDaysSince(householdProfile.medicationStartDate) : 0;

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inviteEmail.trim()) {
      return;
    }

    await createInvite(inviteEmail.trim());
    setInviteEmail("");
  }

  if (profileLoading || invitesLoading || linkedLoading || accountLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading partner workspace...</div>;
  }

  const isPrepPartner = profile.role === "prep_partner";

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: palette.accent }}>
            Partner Workspace
          </div>
          <h1 style={{ fontFamily: font, fontSize: 40, margin: "8px 0 8px", lineHeight: 1.05 }}>
            {isPrepPartner ? "Prep for the day without guesswork." : "Set up and guide your prep partner."}
          </h1>
          <p style={{ fontFamily: sans, fontSize: 15, color: palette.textMuted, lineHeight: 1.6, maxWidth: 680, margin: 0 }}>
            {isPrepPartner
              ? "This view surfaces the primary user’s current context, safer meal options, and the fastest paths to planning and grocery tasks."
              : "This is the first partner layer: invite management, role-aware prep guidance, and a dedicated workspace that can grow into the full shared-account flow."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/" style={secondaryLinkStyle}>
            Back to dashboard
          </Link>
          <Link to="/planner" style={secondaryLinkStyle}>
            Open planner
          </Link>
          <Link to="/grocery" style={secondaryLinkStyle}>
            Open grocery
          </Link>
        </div>
      </div>

      {isPrepPartner ? (
        <div style={{ ...linkStateStyle, marginTop: 18 }}>
          {linkedContext
            ? `Linked to ${linkedContext.profile.name || "the primary user"} via prep-partner email match. This workspace is now reading shared household context.`
            : "No linked primary profile was found for this prep-partner account yet. Ask the primary user to add this email in onboarding or send a partner invite."}
        </div>
      ) : null}

      {isPrepPartner && incomingInvites.length > 0 ? (
        <div style={{ marginTop: 16 }}>
          <DashboardPanel title="Incoming partner invites">
            <div style={{ display: "grid", gap: 10 }}>
              {incomingInvites.map((invite) => (
                <div key={invite.id} style={inviteRowStyle}>
                  <div>
                    <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: palette.text }}>{invite.invitedEmail}</div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: palette.textMuted, marginTop: 3 }}>
                      Pending invite · {formatInviteDate(invite.createdAt)}
                    </div>
                  </div>
                  <button onClick={() => void acceptInvite(invite.id)} style={primaryButtonStyle}>
                    Accept invite
                  </button>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 22 }}>
        <SummaryCard label="Shot cadence" value={`${daysSinceStart} days in`} detail={`Next shot: ${nextShot}`} />
        <SummaryCard label="Hydration status" value={`${householdTodayLog.hydrationOz} oz`} detail={hydrationStatus} />
        <SummaryCard label="Appetite" value={formatAppetite(householdTodayLog.appetiteLevel)} detail="Current check-in state" />
        <SummaryCard
          label="Account link"
          value={membership ? capitalize(membership.role.replace("_", " ")) : "Not linked"}
          detail={membership ? "Shared account membership active" : "Accept an invite or complete primary setup"}
        />
      </div>

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
              <form onSubmit={handleInviteSubmit} style={{ display: "grid", gap: 10 }}>
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
                        <button onClick={() => void revokeInvite(invite.id)} style={revokeButtonStyle}>
                          Revoke
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DashboardPanel>
      </div>

      <div style={{ marginTop: 16 }}>
        <DashboardPanel title={isPrepPartner ? "Recommended meals to prep" : "Meals your partner can lean on today"}>
          <div style={{ display: "grid", gap: 10 }}>
            {recommendations.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                compact
                contextBadges={getRecipeRecommendationReasons(recipe, householdProfile, householdTodayLog, householdRecentLogs)}
              />
            ))}
          </div>
        </DashboardPanel>
      </div>

      {selectedRecipe ? <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} /> : null}
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

function formatAppetite(value: "none" | "low" | "normal") {
  if (value === "none") {
    return "No appetite";
  }
  if (value === "low") {
    return "Low appetite";
  }
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

const inputStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${palette.border}`,
  fontFamily: sans,
  fontSize: 14,
  background: "#fff",
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

const revokeButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: palette.danger,
  fontFamily: sans,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
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
