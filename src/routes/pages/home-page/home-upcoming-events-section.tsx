import { Flex, VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import Eyebrow from "~/ui/eyebrow";
import HomeUpcomingEventsEmpty from "./home-upcoming-events-empty";
import HomeUpcomingEventsError from "./home-upcoming-events-error";
import HomeUpcomingEventsList from "./home-upcoming-events-list";
import HomeUpcomingEventsLoading from "./home-upcoming-events-loading";
import type useHomeEvents from "./use-home-events";

//------------------------------------------------------------------------------
// Home Upcoming Events Section
//------------------------------------------------------------------------------

type HomeUpcomingEventsSectionProps = {
  eventsState: ReturnType<typeof useHomeEvents>["eventsState"];
  upcomingEvents: ReturnType<typeof useHomeEvents>["upcomingEvents"];
};

export default function HomeUpcomingEventsSection({
  eventsState,
  upcomingEvents,
}: HomeUpcomingEventsSectionProps) {
  const { t } = useI18n();

  return (
    <Flex
      bgColor="publicSurfaceBg"
      borderColor="publicSurfaceBorder"
      borderWidth={1}
      flex={1}
      p={6}
    >
      <VStack align="flex-start" gap={4} w="full">
        <Eyebrow>{t("page.home.events.heading")}</Eyebrow>

        {eventsState.isLoading && <HomeUpcomingEventsLoading />}

        {eventsState.hasError && (
          <HomeUpcomingEventsError error={eventsState.error} />
        )}

        {eventsState.isSuccess && upcomingEvents.length === 0 && (
          <HomeUpcomingEventsEmpty />
        )}

        {eventsState.isSuccess && upcomingEvents.length > 0 && (
          <HomeUpcomingEventsList upcomingEvents={upcomingEvents} />
        )}
      </VStack>
    </Flex>
  );
}
