import { HStack, VStack } from "@chakra-ui/react";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import HomeEventsContactsPanel from "./home-events-contacts-panel";
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
        <VStack
          align="stretch"
          flex={1}
          gap={2}
          minW={{ sm: "30em", xs: "100%" }}
          w="full"
        >
          <HomeEventsInfoPanel />
          <HomeEventsContactsPanel />
        </VStack>

        <HomeUpcomingEventsSection
          eventsState={eventsState}
          upcomingEvents={upcomingEvents}
        />
      </HStack>
    </VStack>
  );
}
