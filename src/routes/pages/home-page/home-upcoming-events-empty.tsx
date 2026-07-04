import { Text } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Upcoming Events Empty
//------------------------------------------------------------------------------

type HomeUpcomingEventsEmptyProps = {
  customBody?: string;
  hasCustomTitle: boolean;
};

export default function HomeUpcomingEventsEmpty({
  customBody,
  hasCustomTitle,
}: HomeUpcomingEventsEmptyProps) {
  const { t } = useI18n();

  if (!customBody && !hasCustomTitle)
    return <Text>{t("page.home.events.empty")}</Text>;

  if (!customBody) return null;

  return <Text whiteSpace="pre-line">{customBody}</Text>;
}
