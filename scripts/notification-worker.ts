import { createClient } from "@supabase/supabase-js";
import { SupabaseNotificationRepository } from "../src/features/notifications/repository/SupabaseNotificationRepository";
import { getWorkerNotificationTransportStatuses } from "../src/features/notifications/transports";

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

for (const userId of userIds) {
  const repository = new SupabaseNotificationRepository(client, userId);
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
    },
    null,
    2,
  ),
);
