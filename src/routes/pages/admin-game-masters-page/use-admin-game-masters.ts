import { useCallback, useState } from "react";
import {
  type EventManager,
  fetchEventManagers,
  removeEventManager,
} from "~/domain/event-managers";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { type AsyncState, initial, loading } from "~/utils/async-state";

export default function useAdminGameMasters() {
  const [eventManagersState, setEventManagersState] =
    useState<AsyncState<EventManager[]>>(initial());
  const [removeError, setRemoveError] = useState("");
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const loadEventManagers = useCallback(async () => {
    setEventManagersState(loading());
    setEventManagersState(await fetchEventManagers());
  }, []);

  useAsyncEffect(async (isActive) => {
    const managers = await fetchEventManagers();
    if (isActive()) setEventManagersState(managers);
  }, []);

  const removeManager = async (userId: string, confirmed: boolean) => {
    if (!confirmed) return;
    setRemoveError("");
    setRemovingUserId(userId);
    const error = await removeEventManager(userId);
    setRemovingUserId(null);
    if (error) {
      setRemoveError(error);
      return;
    }
    await loadEventManagers();
  };

  return {
    eventManagersState,
    loadEventManagers,
    removeError,
    removeManager,
    removingUserId,
  };
}
