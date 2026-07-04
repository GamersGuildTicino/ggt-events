import { useCallback, useState } from "react";
import {
  type HomeMessage,
  fetchAdminHomeNoUpcomingEventsMessage,
  updateHomeNoUpcomingEventsMessage,
} from "~/domain/home-messages";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import type { HomeMessageFormValue } from "../../components/home-message-form";

//------------------------------------------------------------------------------
// Use Admin Home Message
//------------------------------------------------------------------------------

export default function useAdminHomeMessage() {
  const [homeMessageState, setHomeMessageState] =
    useState<AsyncState<HomeMessage>>(initial());
  const [saveState, setSaveState] = useState<AsyncState>(initial());

  useAsyncEffect(async (isActive) => {
    setHomeMessageState(loading());
    const homeMessage = await fetchAdminHomeNoUpcomingEventsMessage();
    if (!isActive()) return;
    setHomeMessageState(homeMessage);
  }, []);

  const updateAdminHomeMessage = useCallback(
    async (value: HomeMessageFormValue) => {
      if (!homeMessageState.isSuccess) return false;

      try {
        setSaveState(loading());

        const updatedHomeMessage: HomeMessage = {
          ...homeMessageState.data,
          ...value,
        };

        const error =
          await updateHomeNoUpcomingEventsMessage(updatedHomeMessage);
        if (error) {
          setSaveState(failure(error));
          return false;
        }

        setHomeMessageState(success(updatedHomeMessage));
        setSaveState(success(undefined));
        return true;
      } catch (e) {
        console.error(e);
        setSaveState(failure("page.admin_home_message.error.generic"));
        return false;
      }
    },
    [homeMessageState],
  );

  return {
    homeMessageState,
    saveState,
    updateAdminHomeMessage,
  };
}
