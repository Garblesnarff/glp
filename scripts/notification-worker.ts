import { createClient } from "@supabase/supabase-js";
import { SupabaseNotificationRepository } from "../src/features/notifications/repository/SupabaseNotificationRepository";
import { createNotificationTransportProviders, planExternalNotificationAttempts } from "../src/features/notifications/providers";
import { getWorkerNotificationTransportStatuses } from "../src/features/notifications/transports";
import type { NotificationProviderAttempt } from "../src/features/notifications/providers";

const referenceDate = process.argv[2] ?? new Date().toISOString();
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for notification delivery worker.");
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data, error } = await client
  .from("notification_jobs")
  .select("user_id")
  .eq("status", "scheduled")
  .lte("send_at", referenceDate);

if (error) {
  throw error;
}

const userIds = [...new Set((data ?? []).map((row) => row.user_id).filter(Boolean))];
let deliveredCount = 0;
const transportStatus = getWorkerNotificationTransportStatuses(process.env);
const providers = createNotificationTransportProviders(process.env);
const externalTransportAttempts: NotificationProviderAttempt[] = [];

for (const userId of userIds) {
  const repository = new SupabaseNotificationRepository(client, userId);
  const jobs = await repository.loadNotificationJobs();
  const dueJobs = jobs.filter((job) => job.status === "scheduled" && new Date(job.sendAt).getTime() <= new Date(referenceDate).getTime());
  externalTransportAttempts.push(...planExternalNotificationAttempts(dueJobs, providers));
  const delivered = await repository.deliverDueJobs(referenceDate);
  deliveredCount += delivered.length;
}

console.log(
  JSON.stringify(
    {
      referenceDate,
      usersProcessed: userIds.length,
      deliveredCount,
      transportStatus,
      externalTransportAttempts,
    },
    null,
    2,
  ),
);
