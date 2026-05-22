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
// Format Registration Opening Date
//------------------------------------------------------------------------------

export function formatRegistrationOpeningDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

//------------------------------------------------------------------------------
// Format Home Registration Opening Date
//------------------------------------------------------------------------------

export function formatHomeRegistrationOpeningDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
  })
    .format(date)
    .replaceAll(",", "");
}

//------------------------------------------------------------------------------
// Format Long Registration Opening Date
//------------------------------------------------------------------------------

export function formatLongRegistrationOpeningDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}
