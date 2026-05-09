import { Badge } from "@chakra-ui/react";
import type { BadgeProps } from "@chakra-ui/react";
import {
  type EventTableAgeRequirement,
  ageRequirementColorPalette,
} from "~/domain/enums/event-table-age-requirement";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Table Age Requirement Badge
//------------------------------------------------------------------------------

type EventTableAgeRequirementBadgeProps = {
  ageRequirement: EventTableAgeRequirement;
  size?: BadgeProps["size"];
};

export default function EventTableAgeRequirementBadge({
  ageRequirement,
  size,
}: EventTableAgeRequirementBadgeProps) {
  const { t } = useI18n();
  if (ageRequirement === "age_14_plus") return null;

  return (
    <Badge
      colorPalette={ageRequirementColorPalette(ageRequirement)}
      size={size}
    >
      {t(`enum.event_table_age_requirement.${ageRequirement}`)}
    </Badge>
  );
}
