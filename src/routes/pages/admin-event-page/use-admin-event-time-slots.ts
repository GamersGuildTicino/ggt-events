import { useCallback, useState } from "react";
import {
  type EventTimeSlot,
  fetchEventTimeSlots,
} from "~/domain/event-time-slots";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  failure,
  initial,
  loading,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Admin Event Time Slots
//------------------------------------------------------------------------------

export default function useAdminEventTimeSlots(eventId?: string) {
  const [eventTimeSlotsState, setEventTimeSlotsState] =
    useState<AsyncState<EventTimeSlot[]>>(initial());

  const loadTimeSlots = useCallback(async () => {
    if (!eventId) return;
    setEventTimeSlotsState(loading());
    const timeSlots = await fetchEventTimeSlots(eventId);
    setEventTimeSlotsState(timeSlots);
  }, [eventId]);

  useAsyncEffect(
    async (isActive) => {
      setEventTimeSlotsState(loading());

      if (!eventId)
        return setEventTimeSlotsState(
          failure("page.admin_event.error.missing_event"),
        );

      const timeSlots = await fetchEventTimeSlots(eventId);
      if (!isActive()) return;
      setEventTimeSlotsState(timeSlots);
    },
    [eventId],
  );

  return { eventTimeSlotsState, loadTimeSlots };
}
