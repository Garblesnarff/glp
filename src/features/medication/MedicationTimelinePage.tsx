import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { font, palette, sans } from "../meal-planner/constants";
import { useProfile } from "../profile/hooks/useProfile";
import { getCompanionReminders } from "../dashboard/reminders";
import { CompanionRemindersPanel } from "../dashboard/components/CompanionRemindersPanel";
import type { ReminderPreferences } from "../../domain/types";
import { getRefillSummary } from "./refill";
import { useNotificationQueue } from "../notifications/hooks/useNotificationQueue";
import { getNotificationChannelPlan } from "../notifications/channels";
import { getLocalIsoDate } from "../../lib/dates";
import { StatusNotice } from "../../components/ui/StatusNotice";
import { secondaryLinkStyle } from "../../components/ui/styles";
import {
  MedicationLogSection,
  MedicationRemindersSection,
  MedicationSummaryGrid,
  MedicationTimelineSection,
  RefillPlanningSection,
  ReminderPreferencesSection,
  ScheduledDeliverySection,
} from "./components/MedicationSections";

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
  const { profile, medicationLogs, saveMedicationLog, saveProfile, recentLogs, todayLog, isLoading } = useProfile();
  const { jobs, isLoading: queueLoading, refreshSchedule } = useNotificationQueue();
  const [draft, setDraft] = useState<MedicationDraft>({
    medication: profile.medicationName,
    dose: "",
    shotDay: profile.shotDay,
    injectionSite: injectionSites[0],
    date: getLocalIsoDate(),
    status: "completed" as const,
    isDoseIncrease: false,
    notes: "",
  });
  const [preferenceDraft, setPreferenceDraft] = useState<ReminderPreferences>(profile.reminderPreferences);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"success" | "error">("success");
  const [isSubmittingMedication, setIsSubmittingMedication] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isRefreshingQueue, setIsRefreshingQueue] = useState(false);

  const latestLog = medicationLogs[0] ?? null;
  const symptomDays = recentLogs.filter((log) => Object.values(log.symptoms).some((severity) => severity !== "none")).length;
  const doseIncreaseCount = medicationLogs.filter((log) => log.isDoseIncrease).length;
  const delayedOrMissedCount = medicationLogs.filter((log) => log.status === "delayed" || log.status === "missed").length;
  const nextSuggestedSite = useMemo(() => getNextInjectionSite(latestLog?.injectionSite), [latestLog?.injectionSite]);
  const reminders = getCompanionReminders(profile, todayLog, recentLogs, medicationLogs);
  const refill = getRefillSummary(profile);
  const channelPlan = getNotificationChannelPlan({ reminderPreferences: preferenceDraft });

  useEffect(() => {
    setPreferenceDraft(profile.reminderPreferences);
  }, [profile.reminderPreferences]);

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      medication: profile.medicationName,
      shotDay: profile.shotDay,
      date: current.date || getLocalIsoDate(),
    }));
  }, [profile.medicationName, profile.shotDay]);

  if (isLoading) {
    return <div style={{ padding: 24, fontFamily: sans }}>Loading medication timeline...</div>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    setIsSubmittingMedication(true);
    try {
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
        date: getLocalIsoDate(),
        status: "completed",
        isDoseIncrease: false,
        notes: "",
        injectionSite: nextSuggestedSite,
      }));
      setStatusTone("success");
      setStatusMessage("Medication log saved.");
    } catch {
      setStatusTone("error");
      setStatusMessage("Medication log could not be saved. Try again.");
    } finally {
      setIsSubmittingMedication(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 80px" }}>
      {statusMessage ? <StatusNotice tone={statusTone} marginBottom={16}>{statusMessage}</StatusNotice> : null}
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
          <Link to="/notifications" style={secondaryLinkStyle}>
            Open inbox
          </Link>
          <Link to="/history" style={secondaryLinkStyle}>
            View history
          </Link>
        </div>
      </div>

      <MedicationSummaryGrid
        profile={profile}
        latestLog={latestLog}
        doseIncreaseCount={doseIncreaseCount}
        symptomDays={symptomDays}
        delayedOrMissedCount={delayedOrMissedCount}
        nextSuggestedSite={nextSuggestedSite}
        refill={refill}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <MedicationLogSection
          draft={draft}
          setDraft={setDraft}
          shotDays={shotDays}
          injectionSites={injectionSites}
          onSubmit={handleSubmit}
          isSubmitting={isSubmittingMedication}
        />
        <MedicationTimelineSection medicationLogs={medicationLogs} />
      </div>

      <div style={{ marginTop: 16 }}>
        <RefillPlanningSection profile={profile} saveProfile={saveProfile} refill={refill} />
      </div>

      <div style={{ marginTop: 16 }}>
        <ScheduledDeliverySection
          jobs={jobs}
          queueLoading={queueLoading}
          isRefreshingQueue={isRefreshingQueue}
          onRefresh={() =>
            void (async () => {
              setStatusMessage(null);
              setIsRefreshingQueue(true);
              try {
                await refreshSchedule(profile, todayLog, recentLogs, medicationLogs);
                setStatusTone("success");
                setStatusMessage("Scheduled jobs refreshed.");
              } catch {
                setStatusTone("error");
                setStatusMessage("Scheduled jobs could not be refreshed. Try again.");
              } finally {
                setIsRefreshingQueue(false);
              }
            })()
          }
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <MedicationRemindersSection>
          <CompanionRemindersPanel reminders={reminders.filter((reminder) => reminder.link?.to === "/medication" || reminder.id === "shot-prep")} />
        </MedicationRemindersSection>
      </div>

      <div style={{ marginTop: 16 }}>
        <ReminderPreferencesSection
          preferenceDraft={preferenceDraft}
          setPreferenceDraft={setPreferenceDraft}
          channelPlan={channelPlan}
          isSavingPreferences={isSavingPreferences}
          onSave={() =>
            void (async () => {
              setStatusMessage(null);
              setIsSavingPreferences(true);
              try {
                await saveProfile({ ...profile, reminderPreferences: preferenceDraft });
                setStatusTone("success");
                setStatusMessage("Reminder preferences saved.");
              } catch {
                setStatusTone("error");
                setStatusMessage("Reminder preferences could not be saved. Try again.");
              } finally {
                setIsSavingPreferences(false);
              }
            })()
          }
        />
      </div>
    </div>
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
