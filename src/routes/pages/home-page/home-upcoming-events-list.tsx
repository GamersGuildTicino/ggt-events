import { Grid } from "@chakra-ui/react";
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
  const timelineColumns = {
    base: "auto 1.5rem minmax(0, 1fr)",
    md: "auto 1.5rem minmax(0, 1fr)",
  };
  const timelineColumnGap = { base: 4, md: 6 };

  return (
    <Grid
      columnGap={timelineColumnGap}
      gridTemplateColumns={timelineColumns}
      position="relative"
      rowGap={6}
    >
      {upcomingEvents.map(({ event, timeSlots }, index) => (
        <HomeEventCard
          event={event}
          isFirst={index === 0}
          isLast={index === upcomingEvents.length - 1}
          key={event.id}
          timeSlots={timeSlots}
        />
      ))}
    </Grid>
  );
}
