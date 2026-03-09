import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationDelivery, NotificationJob } from "../../../domain/types";
import { buildNotificationDelivery } from "../delivery";
import type { NotificationRepository } from "./NotificationRepository";

export class SupabaseNotificationRepository implements NotificationRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userId: string,
  ) {}

  async loadNotificationJobs(): Promise<NotificationJob[]> {
    const { data, error } = await this.client.from("notification_jobs").select("*").eq("user_id", this.userId).order("send_at", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      sourceReminderId: row.source_reminder_id,
      title: row.title,
      body: row.body,
      linkTo: row.link_to ?? undefined,
      requestedChannel: row.requested_channel ?? "in_app",
      sendAt: row.send_at,
      channel: row.channel,
      status: row.status,
      fallbackReason: row.fallback_reason ?? undefined,
    }));
  }

  async saveNotificationJobs(jobs: NotificationJob[]): Promise<void> {
    if (jobs.length === 0) {
      const { error } = await this.client.from("notification_jobs").delete().eq("user_id", this.userId);
      if (error) {
        throw error;
      }
      return;
    }

    const { error: upsertError } = await this.client.from("notification_jobs").upsert(
      jobs.map((job) => ({
        id: job.id,
        user_id: this.userId,
        source_reminder_id: job.sourceReminderId,
        title: job.title,
        body: job.body,
        link_to: job.linkTo ?? null,
        requested_channel: job.requestedChannel,
        send_at: job.sendAt,
        channel: job.channel,
        status: job.status,
        fallback_reason: job.fallbackReason ?? null,
      })),
      { onConflict: "id" },
    );

    if (upsertError) {
      throw upsertError;
    }

    const { data: existingJobs, error: existingJobsError } = await this.client.from("notification_jobs").select("id").eq("user_id", this.userId);

    if (existingJobsError) {
      throw existingJobsError;
    }

    const staleIds = (existingJobs ?? []).map((row) => String(row.id)).filter((id) => !new Set(jobs.map((job) => job.id)).has(id));
    if (staleIds.length === 0) {
      return;
    }

    const { error: deleteError } = await this.client.from("notification_jobs").delete().eq("user_id", this.userId).in("id", staleIds);

    if (deleteError) {
      throw deleteError;
    }
  }

  async loadNotificationDeliveries(): Promise<NotificationDelivery[]> {
    const { data, error } = await this.client
      .from("notification_deliveries")
      .select("*")
      .eq("user_id", this.userId)
      .order("delivered_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      sourceJobId: row.source_job_id,
      sourceReminderId: row.source_reminder_id,
      title: row.title,
      body: row.body,
      linkTo: row.link_to ?? undefined,
      requestedChannel: row.requested_channel ?? "in_app",
      deliveredAt: row.delivered_at,
      channel: row.channel,
      status: row.status,
      fallbackReason: row.fallback_reason ?? undefined,
    }));
  }

  async deliverDueJobs(referenceDate = new Date().toISOString()): Promise<NotificationDelivery[]> {
    const { data: dueJobs, error: dueJobsError } = await this.client
      .from("notification_jobs")
      .select("*")
      .eq("user_id", this.userId)
      .eq("status", "scheduled")
      .lte("send_at", referenceDate)
      .order("send_at", { ascending: true });

    if (dueJobsError) {
      throw dueJobsError;
    }

    if (!dueJobs || dueJobs.length === 0) {
      return [];
    }

    const deliveries = dueJobs.map((row) =>
      buildNotificationDelivery(
        {
          id: row.id,
          sourceReminderId: row.source_reminder_id,
          title: row.title,
          body: row.body,
          linkTo: row.link_to ?? undefined,
          requestedChannel: row.requested_channel ?? "in_app",
          sendAt: row.send_at,
          channel: row.channel,
          status: row.status,
          fallbackReason: row.fallback_reason ?? undefined,
        },
        referenceDate,
      ),
    );

    if (deliveries.length === 0) {
      return [];
    }

    const { error: deliveryError } = await this.client.from("notification_deliveries").upsert(
      deliveries.map((delivery) => ({
        id: delivery.id,
        user_id: this.userId,
        source_job_id: delivery.sourceJobId,
        source_reminder_id: delivery.sourceReminderId,
        title: delivery.title,
        body: delivery.body,
        link_to: delivery.linkTo ?? null,
        requested_channel: delivery.requestedChannel,
        delivered_at: delivery.deliveredAt,
        channel: delivery.channel,
        status: delivery.status,
        fallback_reason: delivery.fallbackReason ?? null,
      })),
    );

    if (deliveryError) {
      throw deliveryError;
    }

    const dueIds = dueJobs.map((job) => job.id);
    const { error: sendError } = await this.client
      .from("notification_jobs")
      .update({ status: "sent" })
      .eq("user_id", this.userId)
      .eq("status", "scheduled")
      .in("id", dueIds);

    if (sendError) {
      throw sendError;
    }

    return deliveries;
  }

  async acknowledgeNotificationDelivery(deliveryId: string): Promise<void> {
    const { error } = await this.client
      .from("notification_deliveries")
      .update({ status: "acknowledged" })
      .eq("user_id", this.userId)
      .eq("id", deliveryId);

    if (error) {
      throw error;
    }
  }
}
