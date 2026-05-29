import type { EventTimeSlot } from "./event-time-slots";
import { isEventOver } from "./event-time-slots";
import type { Event } from "./events";

//------------------------------------------------------------------------------
// Should Show Registration Opening Date
//------------------------------------------------------------------------------

export function shouldShowRegistrationOpeningDate(
  event: Event,
  timeSlots: EventTimeSlot[],
) {
  return !event.registrationsOpen && !isEventOver(timeSlots);
}

//------------------------------------------------------------------------------
// Format Registration Opening Date Medium
//------------------------------------------------------------------------------

export function formatRegistrationOpeningDateMedium(
  date: Date,
  locale: string,
) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

//------------------------------------------------------------------------------
// Format Registration Opening Date Short
//------------------------------------------------------------------------------

export function formatRegistrationOpeningDateShort(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
  })
    .format(date)
    .replaceAll(",", "");
}

//------------------------------------------------------------------------------
// Format Registration Opening Date Long
//------------------------------------------------------------------------------

export function formatRegistrationOpeningDateLong(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}
