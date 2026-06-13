import { useMemo } from "react";
import { z } from "zod";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Table Age Requirement
//------------------------------------------------------------------------------

export const eventTableAgeRequirementSchema = z.enum([
  "any",
  "age_9_11",
  "age_11_13",
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
// Is Kids Age Requirement
//------------------------------------------------------------------------------

export function isKidsAgeRequirement(ageRequirement: EventTableAgeRequirement) {
  return ageRequirement === "age_9_11" || ageRequirement === "age_11_13";
}

//------------------------------------------------------------------------------
// Requires Minor Guardian Contact
//------------------------------------------------------------------------------

export function requiresMinorGuardianContact(
  ageRequirement: EventTableAgeRequirement,
) {
  return (
    ageRequirement === "age_14_plus" ||
    ageRequirement === "age_15_plus" ||
    ageRequirement === "age_16_plus" ||
    ageRequirement === "age_17_plus"
  );
}

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
    case "age_9_11":
      return "green";
    case "age_11_13":
      return "green";
    case "age_14_plus":
      return "teal";
    case "age_15_plus":
      return "yellow";
    case "age_16_plus":
      return "orange";
    case "age_17_plus":
      return "orange";
    case "age_18_plus":
      return "red";
    case "any":
      return "blue";
  }
}
