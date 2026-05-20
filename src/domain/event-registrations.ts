import { z } from "zod";
import type { Locale } from "~/i18n/locale";
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
  anonymizedAt: z.date().nullable(),
  createdAt: z.date(),
  email: z.string(),
  eventTableId: z.uuid(),
  id: z.uuid(),
  phoneNumber: z.string(),
  playerName: z.string(),
});

export type EventRegistration = z.infer<typeof eventRegistrationSchema>;

export type EventRegistrationInput = {
  email: string;
  eventTableId: string;
  locale: Locale;
  phoneNumber: string;
  playerName: string;
};

//------------------------------------------------------------------------------
// Event Registration Cancellation
//------------------------------------------------------------------------------

export const eventRegistrationCancellationRowSchema = z.object({
  event_title: z.string(),
  game_master_name: z.string(),
  location_address: z.string(),
  location_name: z.string(),
  player_name: z.string(),
  table_title: z.string(),
  time_slot_ends_at: z.string(),
  time_slot_starts_at: z.string(),
});

export const eventRegistrationCancellationFromRowSchema =
  eventRegistrationCancellationRowSchema.transform((row) => ({
    eventTitle: row.event_title,
    gameMasterName: row.game_master_name,
    locationAddress: row.location_address,
    locationName: row.location_name,
    playerName: row.player_name,
    tableTitle: row.table_title,
    timeSlotEndsAt: new Date(row.time_slot_ends_at),
    timeSlotStartsAt: new Date(row.time_slot_starts_at),
  }));

export type EventRegistrationCancellation = z.infer<
  typeof eventRegistrationCancellationFromRowSchema
>;

export const eventRegistrationRowSchema = z.object({
  anonymized_at: z.string().nullable(),
  created_at: z.string(),
  email: z.string(),
  event_table_id: z.uuid(),
  id: z.uuid(),
  phone_number: z.string(),
  player_name: z.string(),
});

export const eventRegistrationFromRowSchema =
  eventRegistrationRowSchema.transform(
    (row): EventRegistration => ({
      anonymizedAt: row.anonymized_at ? new Date(row.anonymized_at) : null,
      createdAt: new Date(row.created_at),
      email: row.email,
      eventTableId: row.event_table_id,
      id: row.id,
      phoneNumber: row.phone_number,
      playerName: row.player_name,
    }),
  );

//------------------------------------------------------------------------------
// Cancel Registration With Token
//------------------------------------------------------------------------------

export async function cancelRegistrationWithToken(
  token: string,
): Promise<
  AsyncStateSuccess<EventRegistrationCancellation> | AsyncStateFailure
> {
  const { data, error } = await supabase.rpc("cancel_registration_with_token", {
    p_token: token,
  });

  if (error) return failure("error.event_registrations.cancel_with_token");

  const cancellation = eventRegistrationCancellationFromRowSchema.safeParse(
    data?.[0],
  );
  if (cancellation.error)
    return failure("error.event_registrations.parse_cancellation");

  return success(cancellation.data);
}

//------------------------------------------------------------------------------
// Anonymize Old Event Registrations
//------------------------------------------------------------------------------

export async function anonymizeOldEventRegistrations() {
  const { data, error } = await supabase.rpc(
    "anonymize_old_event_registrations",
  );

  return {
    count: typeof data === "number" ? data : 0,
    error: error ? "error.event_registrations.anonymize_old" : "",
  };
}

//------------------------------------------------------------------------------
// Fetch Registration Cancellation
//------------------------------------------------------------------------------

export async function fetchRegistrationCancellation(
  token: string,
): Promise<
  AsyncStateSuccess<EventRegistrationCancellation> | AsyncStateFailure
> {
  const { data, error } = await supabase.rpc(
    "fetch_registration_cancellation",
    { p_token: token },
  );

  if (error) return failure("error.event_registrations.fetch_cancellation");

  const cancellation = eventRegistrationCancellationFromRowSchema.safeParse(
    data?.[0],
  );
  if (cancellation.error)
    return failure("error.event_registrations.invalid_cancellation_token");

  return success(cancellation.data);
}

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
  locale,
  playerName,
  phoneNumber,
}: EventRegistrationInput) {
  const { error } = await supabase.rpc("register_for_event_table", {
    p_email: email,
    p_event_table_id: eventTableId,
    p_locale: locale,
    p_phone_number: phoneNumber,
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
