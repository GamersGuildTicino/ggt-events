import { Box, HStack, Link, Text, VStack } from "@chakra-ui/react";
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
  isFirst: boolean;
  isLast: boolean;
  timeSlots: EventTimeSlot[];
};

export default function HomeEventCard({
  event,
  isLast,
  timeSlots,
}: HomeEventCardProps) {
  const { locale, t } = useI18n();
  const eventPath =
    locale === "it-CH" ? `/eventi/${event.slug}` : `/events/${event.slug}`;
  const firstTimeSlot = timeSlots[0];
  if (!firstTimeSlot) return null;

  return (
    <>
      <VStack align="flex-end" gap={0}>
        <HomeDateBadge date={firstTimeSlot.startsAt} locale={locale} />
      </VStack>

      <VStack
        align="center"
        gap={0}
        mb={isLast ? 6 : 0}
        position="relative"
        w="1.5rem"
      >
        <Box
          bgColor={"publicAccentBorder"}
          borderRadius="full"
          h="0.8rem"
          w="0.8rem"
        />
        <Box bgColor="publicSurfaceBorder" flex={1} w="2px" />
        <Box
          bg={
            isLast ?
              "linear-gradient(#e7dcc7ff 0%, #e7dcc7dd 15%, #e7dcc700 100%)"
            : "publicSurfaceBorder"
          }
          bottom={0}
          h={6}
          position="absolute"
          transform="translateY(100%)"
          w="2px"
          zIndex={1}
        />
      </VStack>

      <VStack align="flex-start" mt={-1.5}>
        <Link asChild fontWeight="semibold">
          <RouterLink to={eventPath}>{event.title}</RouterLink>
        </Link>

        <HStack color="fg.muted" gap={2}>
          <Box
            bgColor={event.registrationsOpen ? "green.500" : "gray.400"}
            borderRadius="full"
            h="0.55rem"
            w="0.55rem"
          />
          <Text
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="0.08em"
            textTransform="uppercase"
          >
            {event.registrationsOpen ?
              t("page.home.events.registrations_open")
            : t("page.home.events.registrations_closed")}
          </Text>
        </HStack>

        <VStack align="flex-start" gap={1}>
          <Text color="fg.muted" fontSize="sm">
            {formatHomeTimeSlotRange(timeSlots, locale)}
          </Text>

          <Text color="fg.muted" fontSize="sm">
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
            {event.registrationsOpen ?
              t("page.home.events.open_and_register")
            : t("page.home.events.open")}
          </RouterLink>
        </Link>
      </VStack>
    </>
  );
}
