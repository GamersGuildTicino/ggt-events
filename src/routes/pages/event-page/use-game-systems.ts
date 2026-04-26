import { useMemo, useState } from "react";
import type { GameSystem } from "~/domain/game-systems";
import { fetchGameSystems } from "~/domain/game-systems";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Game Systems
//------------------------------------------------------------------------------

export default function useGameSystems() {
  const [gameSystemsState, setGameSystemsState] =
    useState<AsyncState<GameSystem[]>>(initial());

  const gameSystemById = useMemo(() => {
    if (!gameSystemsState.isSuccess) return new Map<string, GameSystem>();
    return new Map(
      gameSystemsState.data.map((gameSystem) => [gameSystem.id, gameSystem]),
    );
  }, [gameSystemsState]);

  useAsyncEffect(async (isActive) => {
    setGameSystemsState(loading());
    const gameSystems = await fetchGameSystems();
    if (!isActive()) return;
    setGameSystemsState(gameSystems);
  }, []);

  return { gameSystemById, gameSystemsState };
}
