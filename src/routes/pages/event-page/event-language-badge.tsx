import { Badge } from "@chakra-ui/react";
import type { EventTableLanguage } from "~/domain/enums/event-table-language";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Event Language Badge
//------------------------------------------------------------------------------

type EventLanguageBadgeProps = {
  language: EventTableLanguage;
};

export default function EventLanguageBadge({
  language,
}: EventLanguageBadgeProps) {
  const { t } = useI18n();
  if (language === "italian" || language === "unspecified") return null;

  return (
    <Badge colorPalette="pink">
      {t(`enum.event_table_language.${language}`)}
    </Badge>
  );
}
