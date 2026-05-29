import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  HStack,
  Heading,
  Span,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import {
  formatRegistrationOpeningDateLong,
  formatRegistrationOpeningDateShort,
  shouldShowRegistrationOpeningDate,
} from "~/domain/event-registration-opening";
import { type EventTimeSlot, isEventOver } from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import RichText from "~/ui/rich-text";
import EventDetailRow from "./event-detail-row";
import { formatDateRange, formatTimeRange } from "./event-page-format";

//------------------------------------------------------------------------------
// Event Hero
//------------------------------------------------------------------------------

type EventHeroProps = {
  event: Event;
  hasMap: boolean;
  timeSlots: EventTimeSlot[];
};

export default function EventHero({
  event,
  hasMap,
  timeSlots,
}: EventHeroProps) {
  const { locale, t, ti } = useI18n();
  const eventOver = isEventOver(timeSlots);
  const showRegistrationOpeningDate = shouldShowRegistrationOpeningDate(
    event,
    timeSlots,
  );

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
        "blue.500",
        ti(
          "page.event.registrations_open_at",
          formatRegistrationOpeningDateShort(event.registrationsOpenAt, locale),
        ),
        showRegistrationOpeningDate ?
          ti(
            "page.event.hero.registration_scheduled",
            formatRegistrationOpeningDateLong(
              event.registrationsOpenAt,
              locale,
            ),
          )
        : t("page.event.hero.registration_closed"),
      ];

  return (
    <Box
      backgroundPosition="center"
      backgroundSize="cover"
      bg={
        event.imageUrl ?
          "rgba(18, 24, 38, 0.72)"
        : "linear-gradient(135deg, #121826 0%, #233a5f 52%, #3d7f89 100%)"
      }
      bgImage={
        event.imageUrl ?
          `linear-gradient(180deg, rgba(18, 24, 38, 0.72) 0%, rgba(18, 24, 38, 0.58) 100%), url("${event.imageUrl}")`
        : undefined
      }
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
          <Badge bg={statusColor} color="white" px={3} rounded="full">
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
            {event.shortDescription && (
              <Text color="whiteAlpha.900" fontSize="lg" maxW="34em">
                {event.shortDescription}
              </Text>
            )}
            <RichText
              color="whiteAlpha.800"
              fontSize="sm"
              lineHeight={1.2}
              maxW="34em"
              patterns={accentPatterns}
              text={statusDescription}
            />
          </VStack>

          <HStack wrap="wrap">
            <Button asChild size="sm" variant="subtle">
              <a href="#tables">{t("page.event.tables.jump_tables")}</a>
            </Button>

            {hasMap && (
              <Button
                _hover={{ color: "fg" }}
                asChild
                color="fg.inverted"
                size="sm"
                variant="outline"
              >
                <a href="#map">{t("page.event.map.jump_to_map")}</a>
              </Button>
            )}
          </HStack>
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

//------------------------------------------------------------------------------
// Accent Patterns
//------------------------------------------------------------------------------

const accentPatterns = [
  {
    regex: /\*(.+?)\*/,
    render: (val: ReactNode) => (
      <Span color="ggt.fg.primary" fontWeight="bold">
        {val}
      </Span>
    ),
  },
];
