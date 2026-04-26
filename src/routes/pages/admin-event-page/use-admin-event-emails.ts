import { useMemo, useState } from "react";
import { fetchEventRegistrations } from "~/domain/event-registrations";
import { fetchEventTables } from "~/domain/event-tables";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";

//------------------------------------------------------------------------------
// Use Admin Event Emails
//------------------------------------------------------------------------------

export default function useAdminEventEmails(eventId?: string) {
  const [eventEmailsState, setEventEmailsState] =
    useState<AsyncState<string[]>>(initial());

  const eventHasEmails = useMemo(
    () => eventEmailsState.isSuccess && eventEmailsState.data.length > 0,
    [eventEmailsState],
  );

  useAsyncEffect(
    async (isActive) => {
      if (!eventId)
        return setEventEmailsState(
          failure("page.admin_event.error.missing_event"),
        );

      setEventEmailsState(loading());

      const eventTables = await fetchEventTables(eventId);
      if (!isActive()) return;
      if (!eventTables.isSuccess)
        return setEventEmailsState(failure(eventTables.error));

      const registrations = await fetchEventRegistrations(
        eventTables.data.map((eventTable) => eventTable.id),
      );
      if (!isActive()) return;
      if (!registrations.isSuccess)
        return setEventEmailsState(failure(registrations.error));

      const emails = [
        ...new Set(
          registrations.data.map((registration) => registration.email),
        ),
      ].sort((a, b) => a.localeCompare(b));

      setEventEmailsState(success(emails));
    },
    [eventId],
  );

  return { eventEmailsState, eventHasEmails };
}
