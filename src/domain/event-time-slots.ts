import z from "zod";
import { supabase } from "~/lib/supabase";
import {
  type AsyncStateFailure,
  type AsyncStateSuccess,
  failure,
  success,
} from "~/utils/async-state";
import type { Event } from "./events";

//------------------------------------------------------------------------------
// Event Time Slot
//------------------------------------------------------------------------------

export const eventTimeSlotSchema = z.object({
  createdAt: z.date(),
  createdBy: z.uuid(),
  endsAt: z.date(),
  eventId: z.uuid(),
  id: z.uuid(),
  startsAt: z.date(),
  updatedAt: z.date(),
});

export type EventTimeSlot = z.infer<typeof eventTimeSlotSchema>;

//------------------------------------------------------------------------------
// Event Time Slot Row
//------------------------------------------------------------------------------

export const eventTimeSlotRowSchema = z.object({
  created_at: z.string(),
  created_by: z.uuid(),
  ends_at: z.string(),
  event_id: z.uuid(),
  id: z.uuid(),
  starts_at: z.string(),
  updated_at: z.string(),
});

export type EventTimeSlotRow = z.infer<typeof eventTimeSlotRowSchema>;

//------------------------------------------------------------------------------
// Event Time Slot From Row
//------------------------------------------------------------------------------

export const eventTimeSlotFromRowSchema = eventTimeSlotRowSchema.transform(
  (row): EventTimeSlot => ({
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    endsAt: new Date(row.ends_at),
    eventId: row.event_id,
    id: row.id,
    startsAt: new Date(row.starts_at),
    updatedAt: new Date(row.updated_at),
  }),
);

//------------------------------------------------------------------------------
// Create Event Time Slot
//------------------------------------------------------------------------------

export async function createEventTimeSlot(
  eventTimeSlot: Omit<EventTimeSlot, "createdAt" | "id" | "updatedAt">,
) {
  const { error } = await supabase.from("event_time_slots").insert({
    created_by: eventTimeSlot.createdBy,
    ends_at: eventTimeSlot.endsAt.toISOString(),
    event_id: eventTimeSlot.eventId,
    starts_at: eventTimeSlot.startsAt.toISOString(),
  });

  return error ? "error.event_time_slots.create" : "";
}

//------------------------------------------------------------------------------
// Delete Event Time Slot
//------------------------------------------------------------------------------

export async function deleteEventTimeSlot(
  eventTimeSlotId: EventTimeSlot["id"],
) {
  const { error } = await supabase
    .from("event_time_slots")
    .delete()
    .eq("id", eventTimeSlotId);

  return error ? "error.event_time_slots.delete" : "";
}

//------------------------------------------------------------------------------
// Fetch Event Time Slots
//------------------------------------------------------------------------------

export async function fetchEventTimeSlots(
  eventId: Event["id"],
): Promise<AsyncStateSuccess<EventTimeSlot[]> | AsyncStateFailure> {
  const { data, error } = await supabase
    .from("event_time_slots")
    .select("*")
    .eq("event_id", eventId)
    .order("starts_at", { ascending: true });

  if (error) return failure("error.event_time_slots.fetch_many");

  const eventTimeSlots = z.array(eventTimeSlotFromRowSchema).safeParse(data);
  if (eventTimeSlots.error) return failure("error.event_time_slots.parse_many");

  return success(eventTimeSlots.data);
}

//------------------------------------------------------------------------------
// Update Event Time Slot
//------------------------------------------------------------------------------

export async function updateEventTimeSlot(
  eventTimeSlot: Pick<EventTimeSlot, "id"> &
    Omit<
      EventTimeSlot,
      "createdAt" | "createdBy" | "eventId" | "id" | "updatedAt"
    >,
) {
  const { error } = await supabase
    .from("event_time_slots")
    .update({
      ends_at: eventTimeSlot.endsAt.toISOString(),
      starts_at: eventTimeSlot.startsAt.toISOString(),
    })
    .eq("id", eventTimeSlot.id);

  return error ? "error.event_time_slots.update" : "";
}

//------------------------------------------------------------------------------
// Is Event Over
//------------------------------------------------------------------------------

export function isEventOver(eventTimeSlots: EventTimeSlot[]) {
  return (
    eventTimeSlots.length > 0 &&
    eventTimeSlots.every((eventTimeSlot) => eventTimeSlot.endsAt < new Date())
  );
}
