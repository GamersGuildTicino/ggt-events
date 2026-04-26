import { HStack, Heading, Text, VStack } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
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
    <VStack align="stretch" gap={4} id="upcoming-events">
      <HStack align="flex-end" justify="space-between">
        <VStack align="flex-start" gap={1}>
          <Heading size="2xl">{t("page.home.events.heading")}</Heading>
          <Text color="fg.muted">{t("page.home.events.description")}</Text>
        </VStack>
      </HStack>

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
  );
}
