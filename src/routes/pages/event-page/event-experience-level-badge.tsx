import { Badge } from "@chakra-ui/react";
import {
  type EventTableExperienceLevel,
  experienceLevelColorPalette,
} from "~/domain/enums/event-table-experience-level";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Experience Level Badge
//------------------------------------------------------------------------------

type EventExperienceLevelBadgeProps = {
  experienceLevel: EventTableExperienceLevel;
};

export default function EventExperienceLevelBadge({
  experienceLevel,
}: EventExperienceLevelBadgeProps) {
  const { t } = useI18n();
  if (experienceLevel === "unspecified") return null;

  return (
    <Badge colorPalette={experienceLevelColorPalette(experienceLevel)}>
      {t(`enum.event_table_experience_level.${experienceLevel}`)}
    </Badge>
  );
}
