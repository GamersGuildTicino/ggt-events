import { useCallback, useState } from "react";
import {
  type GameSystem,
  fetchGameSystem,
  updateGameSystem,
} from "~/domain/game-systems";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import type { GameSystemFormValue } from "../../components/game-system-form";

//------------------------------------------------------------------------------
// Use Admin Game System
//------------------------------------------------------------------------------

export default function useAdminGameSystem(gameSystemId?: string) {
  const [gameSystemState, setGameSystemState] =
    useState<AsyncState<GameSystem>>(initial());
  const [saveState, setSaveState] = useState<AsyncState>(initial());

  useAsyncEffect(
    async (isActive) => {
      setGameSystemState(loading());

      if (!gameSystemId)
        return setGameSystemState(
          failure("page.admin_game_system.error.missing_game_system"),
        );

      const gameSystem = await fetchGameSystem(gameSystemId);
      if (!isActive()) return;
      setGameSystemState(gameSystem);
    },
    [gameSystemId],
  );

  const updateAdminGameSystem = useCallback(
    async (value: GameSystemFormValue) => {
      if (!gameSystemState.isSuccess) return false;

      try {
        setSaveState(loading());

        const updatedGameSystem: GameSystem = {
          ...gameSystemState.data,
          ...value,
        };

        const error = await updateGameSystem(updatedGameSystem);
        if (error) {
          setSaveState(failure(error));
          return false;
        }

        setGameSystemState(success(updatedGameSystem));
        setSaveState(success(undefined));
        return true;
      } catch (e) {
        console.error(e);
        setSaveState(failure("page.admin_game_system.error.generic"));
        return false;
      }
    },
    [gameSystemState],
  );

  return {
    gameSystemState,
    saveState,
    updateAdminGameSystem,
  };
}
