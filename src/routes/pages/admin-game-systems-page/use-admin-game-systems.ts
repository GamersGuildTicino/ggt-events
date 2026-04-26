import { useCallback, useState } from "react";
import {
  type GameSystem,
  deleteGameSystem,
  fetchGameSystems,
} from "~/domain/game-systems";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Admin Game Systems
//------------------------------------------------------------------------------

export default function useAdminGameSystems() {
  const [deleteError, setDeleteError] = useState("");
  const [deletingGameSystemId, setDeletingGameSystemId] = useState<
    GameSystem["id"] | null
  >(null);
  const [gameSystemsState, setGameSystemsState] =
    useState<AsyncState<GameSystem[]>>(initial());

  const loadGameSystems = useCallback(async () => {
    setGameSystemsState(loading());
    const gameSystems = await fetchGameSystems();
    setGameSystemsState(gameSystems);
  }, []);

  useAsyncEffect(async (isActive) => {
    setGameSystemsState(loading());
    const gameSystems = await fetchGameSystems();
    if (!isActive()) return;
    setGameSystemsState(gameSystems);
  }, []);

  const deleteAdminGameSystem = useCallback(
    async (gameSystemId: GameSystem["id"], confirmed: boolean) => {
      if (!confirmed) return;

      setDeleteError("");
      setDeletingGameSystemId(gameSystemId);
      const error = await deleteGameSystem(gameSystemId);
      setDeletingGameSystemId(null);

      if (error) return setDeleteError(error);
      await loadGameSystems();
    },
    [loadGameSystems],
  );

  return {
    deleteAdminGameSystem,
    deleteError,
    deletingGameSystemId,
    gameSystemsState,
  };
}
