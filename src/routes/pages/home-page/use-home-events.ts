import { useMemo, useState } from "react";
import {
  type EventTimeSlot,
  fetchEventTimeSlots,
} from "~/domain/event-time-slots";
import { type Event, fetchPublicEvents } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Upcoming Home Event
//------------------------------------------------------------------------------

export type UpcomingHomeEvent = {
  event: Event;
  timeSlots: EventTimeSlot[];
};

//------------------------------------------------------------------------------
// Use Home Events
//------------------------------------------------------------------------------

export default function useHomeEvents() {
  const [eventsState, setEventsState] =
    useState<AsyncState<Event[]>>(initial());
  const [timeSlotsByEventId, setTimeSlotsByEventId] = useState<
    Record<Event["id"], EventTimeSlot[]>
  >({});

  useAsyncEffect(async (isActive) => {
    setEventsState(loading());
    const events = await fetchPublicEvents();
    if (!isActive()) return;
    setEventsState(events);
    if (!events.isSuccess) return;

    const entries = await Promise.all(
      events.data.map(async (event) => {
        const timeSlots = await fetchEventTimeSlots(event.id);
        return [event.id, timeSlots.isSuccess ? timeSlots.data : []] as const;
      }),
    );
    if (!isActive()) return;
    setTimeSlotsByEventId(Object.fromEntries(entries));
  }, []);

  const upcomingEvents = useMemo(() => {
    if (!eventsState.isSuccess) return [];

    return eventsState.data
      .map((event) => ({
        event,
        timeSlots: timeSlotsByEventId[event.id] ?? [],
      }))
      .filter(({ timeSlots }) =>
        timeSlots.some((timeSlot) => timeSlot.endsAt >= new Date()),
      )
      .sort((a, b) => {
        const aStartsAt = a.timeSlots[0]?.startsAt.getTime() ?? 0;
        const bStartsAt = b.timeSlots[0]?.startsAt.getTime() ?? 0;
        return aStartsAt - bStartsAt;
      });
  }, [eventsState, timeSlotsByEventId]);

  return {
    eventsState,
    timeSlotsByEventId,
    upcomingEvents,
  };
}
