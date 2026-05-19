import { useCallback, useState } from "react";
import type { PublicEventTable } from "~/domain/event-tables";
import { fetchPublicEventTables } from "~/domain/event-tables";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  initial,
  loading,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Public Event Tables
//------------------------------------------------------------------------------

export default function usePublicEventTables(eventId?: string) {
  const [eventTablesState, setEventTablesState] =
    useState<AsyncState<PublicEventTable[]>>(initial());

  const incrementRegistrationCount = useCallback(
    (eventTableId: PublicEventTable["id"]) => {
      setEventTablesState((currentEventTablesState) => {
        if (!currentEventTablesState.isSuccess) return currentEventTablesState;

        return success(
          currentEventTablesState.data.map((eventTable) => {
            if (eventTable.id !== eventTableId) return eventTable;

            return {
              ...eventTable,
              registrationCount: eventTable.registrationCount + 1,
            };
          }),
        );
      });
    },
    [],
  );

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

  return { eventTablesState, incrementRegistrationCount };
}
