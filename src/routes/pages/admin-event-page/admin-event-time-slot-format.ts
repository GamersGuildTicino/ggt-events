import type { EventTimeSlot } from "~/domain/event-time-slots";

//------------------------------------------------------------------------------
// Format Admin Event Time Slot
//------------------------------------------------------------------------------

export function formatAdminEventTimeSlot(
  timeSlot: EventTimeSlot,
  locale: string,
) {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    timeSlot.startsAt,
  );
  const startsAt = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(timeSlot.startsAt);
  const endsAt = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(timeSlot.endsAt);

  return `${date}, ${startsAt}-${endsAt}`;
}
