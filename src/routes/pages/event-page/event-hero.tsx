import {
  Badge,
  Box,
  Card,
  Grid,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { type EventTimeSlot, isEventOver } from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import EventDetailRow from "./event-detail-row";
import { formatDateRange, formatTimeRange } from "./event-page-format";

//------------------------------------------------------------------------------
// Event Hero
//------------------------------------------------------------------------------

type EventHeroProps = {
  event: Event;
  timeSlots: EventTimeSlot[];
};

export default function EventHero({ event, timeSlots }: EventHeroProps) {
  const { locale, t } = useI18n();
  const eventOver = isEventOver(timeSlots);

  const [statusColor, statusLabel, statusDescription] =
    eventOver ?
      [
        "orange.500",
        t("page.event.event_over"),
        t("page.event.hero.event_over"),
      ]
    : event.registrationsOpen ?
      [
        "green.500",
        t("page.event.registrations_open"),
        t("page.event.hero.registration_open"),
      ]
    : [
        "whiteAlpha.300",
        t("page.event.registrations_closed"),
        t("page.event.hero.registration_closed"),
      ];

  return (
    <Box
      bg="linear-gradient(135deg, #121826 0%, #233a5f 52%, #3d7f89 100%)"
      borderRadius="3xl"
      color="white"
      overflow="hidden"
      position="relative"
      px={{ base: 6, md: 10 }}
      py={{ base: 8, md: 12 }}
    >
      <Box
        bg="cyan.300"
        borderRadius="full"
        filter="blur(24px)"
        h="16rem"
        opacity={0.22}
        position="absolute"
        right="-5rem"
        top="-6rem"
        w="16rem"
      />
      <Box
        borderColor="whiteAlpha.300"
        borderRadius="2xl"
        borderWidth="1px"
        bottom="-5rem"
        h="14rem"
        left="-4rem"
        opacity={0.4}
        position="absolute"
        transform="rotate(-12deg)"
        w="14rem"
      />

      <Grid
        alignItems="stretch"
        gap={6}
        position="relative"
        templateColumns={{ base: "1fr", lg: "1.2fr 0.8fr" }}
      >
        <VStack align="flex-start" gap={5} justify="center">
          <Badge bg={statusColor} color="white" rounded="full">
            {statusLabel}
          </Badge>

          <VStack align="flex-start" gap={3}>
            <Heading
              fontSize={{ base: "4xl", md: "5xl" }}
              letterSpacing="-0.05em"
              lineHeight={1}
            >
              {event.title}
            </Heading>
            <Text color="whiteAlpha.900" fontSize="lg" maxW="34em">
              {statusDescription}
            </Text>
          </VStack>
        </VStack>

        <Card.Root
          bg="whiteAlpha.200"
          borderColor="whiteAlpha.300"
          color="white"
        >
          <Card.Body gap={4}>
            <EventDetailRow
              label={t("page.event.details.date")}
              value={formatDateRange(timeSlots, locale)}
            />
            <EventDetailRow
              label={t("page.event.details.time")}
              value={formatTimeRange(timeSlots, locale)}
            />
            <EventDetailRow
              label={t("page.event.details.location")}
              value={event.locationName}
            />
            {event.locationAddress && (
              <EventDetailRow
                label={t("page.event.details.address")}
                value={event.locationAddress}
              />
            )}
          </Card.Body>
        </Card.Root>
      </Grid>
    </Box>
  );
}
