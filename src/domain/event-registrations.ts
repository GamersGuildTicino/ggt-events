import { supabase } from "~/lib/supabase";

//------------------------------------------------------------------------------
// Event Registration
//------------------------------------------------------------------------------

export type EventRegistrationInput = {
  email: string;
  eventTableId: string;
  playerName: string;
};

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
    default:
      return "error.event_registrations.create";
  }
}
