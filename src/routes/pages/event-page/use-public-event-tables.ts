import { useState } from "react";
import type { PublicEventTable } from "~/domain/event-tables";
import { fetchPublicEventTables } from "~/domain/event-tables";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Public Event Tables
//------------------------------------------------------------------------------

export default function usePublicEventTables(eventId?: string) {
  const [eventTablesState, setEventTablesState] =
    useState<AsyncState<PublicEventTable[]>>(initial());

  useAsyncEffect(
    async (isActive) => {
      if (!eventId) return;

      setEventTablesState(loading());
      const eventTables = await fetchPublicEventTables(eventId);
      if (!isActive()) return;
      setEventTablesState(eventTables);
    },
    [eventId],
  );

  return eventTablesState;
}
