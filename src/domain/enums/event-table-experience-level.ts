import { useMemo } from "react";
import { z } from "zod";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Table Experience Level
//------------------------------------------------------------------------------

export const eventTableExperienceLevelSchema = z.enum([
  "unspecified",
  "any",
  "first_time",
  "novice",
  "intermediate",
  "expert",
]);

export const eventTableExperienceLevels =
  eventTableExperienceLevelSchema.options;

export type EventTableExperienceLevel = z.infer<
  typeof eventTableExperienceLevelSchema
>;

//------------------------------------------------------------------------------
// Use Event Table Experience Level Options
//------------------------------------------------------------------------------

export function useEventTableExperienceLevelOptions() {
  const { t } = useI18n();

  return useMemo(() => {
    return eventTableExperienceLevels.map((experienceLevel) => ({
      label: t(`enum.event_table_experience_level.${experienceLevel}`),
      value: experienceLevel,
    }));
  }, [t]);
}

//------------------------------------------------------------------------------
// Experience Level Color Palette
//------------------------------------------------------------------------------

export function experienceLevelColorPalette(
  experienceLevel: EventTableExperienceLevel,
) {
  switch (experienceLevel) {
    case "any":
      return "blue";
    case "expert":
      return "red";
    case "first_time":
      return "green";
    case "intermediate":
      return "orange";
    case "novice":
      return "yellow";
    case "unspecified":
      return "gray";
  }
}
