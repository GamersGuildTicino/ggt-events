import { Box, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import {
  formatRegistrationOpeningDateShort,
  shouldShowRegistrationOpeningDate,
} from "~/domain/event-registration-opening";
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
  const { locale, t, ti } = useI18n();

  const eventPath = ti("page.home.event.url", event.slug);

  const firstTimeSlot = timeSlots[0];
  if (!firstTimeSlot) return null;

  const registrationsOpen = event.registrationsOpen && event.tablesPublished;
  const showOpeningDate = shouldShowRegistrationOpeningDate(event, timeSlots);

  const statusLabel =
    registrationsOpen ? t("page.home.events.registrations_open")
    : showOpeningDate ?
      ti(
        "page.home.events.registrations_open_at",
        formatRegistrationOpeningDateShort(event.registrationsOpenAt, locale),
      )
    : t("page.home.events.registrations_closed");

  const statusDotColor =
    registrationsOpen ? "green.500"
    : showOpeningDate ? "blue.500"
    : "gray.400";

  return (
    <HStack
      align="flex-start"
      bg="white"
      borderColor="ggt.surface.border"
      borderRadius="0.35rem"
      borderWidth="1px"
      boxShadow="0 0.5rem 1.25rem rgba(14, 66, 99, 0.12)"
      gap={{ base: 4, md: 5 }}
      h="full"
      p={{ base: 4, md: 5 }}
    >
      <Box flexShrink={0}>
        <HomeDateBadge date={firstTimeSlot.startsAt} locale={locale} />
      </Box>

      <VStack align="flex-start" flex={1} gap={3} minW={0}>
        <Link asChild fontSize="lg" fontWeight="semibold" lineHeight={1.15}>
          <RouterLink to={eventPath}>{event.title}</RouterLink>
        </Link>

        <HStack color="fg.muted" gap={2}>
          <Box
            bgColor={statusDotColor}
            borderRadius="full"
            flexShrink={0}
            h="0.55rem"
            w="0.55rem"
          />
          <Text
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="0.08em"
            textTransform="uppercase"
          >
            {statusLabel}
          </Text>
        </HStack>

        <VStack align="flex-start" gap={1} w="full">
          <Text fontSize="sm">
            {formatHomeTimeSlotRange(timeSlots, locale)}
          </Text>

          <Text fontSize="sm">
            {[event.locationName, event.locationAddress]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </VStack>

        <Link
          asChild
          color="fg.muted"
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="0.1em"
          textTransform="uppercase"
        >
          <RouterLink to={eventPath}>
            {registrationsOpen ?
              t("page.home.events.open_and_register")
            : t("page.home.events.open")}
          </RouterLink>
        </Link>
      </VStack>
    </HStack>
  );
}
