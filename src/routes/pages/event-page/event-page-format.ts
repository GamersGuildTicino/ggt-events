import type { EventTimeSlot } from "~/domain/event-time-slots";

//------------------------------------------------------------------------------
// Format Date Range
//------------------------------------------------------------------------------

export function formatDateRange(timeSlots: EventTimeSlot[], locale: string) {
  const firstTimeSlot = timeSlots[0];
  const lastTimeSlot = timeSlots.at(-1);
  if (!firstTimeSlot || !lastTimeSlot) return "";

  const format = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const startDate = capitalize(format.format(firstTimeSlot.startsAt));
  const endDate = capitalize(format.format(lastTimeSlot.endsAt));

  if (startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
}

//------------------------------------------------------------------------------
// Format Slot
//------------------------------------------------------------------------------

export function formatSlot(
  timeSlot: EventTimeSlot,
  locale: string,
  showDate: boolean,
) {
  const time = `${formatTime(timeSlot.startsAt, locale)}-${formatTime(timeSlot.endsAt, locale)}`;
  if (!showDate) return time;

  const date = capitalize(
    new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(
      timeSlot.startsAt,
    ),
  );

  return `${date}, ${time}`;
}

//------------------------------------------------------------------------------
// Format Time Range
//------------------------------------------------------------------------------

export function formatTimeRange(timeSlots: EventTimeSlot[], locale: string) {
  const firstTimeSlot = timeSlots[0];
  const lastTimeSlot = timeSlots.at(-1);
  if (!firstTimeSlot || !lastTimeSlot) return "";

  return `${formatTime(firstTimeSlot.startsAt, locale)} - ${formatTime(lastTimeSlot.endsAt, locale)}`;
}

//------------------------------------------------------------------------------
// Is Past Time Slot
//------------------------------------------------------------------------------

export function isPastTimeSlot(timeSlot: EventTimeSlot) {
  return timeSlot.endsAt <= new Date();
}

//------------------------------------------------------------------------------
// Seat Availability Color
//------------------------------------------------------------------------------

export function seatAvailabilityColor(
  availableSeats: number,
  maxPlayers: number,
) {
  if (availableSeats === 0) return "red.600";
  if (availableSeats <= Math.max(2, Math.ceil(maxPlayers / 4)))
    return "orange.600";
  return "green.600";
}

//------------------------------------------------------------------------------
// Spans Multiple Days
//------------------------------------------------------------------------------

export function spansMultipleDays(timeSlots: EventTimeSlot[]) {
  const firstDate = timeSlots[0]?.startsAt.toDateString();
  if (!firstDate) return false;
  return timeSlots.some(
    (timeSlot) => timeSlot.startsAt.toDateString() !== firstDate,
  );
}

//------------------------------------------------------------------------------
// Capitalize
//------------------------------------------------------------------------------

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

//------------------------------------------------------------------------------
// Format Time
//------------------------------------------------------------------------------

function formatTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(date);
}
