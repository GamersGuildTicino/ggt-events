import {
  Badge,
  Box,
  Button,
  HStack,
  Heading,
  Span,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowLeft, CalendarDays, Clock3, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import {
  formatRegistrationOpeningDateLong,
  formatRegistrationOpeningDateShort,
  shouldShowRegistrationOpeningDate,
} from "~/domain/event-registration-opening";
import { type EventTimeSlot, isEventOver } from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";
import RichText from "~/ui/rich-text";
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
  const showRegistrationOpeningDate =
    event.hasTables && shouldShowRegistrationOpeningDate(event, timeSlots);
  const registrationsOpen = event.registrationsOpen && event.tablesPublished;

  const [statusBg, statusColor, statusDot, statusLabel, statusDescription] =
    eventOver ?
      [
        "orange.100",
        "orange.800",
        "orange.500",
        t("page.event.event_over"),
        t("page.event.hero.event_over"),
      ]
    : registrationsOpen ?
      [
        "green.100",
        "green.800",
        "green.500",
        t("page.event.registrations_open"),
        t("page.event.hero.registration_open"),
      ]
    : [
        showRegistrationOpeningDate ? "blue.100" : "gray.100",
        showRegistrationOpeningDate ? "blue.800" : "gray.700",
        showRegistrationOpeningDate ? "blue.500" : "gray.500",
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
      bg={event.imageUrl ? "rgba(18, 24, 38, 0.72)" : "#124a68"}
      bgImage={event.imageUrl ? `url("${event.imageUrl}")` : undefined}
      color="white"
      overflow="hidden"
      position="relative"
      py={{ base: 8, md: 8 }}
    >
      <VStack
        align="stretch"
        gap={8}
        maxW="72em"
        mx="auto"
        position="relative"
        px={{ base: 4, md: 8 }}
        w="full"
      >
        <HStack justify="space-between" w="full">
          <Button
            _hover={{ bg: "transparent" }}
            asChild
            color="white"
            cursor="pointer"
            fontWeight="semibold"
            p={0}
            variant="plain"
          >
            <RouterLink to="/">
              <ArrowLeft color="var(--chakra-colors-ggt-fg-primary)" />
              {t("page.event.back_to_home")}
            </RouterLink>
          </Button>
          <LocaleSelect css={localeSelectCss} />
        </HStack>

        <VStack align="stretch" gap={5}>
          {event.hasTables && (
            <Badge
              alignSelf="flex-start"
              bg={statusBg}
              color={statusColor}
              px={3}
              py={2}
              rounded="full"
            >
              <HStack gap={2}>
                <Box bg={statusDot} borderRadius="full" h="0.6rem" w="0.6rem" />
                <Text>{statusLabel}</Text>
              </HStack>
            </Badge>
          )}

          <VStack align="flex-start" gap={3}>
            <Heading
              fontFamily="'Bricolage Grotesque', sans-serif"
              fontSize={{ base: "4xl", md: "5xl" }}
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
              patterns={accentPatterns}
              text={
                event.hasTables ? statusDescription : (
                  t("page.event.hero.no_tables")
                )
              }
            />
          </VStack>

          <HStack wrap="wrap">
            {event.hasTables && (
              <Button asChild size="sm" variant="subtle">
                <a href="#tables">{t("page.event.tables.jump_tables")}</a>
              </Button>
            )}

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
          <HStack gapX={{ base: 6, md: 10 }} wrap="wrap">
            <HStack align="center" flex="0 1 auto" gap={3} minW={0}>
              <CalendarDays
                aria-hidden="true"
                color="var(--chakra-colors-ggt-fg-primary)"
                size={18}
              />
              <Text>{formatDateRange(timeSlots, locale)}</Text>
            </HStack>
            <HStack align="center" flex="0 1 auto" gap={3} minW={0}>
              <Clock3
                aria-hidden="true"
                color="var(--chakra-colors-ggt-fg-primary)"
                size={18}
              />
              <Text>{formatTimeRange(timeSlots, locale)}</Text>
            </HStack>
            <HStack align="center" flex="0 1 auto" gap={3} minW={0}>
              <MapPin
                aria-hidden="true"
                color="var(--chakra-colors-ggt-fg-primary)"
                size={18}
              />
              <Text overflowWrap="anywhere">
                {event.locationName}
                {event.locationAddress && `, ${event.locationAddress}`}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      </VStack>
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

const localeSelectCss = {
  "& [data-part='indicator']": {
    color: "white",
  },
  "& [data-part='trigger']": {
    borderColor: "white",
  },
};
