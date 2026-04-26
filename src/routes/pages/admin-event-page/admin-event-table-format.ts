import type { EventTimeSlot } from "~/domain/event-time-slots";

//------------------------------------------------------------------------------
// Admin Event Table Format
//------------------------------------------------------------------------------

export function formatSlot(timeSlot: EventTimeSlot, locale: string) {
  return `${formatDateTime(timeSlot.startsAt, locale)}-${formatTime(timeSlot.endsAt, locale)}`;
}

//------------------------------------------------------------------------------
// Format Date Time
//------------------------------------------------------------------------------

function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

//------------------------------------------------------------------------------
// Format Time
//------------------------------------------------------------------------------

function formatTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(date);
}
