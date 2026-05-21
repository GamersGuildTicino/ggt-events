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
  backgroundImageUrl: z.string(),
  coverImageUrl: z.string(),
  createdAt: z.date(),
  createdBy: z.uuid(),
  description: z.string(),
  id: z.uuid(),
  logoImageUrl: z.string(),
  name: z.string(),
  updatedAt: z.date(),
});

export type GameSystem = z.infer<typeof gameSystemSchema>;

//------------------------------------------------------------------------------
// Game System Row
//------------------------------------------------------------------------------

export const gameSystemRowSchema = z.object({
  background_image_url: z.string(),
  cover_image_url: z.string(),
  created_at: z.string(),
  created_by: z.uuid(),
  description: z.string(),
  id: z.uuid(),
  logo_image_url: z.string(),
  name: z.string(),
  updated_at: z.string(),
});

export type GameSystemRow = z.infer<typeof gameSystemRowSchema>;

//------------------------------------------------------------------------------
// Game System From Row
//------------------------------------------------------------------------------

export const gameSystemFromRowSchema = gameSystemRowSchema.transform(
  (row): GameSystem => ({
    backgroundImageUrl: row.background_image_url,
    coverImageUrl: row.cover_image_url,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
    description: row.description,
    id: row.id,
    logoImageUrl: row.logo_image_url,
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
    background_image_url: gameSystem.backgroundImageUrl,
    cover_image_url: gameSystem.coverImageUrl,
    created_by: gameSystem.createdBy,
    description: gameSystem.description,
    logo_image_url: gameSystem.logoImageUrl,
    name: gameSystem.name,
  });

  return error ? "error.game_systems.create" : "";
}

//------------------------------------------------------------------------------
// Delete Game System
//------------------------------------------------------------------------------

export async function deleteGameSystem(gameSystemId: GameSystem["id"]) {
  const { error } = await supabase
    .from("game_systems")
    .delete()
    .eq("id", gameSystemId);

  return error ? "error.game_systems.delete" : "";
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

  if (error) return failure("error.game_systems.fetch_one");

  const gameSystem = gameSystemFromRowSchema.safeParse(data);
  if (gameSystem.error) return failure("error.game_systems.parse_one");

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

  if (error) return failure("error.game_systems.fetch_many");

  const gameSystems = z.array(gameSystemFromRowSchema).safeParse(data);
  if (gameSystems.error) return failure("error.game_systems.parse_many");

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
      background_image_url: gameSystem.backgroundImageUrl,
      cover_image_url: gameSystem.coverImageUrl,
      description: gameSystem.description,
      logo_image_url: gameSystem.logoImageUrl,
      name: gameSystem.name,
    })
    .eq("id", gameSystem.id);

  return error ? "error.game_systems.update" : "";
}
