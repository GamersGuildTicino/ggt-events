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
  description: z.string(),
  id: z.uuid(),
  imageUrl: z.string(),
  locationAddress: z.string(),
  locationName: z.string(),
  registrationsOpen: z.boolean(),
  shortDescription: z.string(),
  slug: z.string(),
  title: z.string(),
  updatedAt: z.date(),
  visibility: eventVisibilitySchema,
});

export type Event = z.infer<typeof eventSchema>;

//------------------------------------------------------------------------------
// Event Row
//------------------------------------------------------------------------------

export const eventRowSchema = z.object({
  created_at: z.string(),
  created_by: z.uuid(),
  description: z.string(),
  id: z.uuid(),
  image_url: z.string(),
  location_address: z.string(),
  location_name: z.string(),
  registrations_open: z.boolean(),
  short_description: z.string(),
  slug: z.string(),
  title: z.string(),
  updated_at: z.string(),
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
    description: row.description,
    id: row.id,
    imageUrl: row.image_url,
    locationAddress: row.location_address,
    locationName: row.location_name,
    registrationsOpen: row.registrations_open,
    shortDescription: row.short_description,
    slug: row.slug,
    title: row.title,
    updatedAt: new Date(row.updated_at),
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
    description: event.description,
    id: event.id,
    image_url: event.imageUrl,
    location_address: event.locationAddress,
    location_name: event.locationName,
    registrations_open: event.registrationsOpen,
    short_description: event.shortDescription,
    slug: event.slug,
    title: event.title,
    updated_at: event.updatedAt.toISOString(),
    visibility: event.visibility,
  }),
);

//------------------------------------------------------------------------------
// Create Event
//------------------------------------------------------------------------------

export async function createEvent(
  event: Omit<Event, "createdAt" | "id" | "updatedAt">,
) {
  const { error } = await supabase.from("events").insert({
    created_by: event.createdBy,
    description: event.description,
    image_url: event.imageUrl,
    location_address: event.locationAddress,
    location_name: event.locationName,
    registrations_open: event.registrationsOpen,
    short_description: event.shortDescription,
    slug: event.slug,
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
// Fetch Public Event By Id
//------------------------------------------------------------------------------

export async function fetchPublicEventById(
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
// Fetch Public Event By Slug
//------------------------------------------------------------------------------

export async function fetchPublicEventBySlug(
  eventSlug: Event["slug"],
): Promise<AsyncStateSuccess<Event> | AsyncStateFailure> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", eventSlug)
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
    .order("created_at", { ascending: false });

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
    .order("created_at", { ascending: false });

  if (error) return failure("error.events.fetch_many");

  const events = z.array(eventFromRowSchema).safeParse(data);
  if (events.error) return failure("error.events.parse_many");

  return success(events.data);
}

//------------------------------------------------------------------------------
// Update Event
//------------------------------------------------------------------------------

export async function updateEvent(
  event: Pick<Event, "id"> &
    Omit<Event, "createdAt" | "createdBy" | "id" | "updatedAt">,
) {
  const { data, error } = await supabase
    .from("events")
    .update({
      description: event.description,
      image_url: event.imageUrl,
      location_address: event.locationAddress,
      location_name: event.locationName,
      registrations_open: event.registrationsOpen,
      short_description: event.shortDescription,
      slug: event.slug,
      title: event.title,
      visibility: event.visibility,
    })
    .eq("id", event.id)
    .select("id")
    .maybeSingle();

  return error || !data ? "error.events.update" : "";
}
