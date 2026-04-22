import z from "zod";
import { supabase } from "~/lib/supabase";
import {
  type AsyncStateFailure,
  type AsyncStateSuccess,
  failure,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Event Table
//------------------------------------------------------------------------------

export const eventTableSchema = z.object({
  createdAt: z.date(),
  createdBy: z.uuid(),
  description: z.string(),
  eventId: z.uuid(),
  gameMasterName: z.string(),
  gameSystemId: z.uuid(),
  id: z.uuid(),
  maxPlayers: z.number().int(),
  minPlayers: z.number().int(),
  title: z.string(),
  updatedAt: z.date(),
});

export type EventTable = z.infer<typeof eventTableSchema>;

//------------------------------------------------------------------------------
// Event Table Row
//------------------------------------------------------------------------------

export const eventTableRowSchema = z.object({
  created_at: z.string(),
  created_by: z.uuid(),
  description: z.string(),
  event_id: z.uuid(),
  game_master_name: z.string(),
  game_system_id: z.uuid(),
  id: z.uuid(),
  max_players: z.number().int(),
  min_players: z.number().int(),
  title: z.string(),
  updated_at: z.string(),
});

export type EventTableRow = z.infer<typeof eventTableRowSchema>;

//------------------------------------------------------------------------------
// Event Table From Row
//------------------------------------------------------------------------------

export const eventTableFromRowSchema = eventTableRowSchema.transform(
  (row): EventTable => ({
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    description: row.description,
    eventId: row.event_id,
    gameMasterName: row.game_master_name,
    gameSystemId: row.game_system_id,
    id: row.id,
    maxPlayers: row.max_players,
    minPlayers: row.min_players,
    title: row.title,
    updatedAt: new Date(row.updated_at),
  }),
);

//------------------------------------------------------------------------------
// Create Event Table
//------------------------------------------------------------------------------

export async function createEventTable(
  eventTable: Omit<EventTable, "createdAt" | "id" | "updatedAt">,
) {
  const { error } = await supabase.from("event_tables").insert({
    created_by: eventTable.createdBy,
    description: eventTable.description,
    event_id: eventTable.eventId,
    game_master_name: eventTable.gameMasterName,
    game_system_id: eventTable.gameSystemId,
    max_players: eventTable.maxPlayers,
    min_players: eventTable.minPlayers,
    title: eventTable.title,
  });

  return error ? "error.event_tables.create" : "";
}

//------------------------------------------------------------------------------
// Delete Event Table
//------------------------------------------------------------------------------

export async function deleteEventTable(eventTableId: EventTable["id"]) {
  const { error } = await supabase
    .from("event_tables")
    .delete()
    .eq("id", eventTableId);

  return error ? "error.event_tables.delete" : "";
}

//------------------------------------------------------------------------------
// Fetch Event Tables
//------------------------------------------------------------------------------

export async function fetchEventTables(
  eventId: EventTable["eventId"],
): Promise<AsyncStateSuccess<EventTable[]> | AsyncStateFailure> {
  const { data, error } = await supabase
    .from("event_tables")
    .select("*")
    .eq("event_id", eventId)
    .order("title", { ascending: true });

  if (error) return failure("error.event_tables.fetch_many");

  const eventTables = z.array(eventTableFromRowSchema).safeParse(data);
  if (eventTables.error) return failure("error.event_tables.parse_many");

  return success(eventTables.data);
}

//------------------------------------------------------------------------------
// Update Event Table
//------------------------------------------------------------------------------

export async function updateEventTable(
  eventTable: Pick<EventTable, "id"> &
    Omit<
      EventTable,
      "createdAt" | "createdBy" | "eventId" | "id" | "updatedAt"
    >,
) {
  const { error } = await supabase
    .from("event_tables")
    .update({
      description: eventTable.description,
      game_master_name: eventTable.gameMasterName,
      game_system_id: eventTable.gameSystemId,
      max_players: eventTable.maxPlayers,
      min_players: eventTable.minPlayers,
      title: eventTable.title,
    })
    .eq("id", eventTable.id);

  return error ? "error.event_tables.update" : "";
}
