import type { EventTimeSlot } from "~/domain/event-time-slots";

//------------------------------------------------------------------------------
// Format Admin Event Time Range
//------------------------------------------------------------------------------

export function formatAdminEventTimeRange(
  timeSlots: EventTimeSlot[],
  locale: string,
) {
  if (timeSlots.length === 0) return "";

  const startsAt = timeSlots[0]?.startsAt;
  const endsAt = timeSlots.at(-1)?.endsAt;
  if (!startsAt || !endsAt) return "";

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  if (startsAt.toDateString() === endsAt.toDateString()) {
    return date.format(startsAt);
  }

  return `${date.format(startsAt)} - ${date.format(endsAt)}`;
}
