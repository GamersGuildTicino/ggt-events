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
  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
      {upcomingEvents.map(({ event, timeSlots }) => (
        <HomeEventCard event={event} key={event.id} timeSlots={timeSlots} />
      ))}
    </SimpleGrid>
  );
}
