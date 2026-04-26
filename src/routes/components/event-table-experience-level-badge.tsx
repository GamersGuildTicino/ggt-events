import { Badge } from "@chakra-ui/react";
import type { BadgeProps } from "@chakra-ui/react";
import {
  type EventTableExperienceLevel,
  experienceLevelColorPalette,
} from "~/domain/enums/event-table-experience-level";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Table Experience Level Badge
//------------------------------------------------------------------------------

type EventTableExperienceLevelBadgeProps = {
  experienceLevel: EventTableExperienceLevel;
  size?: BadgeProps["size"];
};

export default function EventTableExperienceLevelBadge({
  experienceLevel,
  size,
}: EventTableExperienceLevelBadgeProps) {
  const { t } = useI18n();
  if (experienceLevel === "unspecified") return null;

  return (
    <Badge
      colorPalette={experienceLevelColorPalette(experienceLevel)}
      size={size}
    >
      {t(`enum.event_table_experience_level.${experienceLevel}`)}
    </Badge>
  );
}
