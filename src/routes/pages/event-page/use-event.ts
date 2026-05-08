import { useState } from "react";
import {
  type Event,
  fetchPublicEventById,
  fetchPublicEventBySlug,
} from "~/domain/events";
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

export default function useEvent(eventSlugOrId?: string) {
  const [eventState, setEventState] = useState<AsyncState<Event>>(initial());

  useAsyncEffect(
    async (isActive) => {
      setEventState(loading());

      if (!eventSlugOrId)
        return setEventState(failure("page.event.error.missing"));

      const event =
        uuidRegexp.test(eventSlugOrId) ?
          await fetchPublicEventById(eventSlugOrId)
        : await fetchPublicEventBySlug(eventSlugOrId);

      if (!isActive()) return;
      setEventState(event);
    },
    [eventSlugOrId],
  );

  return eventState;
}

//------------------------------------------------------------------------------
// UUID Regexp
//------------------------------------------------------------------------------

const uuidRegexp =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
