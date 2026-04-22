import z from "zod";
import { supabase } from "~/lib/supabase";
import {
  type AsyncStateFailure,
  type AsyncStateSuccess,
  failure,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Game System
//------------------------------------------------------------------------------

export const gameSystemSchema = z.object({
  createdAt: z.date(),
  createdBy: z.uuid(),
  description: z.string(),
  id: z.uuid(),
  imageUrl: z.string(),
  name: z.string(),
  updatedAt: z.date(),
});

export type GameSystem = z.infer<typeof gameSystemSchema>;

//------------------------------------------------------------------------------
// Game System Row
//------------------------------------------------------------------------------

export const gameSystemRowSchema = z.object({
  created_at: z.string(),
  created_by: z.uuid(),
  description: z.string(),
  id: z.uuid(),
  image_url: z.string(),
  name: z.string(),
  updated_at: z.string(),
});

export type GameSystemRow = z.infer<typeof gameSystemRowSchema>;

//------------------------------------------------------------------------------
// Game System From Row
//------------------------------------------------------------------------------

export const gameSystemFromRowSchema = gameSystemRowSchema.transform(
  (row): GameSystem => ({
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    description: row.description,
    id: row.id,
    imageUrl: row.image_url,
    name: row.name,
    updatedAt: new Date(row.updated_at),
  }),
);

//------------------------------------------------------------------------------
// Create Game System
//------------------------------------------------------------------------------

export async function createGameSystem(
  gameSystem: Omit<GameSystem, "createdAt" | "id" | "updatedAt">,
) {
  const { error } = await supabase.from("game_systems").insert({
    created_by: gameSystem.createdBy,
    description: gameSystem.description,
    image_url: gameSystem.imageUrl,
    name: gameSystem.name,
  });

  return error?.message ?? "";
}

//------------------------------------------------------------------------------
// Fetch Game System
//------------------------------------------------------------------------------

export async function fetchGameSystem(
  gameSystemId: GameSystem["id"],
): Promise<AsyncStateSuccess<GameSystem> | AsyncStateFailure> {
  const { data, error } = await supabase
    .from("game_systems")
    .select("*")
    .eq("id", gameSystemId)
    .single();

  if (error) return failure(error.message);

  const gameSystem = gameSystemFromRowSchema.safeParse(data);
  if (gameSystem.error) return failure("Failed to parse game system");

  return success(gameSystem.data);
}

//------------------------------------------------------------------------------
// Fetch Game Systems
//------------------------------------------------------------------------------

export async function fetchGameSystems(): Promise<
  AsyncStateSuccess<GameSystem[]> | AsyncStateFailure
> {
  const { data, error } = await supabase
    .from("game_systems")
    .select("*")
    .order("name", { ascending: true });

  if (error) return failure(error.message);

  const gameSystems = z.array(gameSystemFromRowSchema).safeParse(data);
  if (gameSystems.error) return failure("Failed to parse game systems");

  return success(gameSystems.data);
}

//------------------------------------------------------------------------------
// Update Game System
//------------------------------------------------------------------------------

export async function updateGameSystem(
  gameSystem: Pick<GameSystem, "id"> &
    Omit<GameSystem, "createdAt" | "createdBy" | "id" | "updatedAt">,
) {
  const { error } = await supabase
    .from("game_systems")
    .update({
      description: gameSystem.description,
      image_url: gameSystem.imageUrl,
      name: gameSystem.name,
    })
    .eq("id", gameSystem.id);

  return error?.message ?? "";
}
