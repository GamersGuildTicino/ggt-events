import z from "zod";
import { supabase } from "~/lib/supabase";
import {
  type AsyncStateFailure,
  type AsyncStateSuccess,
  failure,
  success,
} from "~/utils/async-state";
import { eventVisibilitySchema } from "./enums/event-visibility";

//------------------------------------------------------------------------------
// Event
//------------------------------------------------------------------------------

export const eventSchema = z.object({
  createdAt: z.date(),
  createdBy: z.uuid(),
  id: z.uuid(),
  locationAddress: z.string(),
  locationName: z.string(),
  registrationsOpen: z.boolean(),
  startsAt: z.date(),
  title: z.string(),
  visibility: eventVisibilitySchema,
});

export type Event = z.infer<typeof eventSchema>;

//------------------------------------------------------------------------------
// Event Row
//------------------------------------------------------------------------------

export const eventRowSchema = z.object({
  created_at: z.string(),
  created_by: z.uuid(),
  id: z.uuid(),
  location_address: z.string(),
  location_name: z.string(),
  registrations_open: z.boolean(),
  starts_at: z.string(),
  title: z.string(),
  visibility: eventVisibilitySchema,
});

export type EventRow = z.infer<typeof eventRowSchema>;

//------------------------------------------------------------------------------
// Event From Row
//------------------------------------------------------------------------------

export const eventFromRowSchema = eventRowSchema.transform(
  (row): Event => ({
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    id: row.id,
    locationAddress: row.location_address,
    locationName: row.location_name,
    registrationsOpen: row.registrations_open,
    startsAt: new Date(row.starts_at),
    title: row.title,
    visibility: row.visibility,
  }),
);

//------------------------------------------------------------------------------
// Event To Row
//------------------------------------------------------------------------------

export const eventToRowSchema = eventSchema.transform(
  (event): EventRow => ({
    created_at: event.createdAt.toISOString(),
    created_by: event.createdBy,
    id: event.id,
    location_address: event.locationAddress,
    location_name: event.locationName,
    registrations_open: event.registrationsOpen,
    starts_at: event.startsAt.toISOString(),
    title: event.title,
    visibility: event.visibility,
  }),
);

//------------------------------------------------------------------------------
// Create Event
//------------------------------------------------------------------------------

export async function createEvent(event: Omit<Event, "createdAt" | "id">) {
  const { error } = await supabase.from("events").insert({
    created_by: event.createdBy,
    location_address: event.locationAddress,
    location_name: event.locationName,
    registrations_open: event.registrationsOpen,
    starts_at: event.startsAt.toISOString(),
    title: event.title,
    visibility: event.visibility,
  });

  return error ? "error.events.create" : "";
}

//------------------------------------------------------------------------------
// Delete Event
//------------------------------------------------------------------------------

export async function deleteEvent(eventId: Event["id"]) {
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  return error ? "error.events.delete" : "";
}

//------------------------------------------------------------------------------
// Fetch Event
//------------------------------------------------------------------------------

export async function fetchEvent(
  eventId: Event["id"],
): Promise<AsyncStateSuccess<Event> | AsyncStateFailure> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) return failure("error.events.fetch_one");

  const event = eventFromRowSchema.safeParse(data);
  if (event.error) return failure("error.events.parse_one");

  return success(event.data);
}

//------------------------------------------------------------------------------
// Fetch Public Event
//------------------------------------------------------------------------------

export async function fetchPublicEvent(
  eventId: Event["id"],
): Promise<AsyncStateSuccess<Event> | AsyncStateFailure> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .in("visibility", ["public", "restricted"])
    .single();

  if (error) return failure("error.events.fetch_one");

  const event = eventFromRowSchema.safeParse(data);
  if (event.error) return failure("error.events.parse_one");

  return success(event.data);
}

//------------------------------------------------------------------------------
// Fetch Events
//------------------------------------------------------------------------------

export async function fetchEvents(): Promise<
  AsyncStateSuccess<Event[]> | AsyncStateFailure
> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) return failure("error.events.fetch_many");

  const events = z.array(eventFromRowSchema).safeParse(data);
  if (events.error) return failure("error.events.parse_many");

  return success(events.data);
}

//------------------------------------------------------------------------------
// Fetch Public Events
//------------------------------------------------------------------------------

export async function fetchPublicEvents(): Promise<
  AsyncStateSuccess<Event[]> | AsyncStateFailure
> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("visibility", "public")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error) return failure("error.events.fetch_many");

  const events = z.array(eventFromRowSchema).safeParse(data);
  if (events.error) return failure("error.events.parse_many");

  return success(events.data);
}

//------------------------------------------------------------------------------
// Update Event
//------------------------------------------------------------------------------

export async function updateEvent(
  event: Pick<Event, "id"> & Omit<Event, "createdAt" | "createdBy" | "id">,
) {
  const { error } = await supabase
    .from("events")
    .update({
      location_address: event.locationAddress,
      location_name: event.locationName,
      registrations_open: event.registrationsOpen,
      starts_at: event.startsAt.toISOString(),
      title: event.title,
      visibility: event.visibility,
    })
    .eq("id", event.id);

  return error ? "error.events.update" : "";
}
