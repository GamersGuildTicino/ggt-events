import { useState } from "react";
import type { Event } from "~/domain/events";
import { fetchPublicEvent } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  failure,
  initial,
  loading,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Event
//------------------------------------------------------------------------------

export default function useEvent(eventId?: string) {
  const [eventState, setEventState] = useState<AsyncState<Event>>(initial());

  useAsyncEffect(
    async (isActive) => {
      setEventState(loading());

      if (!eventId) return setEventState(failure("page.event.error.missing"));

      const event = await fetchPublicEvent(eventId);
      if (!isActive()) return;
      setEventState(event);
    },
    [eventId],
  );

  return eventState;
}
