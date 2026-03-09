import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAppAuth } from "../../app/providers/app-auth-context";
import { getDaysSince, getNextShotLabel } from "../../domain/utils";
import {
  getActiveSymptoms,
  getDashboardMealRecommendations,
  getDashboardMessages,
  getHydrationStatus,
  getRecipeRecommendationReasons,
  isShotDaySupportActive,
} from "../dashboard/support";
import { RecipeModal } from "../meal-planner/components/RecipeModal";
import { font, palette, sans } from "../meal-planner/constants";
import type { Recipe } from "../meal-planner/types";
import { usePartnerInvites } from "./hooks/usePartnerInvites";
import { useLinkedPrimaryContext } from "./hooks/useLinkedPrimaryContext";
import { useAccountLinking } from "../account/hooks/useAccountLinking";
import { useProfile } from "../profile/hooks/useProfile";
import { useSupportAlerts } from "../support-alerts/hooks/useSupportAlerts";
import { StatusNotice } from "../../components/ui/StatusNotice";
import { secondaryLinkStyle } from "../../components/ui/styles";
import {
  ConnectedHouseholdPanel,
  HouseholdLinkNotice,
  IncomingInvitesPanel,
  PartnerGuidanceGrid,
  PartnerRecommendationsPanel,
  PartnerSummaryGrid,
  SupportAlertsPanel,
} from "./components/PartnerSections";

export function PartnerWorkspacePage() {
  const auth = useAppAuth();
  const { profile, todayLog, recentLogs, isLoading: profileLoading } = useProfile();
  const { invites, isLoading: invitesLoading, createInvite, revokeInvite } = usePartnerInvites();
  const { membership, incomingInvites, isLoading: accountLoading, acceptInvite, declineInvite, leaveHousehold } = useAccountLinking();
  const { linkedContext, isLoading: linkedLoading, linkedTodayLog, linkedRecentLogs } = useLinkedPrimaryContext(profile.role === "prep_partner");
  const { activeAlerts, isLoading: alertsLoading, resolveAlert } = useSupportAlerts();
  const [inviteEmail, setInviteEmail] = useState(profile.prepPartnerEmail ?? auth.user?.email ?? "");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");

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
      setStatusTone("error");
      setStatusMessage("Enter an email address before sending an invite.");
      return;
    }
    setStatusMessage(null);
    try {
      await createInvite(inviteEmail.trim());
      setInviteEmail("");
      setStatusTone("success");
      setStatusMessage("Partner invite sent.");
    } catch {
      setStatusTone("error");
      setStatusMessage("Partner invite could not be sent. Try again.");
    }
  }

  if (profileLoading || invitesLoading || linkedLoading || accountLoading || alertsLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading partner workspace...</div>;
  }

  const isPrepPartner = profile.role === "prep_partner";

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 80px" }}>
      {statusMessage ? <StatusNotice tone={statusTone} marginBottom={16}>{statusMessage}</StatusNotice> : null}
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

      <HouseholdLinkNotice
        linkedMessage={
          isPrepPartner
            ? linkedContext
              ? `Linked to ${linkedContext.profile.name || "the primary user"} via shared household context. This workspace is now reading the same prep state.`
              : membership
                ? "A household membership exists, but the linked primary context did not resolve cleanly. Use the recovery action below if this link is wrong."
                : "No linked primary profile was found for this prep-partner account yet. Ask the primary user to add this email in onboarding or send a partner invite."
            : null
        }
      />

      {isPrepPartner && membership ? (
        <ConnectedHouseholdPanel
          linkedContextName={linkedContext?.profile.name || undefined}
          onLeaveHousehold={() =>
            void (async () => {
              try {
                await leaveHousehold();
                setStatusTone("success");
                setStatusMessage("Household link removed.");
              } catch {
                setStatusTone("error");
                setStatusMessage("Household link could not be removed. Try again.");
              }
            })()
          }
        />
      ) : null}

      {isPrepPartner ? (
        <IncomingInvitesPanel
          invites={incomingInvites}
          onAccept={(inviteId) =>
            void (async () => {
              try {
                await acceptInvite(inviteId);
                setStatusTone("success");
                setStatusMessage("Partner invite accepted.");
              } catch {
                setStatusTone("error");
                setStatusMessage("Partner invite could not be accepted. Try again.");
              }
            })()
          }
          onDecline={(inviteId) =>
            void (async () => {
              try {
                await declineInvite(inviteId);
                setStatusTone("success");
                setStatusMessage("Partner invite declined.");
              } catch {
                setStatusTone("error");
                setStatusMessage("Partner invite could not be declined. Try again.");
              }
            })()
          }
        />
      ) : null}

      <SupportAlertsPanel
        alerts={activeAlerts}
        onResolve={(alertId) =>
          void (async () => {
            try {
              await resolveAlert(alertId);
              setStatusTone("success");
              setStatusMessage("Support alert marked handled.");
            } catch {
              setStatusTone("error");
              setStatusMessage("Support alert could not be updated. Try again.");
            }
          })()
        }
      />

      <PartnerSummaryGrid
        daysSinceStart={daysSinceStart}
        nextShot={nextShot}
        hydrationOz={householdTodayLog.hydrationOz}
        hydrationStatus={hydrationStatus}
        appetiteLevel={householdTodayLog.appetiteLevel}
        membership={membership}
      />

      <PartnerGuidanceGrid
        isPrepPartner={isPrepPartner}
        shotDayActive={shotDayActive}
        contextMessages={contextMessages}
        activeSymptoms={activeSymptoms}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        invites={invites}
        onInviteSubmit={handleInviteSubmit}
        onRevokeInvite={(inviteId) =>
          void (async () => {
            try {
              await revokeInvite(inviteId);
              setStatusTone("success");
              setStatusMessage("Partner invite revoked.");
            } catch {
              setStatusTone("error");
              setStatusMessage("Partner invite could not be revoked. Try again.");
            }
          })()
        }
      />

      <PartnerRecommendationsPanel
        isPrepPartner={isPrepPartner}
        recommendations={recommendations}
        onSelectRecipe={setSelectedRecipe}
        getContextBadges={(recipe) => getRecipeRecommendationReasons(recipe, householdProfile, householdTodayLog, householdRecentLogs)}
      />

      {selectedRecipe ? <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} /> : null}
    </div>
  );
}
