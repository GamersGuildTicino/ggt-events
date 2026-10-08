import z from "zod";
import { supabase } from "~/lib/supabase";
import {
  type AsyncStateFailure,
  type AsyncStateSuccess,
  failure,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Event Manager
//------------------------------------------------------------------------------

const eventManagerSchema = z.object({
  displayName: z.string().nullable(),
  email: z.string(),
  eventIds: z.array(z.uuid()),
  userId: z.uuid(),
});

export type EventManager = z.infer<typeof eventManagerSchema>;

const eventManagersResponseSchema = z.object({
  managers: z.array(eventManagerSchema),
});

export async function fetchEventManagers(): Promise<
  AsyncStateSuccess<EventManager[]> | AsyncStateFailure
> {
  const { data, error } = await supabase.functions.invoke(
    "manage-event-managers",
    { body: { action: "list" } },
  );
  if (error) return failure("error.event_managers.fetch_many");

  const parsed = eventManagersResponseSchema.safeParse(data);
  if (!parsed.success) return failure("error.event_managers.parse_many");
  return success(parsed.data.managers);
}

export async function inviteEventManager(email: string, displayName: string) {
  const { data, error } = await supabase.functions.invoke(
    "manage-event-managers",
    { body: { action: "invite", displayName, email } },
  );
  return error || data?.error ? "error.event_managers.invite" : "";
}

export async function removeEventManager(userId: string) {
  const { data, error } = await supabase.functions.invoke(
    "manage-event-managers",
    { body: { action: "remove", userId } },
  );
  return error || data?.error ? "error.event_managers.remove" : "";
}

export async function assignEventManager(userId: string, eventId: string) {
  const { data, error } = await supabase.functions.invoke(
    "manage-event-managers",
    { body: { action: "assign", eventId, userId } },
  );
  return error || data?.error ? "error.event_managers.assign" : "";
}

export async function unassignEventManager(userId: string, eventId: string) {
  const { data, error } = await supabase.functions.invoke(
    "manage-event-managers",
    { body: { action: "unassign", eventId, userId } },
  );
  return error || data?.error ? "error.event_managers.assign" : "";
}
