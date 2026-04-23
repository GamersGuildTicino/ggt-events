import { z } from "zod";
import { supabase } from "~/lib/supabase";
import {
  type AsyncStateFailure,
  type AsyncStateSuccess,
  failure,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Event Registration
//------------------------------------------------------------------------------

export const eventRegistrationSchema = z.object({
  createdAt: z.date(),
  email: z.string(),
  eventTableId: z.uuid(),
  id: z.uuid(),
  playerName: z.string(),
});

export type EventRegistration = z.infer<typeof eventRegistrationSchema>;

export type EventRegistrationInput = {
  email: string;
  eventTableId: string;
  playerName: string;
};

export const eventRegistrationRowSchema = z.object({
  created_at: z.string(),
  email: z.string(),
  event_table_id: z.uuid(),
  id: z.uuid(),
  player_name: z.string(),
});

export const eventRegistrationFromRowSchema =
  eventRegistrationRowSchema.transform(
    (row): EventRegistration => ({
      createdAt: new Date(row.created_at),
      email: row.email,
      eventTableId: row.event_table_id,
      id: row.id,
      playerName: row.player_name,
    }),
  );

//------------------------------------------------------------------------------
// Delete Event Registration
//------------------------------------------------------------------------------

export async function deleteEventRegistration(
  registrationId: EventRegistration["id"],
) {
  const { error } = await supabase.rpc("delete_event_registration", {
    p_registration_id: registrationId,
  });

  return error ? "error.event_registrations.delete" : "";
}

//------------------------------------------------------------------------------
// Fetch Event Registrations
//------------------------------------------------------------------------------

export async function fetchEventRegistrations(
  eventTableIds: string[],
): Promise<AsyncStateSuccess<EventRegistration[]> | AsyncStateFailure> {
  if (eventTableIds.length === 0) return success([]);

  const { data, error } = await supabase
    .from("event_registrations")
    .select("*")
    .in("event_table_id", eventTableIds)
    .order("created_at", { ascending: true });

  if (error) return failure("error.event_registrations.fetch_many");

  const registrations = z.array(eventRegistrationFromRowSchema).safeParse(data);
  if (registrations.error)
    return failure("error.event_registrations.parse_many");

  return success(registrations.data);
}

//------------------------------------------------------------------------------
// Register For Event Table
//------------------------------------------------------------------------------

export async function registerForEventTable({
  email,
  eventTableId,
  playerName,
}: EventRegistrationInput) {
  const { error } = await supabase.rpc("register_for_event_table", {
    p_email: email,
    p_event_table_id: eventTableId,
    p_player_name: playerName,
  });

  if (!error) return "";

  switch (error.message) {
    case "already_registered_same_table":
      return "error.event_registrations.already_registered_same_table";
    case "invalid_email":
      return "error.event_registrations.invalid_email";
    case "registrations_closed":
      return "error.event_registrations.registrations_closed";
    case "slot_conflict":
      return "error.event_registrations.slot_conflict";
    case "table_full":
      return "error.event_registrations.table_full";
    case "time_slot_closed":
      return "error.event_registrations.time_slot_closed";
    default:
      return "error.event_registrations.create";
  }
}
