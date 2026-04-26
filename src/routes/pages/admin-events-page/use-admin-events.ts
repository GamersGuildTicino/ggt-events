import { useMemo, useState } from "react";
import { fetchEventRegistrations } from "~/domain/event-registrations";
import { fetchEventTables } from "~/domain/event-tables";
import {
  type EventTimeSlot,
  fetchEventTimeSlots,
} from "~/domain/event-time-slots";
import { type Event, deleteEvent, fetchEvents } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import type { Locale } from "~/i18n/locale";
import { type AsyncState, initial, loading } from "~/utils/async-state";
import { createMailtoUrl } from "~/utils/mailto";

//------------------------------------------------------------------------------
// Event Summary Stats
//------------------------------------------------------------------------------

export type EventSummaryStats = {
  emails: string[];
  occupiedSeats: number;
  occupiedTables: number;
  totalSeats: number;
  totalTables: number;
};

//------------------------------------------------------------------------------
// Use Admin Events
//------------------------------------------------------------------------------

export default function useAdminEvents(locale: Locale) {
  const [copyError, setCopyError] = useState("");
  const [copiedEventTitle, setCopiedEventTitle] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [eventsState, setEventsState] =
    useState<AsyncState<Event[]>>(initial());
  const [timeSlotsByEventId, setTimeSlotsByEventId] = useState<
    Record<Event["id"], EventTimeSlot[]>
  >({});
  const [statsByEventId, setStatsByEventId] = useState<
    Record<Event["id"], EventSummaryStats>
  >({});

  const sortedEvents = useMemo(() => {
    if (!eventsState.isSuccess) return [];

    return [...eventsState.data].sort((a, b) => {
      const aTimeSlots = timeSlotsByEventId[a.id] ?? [];
      const bTimeSlots = timeSlotsByEventId[b.id] ?? [];
      const aHasTimeSlots = aTimeSlots.length > 0;
      const bHasTimeSlots = bTimeSlots.length > 0;

      if (!aHasTimeSlots && !bHasTimeSlots) return 0;
      if (!aHasTimeSlots) return -1;
      if (!bHasTimeSlots) return 1;

      const aLatestStartsAt = Math.max(
        ...aTimeSlots.map((timeSlot) => timeSlot.startsAt.getTime()),
      );
      const bLatestStartsAt = Math.max(
        ...bTimeSlots.map((timeSlot) => timeSlot.startsAt.getTime()),
      );

      return bLatestStartsAt - aLatestStartsAt;
    });
  }, [eventsState, timeSlotsByEventId]);

  const loadEventMeta = async (events: Event[]) => {
    const entries = await Promise.all(
      events.map(async (event) => {
        const [timeSlots, eventTables] = await Promise.all([
          fetchEventTimeSlots(event.id),
          fetchEventTables(event.id),
        ]);

        const timeSlotsData = timeSlots.isSuccess ? timeSlots.data : [];
        if (!eventTables.isSuccess) {
          return [event.id, { stats: null, timeSlots: timeSlotsData }] as const;
        }

        const registrations = await fetchEventRegistrations(
          eventTables.data.map((eventTable) => eventTable.id),
        );

        const registrationsByTableId = new Map<string, number>();
        const emails = new Set<string>();
        if (registrations.isSuccess) {
          for (const registration of registrations.data) {
            registrationsByTableId.set(
              registration.eventTableId,
              (registrationsByTableId.get(registration.eventTableId) ?? 0) + 1,
            );
            emails.add(registration.email);
          }
        }

        const occupiedSeats =
          registrations.isSuccess ? registrations.data.length : 0;
        const occupiedTables = eventTables.data.filter(
          (eventTable) => (registrationsByTableId.get(eventTable.id) ?? 0) > 0,
        ).length;
        const totalSeats = eventTables.data.reduce(
          (sum, eventTable) => sum + eventTable.maxPlayers,
          0,
        );
        const totalTables = eventTables.data.length;

        return [
          event.id,
          {
            stats: {
              emails: [...emails].sort((a, b) => a.localeCompare(b, locale)),
              occupiedSeats,
              occupiedTables,
              totalSeats,
              totalTables,
            },
            timeSlots: timeSlotsData,
          },
        ] as const;
      }),
    );

    setTimeSlotsByEventId(
      Object.fromEntries(
        entries.map(([eventId, data]) => [eventId, data.timeSlots]),
      ),
    );
    setStatsByEventId(
      Object.fromEntries(
        entries.flatMap(([eventId, data]) =>
          data.stats ? [[eventId, data.stats] as const] : [],
        ),
      ),
    );
  };

  const loadEvents = async () => {
    setEventsState(loading());
    const events = await fetchEvents();
    setEventsState(events);
    if (events.isSuccess) await loadEventMeta(events.data);
  };

  useAsyncEffect(
    async (isActive) => {
      setEventsState(loading());
      const events = await fetchEvents();
      if (!isActive()) return;
      setEventsState(events);
      if (!events.isSuccess) return;
      await loadEventMeta(events.data);
      if (!isActive()) return;
    },
    [locale],
  );

  const deleteAdminEvent = async (event: Event, confirmed: boolean) => {
    if (!confirmed) return;

    setDeleteError("");
    const error = await deleteEvent(event.id);

    if (error) return setDeleteError(error);
    await loadEvents();
  };

  const copyAdminEventEmails = async (event: Event) => {
    const emails = statsByEventId[event.id]?.emails ?? [];
    if (emails.length === 0) return;

    setCopyError("");

    try {
      await navigator.clipboard.writeText(emails.join(", "));
      setCopiedEventTitle(event.title);
      window.setTimeout(
        () =>
          setCopiedEventTitle((title) => (title === event.title ? "" : title)),
        2000,
      );
    } catch {
      setCopyError("page.admin_events.copy_emails_error");
    }
  };

  const composeAdminEventEmail = (
    event: Event,
    body: string,
    subject: string,
  ) => {
    const emails = statsByEventId[event.id]?.emails ?? [];
    if (emails.length === 0) return;

    setEmailError("");

    try {
      window.location.href = createMailtoUrl({
        bcc: emails,
        body,
        subject,
      });
    } catch {
      setEmailError("page.admin_events.compose_email_error");
    }
  };

  return {
    composeAdminEventEmail,
    copiedEventTitle,
    copyAdminEventEmails,
    copyError,
    deleteAdminEvent,
    deleteError,
    emailError,
    eventsState,
    loadEvents,
    sortedEvents,
    statsByEventId,
    timeSlotsByEventId,
  };
}
