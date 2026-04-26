import {
  Badge,
  Button,
  Card,
  HStack,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import HomeDateBadge from "./home-date-badge";
import { formatHomeTimeSlotRange } from "./home-page-format";

//------------------------------------------------------------------------------
// Home Event Card
//------------------------------------------------------------------------------

type HomeEventCardProps = {
  event: Event;
  timeSlots: EventTimeSlot[];
};

export default function HomeEventCard({
  event,
  timeSlots,
}: HomeEventCardProps) {
  const { locale, t } = useI18n();
  const firstTimeSlot = timeSlots[0];
  if (!firstTimeSlot) return null;

  return (
    <Card.Root
      _hover={{ borderColor: "orange.400", transform: "translateY(-2px)" }}
      transition="border-color 160ms ease, transform 160ms ease"
    >
      <Card.Body gap={4}>
        <HStack align="flex-start" gap={4}>
          <HomeDateBadge date={firstTimeSlot.startsAt} locale={locale} />

          <VStack align="flex-start" flex={1} gap={1}>
            <HStack align="flex-start" justify="space-between" w="full">
              <Link asChild fontWeight="semibold">
                <RouterLink to={`/events/${event.id}`}>
                  {event.title}
                </RouterLink>
              </Link>
              <Badge colorPalette={event.registrationsOpen ? "green" : "gray"}>
                {event.registrationsOpen ?
                  t("page.home.events.registrations_open")
                : t("page.home.events.registrations_closed")}
              </Badge>
            </HStack>

            <VStack align="flex-start" gap={0}>
              <Text color="fg.muted" fontSize="sm">
                {formatHomeTimeSlotRange(timeSlots, locale)}
              </Text>
              <Text fontSize="sm">
                {[event.locationName, event.locationAddress]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </VStack>

            <HStack justify="flex-end" pt={1} w="full">
              <Button asChild size="sm" variant="outline">
                <RouterLink to={`/events/${event.id}`}>
                  {t("page.home.events.open")}
                </RouterLink>
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
