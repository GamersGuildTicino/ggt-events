import { Badge } from "@chakra-ui/react";
import type { BadgeProps } from "@chakra-ui/react";
import type { EventTableLanguage } from "~/domain/enums/event-table-language";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Table Language Badge
//------------------------------------------------------------------------------

type EventTableLanguageBadgeProps = {
  language: EventTableLanguage;
  size?: BadgeProps["size"];
};

export default function EventTableLanguageBadge({
  language,
  size,
}: EventTableLanguageBadgeProps) {
  const { t } = useI18n();
  if (language === "italian" || language === "unspecified") return null;

  return (
    <Badge colorPalette="pink" size={size}>
      {t(`enum.event_table_language.${language}`)}
    </Badge>
  );
}
