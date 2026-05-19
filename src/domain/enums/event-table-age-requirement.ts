import { useMemo } from "react";
import { z } from "zod";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Table Age Requirement
//------------------------------------------------------------------------------

export const eventTableAgeRequirementSchema = z.enum([
  "kids",
  "age_14_plus",
  "age_15_plus",
  "age_16_plus",
  "age_17_plus",
  "age_18_plus",
]);

export const eventTableAgeRequirements = eventTableAgeRequirementSchema.options;

export type EventTableAgeRequirement = z.infer<
  typeof eventTableAgeRequirementSchema
>;

//------------------------------------------------------------------------------
// Use Event Table Age Requirement Options
//------------------------------------------------------------------------------

export function useEventTableAgeRequirementOptions() {
  const { t } = useI18n();

  return useMemo(() => {
    return eventTableAgeRequirements.map((ageRequirement) => ({
      label: t(`enum.event_table_age_requirement.${ageRequirement}`),
      value: ageRequirement,
    }));
  }, [t]);
}

//------------------------------------------------------------------------------
// Age Requirement Color Palette
//------------------------------------------------------------------------------

export function ageRequirementColorPalette(
  ageRequirement: EventTableAgeRequirement,
) {
  switch (ageRequirement) {
    case "age_14_plus":
      return "blue";
    case "age_15_plus":
      return "cyan";
    case "age_16_plus":
      return "yellow";
    case "age_17_plus":
      return "orange";
    case "age_18_plus":
      return "red";
    case "kids":
      return "green";
  }
}
