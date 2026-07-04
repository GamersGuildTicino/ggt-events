import { Flex, VStack } from "@chakra-ui/react";
import { useState } from "react";
import {
  type HomeMessage,
  fetchHomeNoUpcomingEventsMessage,
} from "~/domain/home-messages";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import Eyebrow from "~/ui/eyebrow";
import { type AsyncState, initial, loading } from "~/utils/async-state";
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
  const { locale, t } = useI18n();
  const [homeMessageState, setHomeMessageState] =
    useState<AsyncState<HomeMessage | null>>(initial());

  useAsyncEffect(async (isActive) => {
    setHomeMessageState(loading());
    const homeMessage = await fetchHomeNoUpcomingEventsMessage();
    if (!isActive()) return;
    setHomeMessageState(homeMessage);
  }, []);

  const homeMessage = homeMessageState.isSuccess ? homeMessageState.data : null;
  const homeMessageTitle = homeMessage?.title[locale].trim();
  const homeMessageBody = homeMessage?.body[locale].trim();
  const hasNoUpcomingEvents =
    eventsState.isSuccess && upcomingEvents.length === 0;
  const sectionTitle =
    hasNoUpcomingEvents && homeMessageTitle ? homeMessageTitle : (
      t("page.home.events.heading")
    );

  return (
    <Flex
      bgColor="ggt.surface.bg"
      borderColor="ggt.surface.border"
      borderWidth={1}
      flex={1}
      minW={{ sm: "30em", xs: "100%" }}
      p={6}
      w="full"
    >
      <VStack align="flex-start" gap={4} w="full">
        <Eyebrow>{sectionTitle}</Eyebrow>

        {eventsState.isLoading && <HomeUpcomingEventsLoading />}

        {eventsState.hasError && (
          <HomeUpcomingEventsError error={eventsState.error} />
        )}

        {eventsState.isSuccess && upcomingEvents.length === 0 && (
          <HomeUpcomingEventsEmpty
            customBody={homeMessageBody}
            hasCustomTitle={Boolean(homeMessageTitle)}
          />
        )}

        {eventsState.isSuccess && upcomingEvents.length > 0 && (
          <HomeUpcomingEventsList upcomingEvents={upcomingEvents} />
        )}
      </VStack>
    </Flex>
  );
}
