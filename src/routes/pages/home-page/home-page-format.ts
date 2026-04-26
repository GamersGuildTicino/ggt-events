import type { EventTimeSlot } from "~/domain/event-time-slots";

//------------------------------------------------------------------------------
// Format Home Time Slot Range
//------------------------------------------------------------------------------

export function formatHomeTimeSlotRange(
  timeSlots: EventTimeSlot[],
  locale: string,
) {
  const firstTimeSlot = timeSlots[0];
  const lastTimeSlot = timeSlots.at(-1);
  if (!firstTimeSlot || !lastTimeSlot) return "";

  const date = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
  }).format(firstTimeSlot.startsAt);

  if (
    firstTimeSlot.startsAt.toDateString() !== lastTimeSlot.endsAt.toDateString()
  ) {
    const endDate = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(lastTimeSlot.endsAt);
    return `${capitalizeHomeValue(date)} - ${endDate}`;
  }

  const endTime = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(lastTimeSlot.endsAt);

  return `${capitalizeHomeValue(date)} - ${endTime}`;
}

//------------------------------------------------------------------------------
// Capitalize Home Value
//------------------------------------------------------------------------------

function capitalizeHomeValue(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}
