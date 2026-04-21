import { supabase } from "~/lib/supabase";
import type { EventVisibility } from "./enums/event-visibility";

//------------------------------------------------------------------------------
// Create Event
//------------------------------------------------------------------------------

export async function createEvent(values: {
  createdBy: string;
  locationAddress: string;
  locationName: string;
  registrationsOpen: boolean;
  startsAt: Date;
  title: string;
  visibility: EventVisibility;
}) {
  const { error } = await supabase.from("events").insert({
    created_by: values.createdBy,
    location_address: values.locationAddress,
    location_name: values.locationName || null,
    registrations_open: values.registrationsOpen,
    starts_at: values.startsAt.toISOString(),
    title: values.title,
    visibility: values.visibility,
  });

  return error?.message ?? "";
}
