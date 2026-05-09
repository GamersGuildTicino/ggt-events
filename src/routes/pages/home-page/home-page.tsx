import { HStack, VStack } from "@chakra-ui/react";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import HomeEventsInfoPanel from "./home-events-info-panel";
import HomeHero from "./home-hero";
import HomeUpcomingEventsSection from "./home-upcoming-events-section";
import useHomeEvents from "./use-home-events";

//------------------------------------------------------------------------------
// Home Page
//------------------------------------------------------------------------------

export default function HomePage() {
  const { t } = useI18n();
  const { eventsState, upcomingEvents } = useHomeEvents();

  usePageTitle(t("page.home.heading"));

  return (
    <VStack align="center" gap={8} w="full">
      <HomeHero />

      <HStack align="flex-end" justify="center" wrap="wrap-reverse">
        <HomeEventsInfoPanel />

        <HomeUpcomingEventsSection
          eventsState={eventsState}
          upcomingEvents={upcomingEvents}
        />
      </HStack>
    </VStack>
  );
}
