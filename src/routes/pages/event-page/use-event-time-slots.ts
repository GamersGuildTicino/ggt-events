import { useState } from "react";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import { fetchEventTimeSlots } from "~/domain/event-time-slots";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Event Time Slots
//------------------------------------------------------------------------------

export default function useEventTimeSlots(eventId?: string) {
  const [eventTimeSlotsState, setEventTimeSlotsState] =
    useState<AsyncState<EventTimeSlot[]>>(initial());

  useAsyncEffect(
    async (isActive) => {
      if (!eventId) return;

      setEventTimeSlotsState(loading());
      const eventTimeSlots = await fetchEventTimeSlots(eventId);
      if (!isActive()) return;
      setEventTimeSlotsState(eventTimeSlots);
    },
    [eventId],
  );

  return eventTimeSlotsState;
}
