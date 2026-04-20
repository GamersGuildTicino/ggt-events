import { useMemo } from "react";
import { z } from "zod";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Visibility
//------------------------------------------------------------------------------

export const eventVisibilitySchema = z.enum([
  "public",
  "restricted",
  "private",
]);

export const eventVisibilities = eventVisibilitySchema.options;

export type EventVisibility = z.infer<typeof eventVisibilitySchema>;

//------------------------------------------------------------------------------
// Use Event Visibility Options
//------------------------------------------------------------------------------

export function useEventVisibilityOptions() {
  const { t } = useI18n();

  return useMemo(() => {
    return eventVisibilities.map((eventVisibility) => ({
      label: t(`enum.event_visibility.${eventVisibility}`),
      value: eventVisibility,
    }));
  }, [t]);
}
