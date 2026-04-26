import { VStack } from "@chakra-ui/react";
import HomeHero from "./home-hero";
import HomeIntro from "./home-intro";
import HomeUpcomingEventsSection from "./home-upcoming-events-section";
import useHomeEvents from "./use-home-events";

//------------------------------------------------------------------------------
// Home Page
//------------------------------------------------------------------------------

export default function HomePage() {
  const { eventsState, upcomingEvents } = useHomeEvents();

  return (
    <VStack align="stretch" gap={10} w="full">
      <HomeHero />
      <HomeIntro />
      <HomeUpcomingEventsSection
        eventsState={eventsState}
        upcomingEvents={upcomingEvents}
      />
    </VStack>
  );
}
