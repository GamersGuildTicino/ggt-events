import { useState } from "react";
import { type Event, fetchEvent } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  failure,
  initial,
  loading,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Admin Event
//------------------------------------------------------------------------------

export default function useAdminEvent(eventId?: string) {
  const [eventState, setEventState] = useState<AsyncState<Event>>(initial());

  useAsyncEffect(
    async (isActive) => {
      setEventState(loading());

      if (!eventId)
        return setEventState(failure("page.admin_event.error.missing_event"));

      const event = await fetchEvent(eventId);
      if (!isActive()) return;
      setEventState(event);
    },
    [eventId],
  );

  return { eventState, setEventState };
}
