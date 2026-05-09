import { Text } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";

//------------------------------------------------------------------------------
// Home Upcoming Events Empty
//------------------------------------------------------------------------------

export default function HomeUpcomingEventsEmpty() {
  const { t } = useI18n();

  return <Text color="fg.muted">{t("page.home.events.empty")}</Text>;
}
