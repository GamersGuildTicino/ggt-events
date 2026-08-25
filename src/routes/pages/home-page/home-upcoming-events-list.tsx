import { SimpleGrid } from "@chakra-ui/react";
import HomeEventCard from "./home-event-card";
import type { UpcomingHomeEvent } from "./use-home-events";

//------------------------------------------------------------------------------
// Home Upcoming Events List
//------------------------------------------------------------------------------

type HomeUpcomingEventsListProps = {
  upcomingEvents: UpcomingHomeEvent[];
};

export default function HomeUpcomingEventsList({
  upcomingEvents,
}: HomeUpcomingEventsListProps) {
  const hasSingleEvent = upcomingEvents.length === 1;

  return (
    <SimpleGrid
      columns={{ base: 1, lg: hasSingleEvent ? 1 : 2 }}
      gap={4}
      maxW={hasSingleEvent ? "36rem" : undefined}
      mx={hasSingleEvent ? "auto" : undefined}
      w="full"
    >
      {upcomingEvents.map(({ event, timeSlots }) => (
        <HomeEventCard event={event} key={event.id} timeSlots={timeSlots} />
      ))}
    </SimpleGrid>
  );
}
