import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  HStack,
  Heading,
  Link,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import {
  type EventTimeSlot,
  fetchEventTimeSlots,
} from "~/domain/event-time-slots";
import { type Event, fetchPublicEvents } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, loading } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Home Page
//------------------------------------------------------------------------------

export default function HomePage() {
  const [eventsState, setEventsState] =
    useState<AsyncState<Event[]>>(initial());
  const [timeSlotsByEventId, setTimeSlotsByEventId] = useState<
    Record<Event["id"], EventTimeSlot[]>
  >({});

  useAsyncEffect(async (isActive) => {
    setEventsState(loading());
    const events = await fetchPublicEvents();
    if (!isActive()) return;
    setEventsState(events);
    if (events.isSuccess) {
      const entries = await Promise.all(
        events.data.map(async (event) => {
          const timeSlots = await fetchEventTimeSlots(event.id);
          return [event.id, timeSlots.isSuccess ? timeSlots.data : []] as const;
        }),
      );
      if (!isActive()) return;
      setTimeSlotsByEventId(Object.fromEntries(entries));
    }
  }, []);

  return (
    <VStack align="stretch" gap={10} w="full">
      <Hero />
      <Intro />
      <UpcomingEvents
        eventsState={eventsState}
        timeSlotsByEventId={timeSlotsByEventId}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Hero
//------------------------------------------------------------------------------

function Hero() {
  const { t } = useI18n();

  return (
    <Box
      bg="linear-gradient(135deg, #332113 0%, #6f2d1e 48%, #d08632 100%)"
      borderRadius="3xl"
      color="white"
      overflow="hidden"
      position="relative"
      px={{ base: 6, md: 10 }}
      py={{ base: 10, md: 16 }}
    >
      <Box
        bg="whiteAlpha.200"
        borderRadius="full"
        filter="blur(8px)"
        h="14rem"
        position="absolute"
        right="-4rem"
        top="-5rem"
        w="14rem"
      />
      <Box
        bg="blackAlpha.200"
        borderRadius="full"
        bottom="-6rem"
        h="18rem"
        left="35%"
        position="absolute"
        w="18rem"
      />

      <Grid
        alignItems="center"
        gap={8}
        position="relative"
        templateColumns={{ base: "1fr", lg: "1.25fr 0.75fr" }}
      >
        <VStack align="flex-start" gap={6}>
          <Badge
            bg="whiteAlpha.300"
            borderColor="whiteAlpha.400"
            borderWidth="1px"
            color="white"
            px={3}
            py={1}
            rounded="full"
          >
            {t("page.home.hero.eyebrow")}
          </Badge>

          <VStack align="flex-start" gap={3}>
            <Heading
              fontSize={{ base: "4xl", md: "6xl" }}
              letterSpacing="-0.06em"
              lineHeight="0.95"
              maxW="9em"
            >
              {t("page.home.heading")}
            </Heading>
            <Text
              color="whiteAlpha.900"
              fontSize={{ base: "lg", md: "xl" }}
              maxW="34em"
            >
              {t("page.home.hero.description")}
            </Text>
          </VStack>

          <HStack flexWrap="wrap" gap={3}>
            <Button asChild bg="white" color="orange.900" size="lg">
              <a href="#upcoming-events">{t("page.home.hero.events")}</a>
            </Button>
            <Button
              asChild
              borderColor="whiteAlpha.500"
              color="white"
              size="lg"
              variant="outline"
            >
              <a href="#about">{t("page.home.hero.about")}</a>
            </Button>
          </HStack>
        </VStack>

        <Card.Root
          bg="blackAlpha.300"
          borderColor="whiteAlpha.300"
          color="white"
          transform={{ base: "none", lg: "rotate(2deg)" }}
        >
          <Card.Body gap={5}>
            <Text color="orange.100" fontSize="sm" fontWeight="semibold">
              {t("page.home.hero.card.label")}
            </Text>
            <Heading size="2xl">{t("page.home.hero.card.heading")}</Heading>
            <Text color="whiteAlpha.800">
              {t("page.home.hero.card.description")}
            </Text>
          </Card.Body>
        </Card.Root>
      </Grid>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Intro
//------------------------------------------------------------------------------

function Intro() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={5} id="about">
      <VStack align="flex-start" gap={2}>
        <Heading size="2xl">{t("page.home.about.heading")}</Heading>
        <Text color="fg.muted" fontSize="lg" maxW="44em">
          {t("page.home.about.description")}
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <InfoCard
          description={t("page.home.about.card_1.description")}
          title={t("page.home.about.card_1.title")}
        />
        <InfoCard
          description={t("page.home.about.card_2.description")}
          title={t("page.home.about.card_2.title")}
        />
        <InfoCard
          description={t("page.home.about.card_3.description")}
          title={t("page.home.about.card_3.title")}
        />
      </SimpleGrid>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Info Card
//------------------------------------------------------------------------------

function InfoCard({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Card.Root bg="bg.subtle">
      <Card.Body gap={2}>
        <Heading size="md">{title}</Heading>
        <Text color="fg.muted" fontSize="sm">
          {description}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}

//------------------------------------------------------------------------------
// Upcoming Events
//------------------------------------------------------------------------------

function UpcomingEvents({
  eventsState,
  timeSlotsByEventId,
}: {
  eventsState: AsyncState<Event[]>;
  timeSlotsByEventId: Record<Event["id"], EventTimeSlot[]>;
}) {
  const { t } = useI18n();
  const upcomingEvents = useMemo(() => {
    if (!eventsState.isSuccess) return [];

    return eventsState.data
      .map((event) => ({
        event,
        timeSlots: timeSlotsByEventId[event.id] ?? [],
      }))
      .filter(({ timeSlots }) =>
        timeSlots.some((slot) => slot.endsAt >= new Date()),
      )
      .sort((a, b) => {
        const aStart = a.timeSlots[0]?.startsAt.getTime() ?? 0;
        const bStart = b.timeSlots[0]?.startsAt.getTime() ?? 0;
        return aStart - bStart;
      });
  }, [eventsState, timeSlotsByEventId]);

  return (
    <VStack align="stretch" gap={4} id="upcoming-events">
      <HStack align="flex-end" justify="space-between">
        <VStack align="flex-start" gap={1}>
          <Heading size="2xl">{t("page.home.events.heading")}</Heading>
          <Text color="fg.muted">{t("page.home.events.description")}</Text>
        </VStack>
      </HStack>

      {eventsState.isLoading && <Spinner />}

      {eventsState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(eventsState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {eventsState.isSuccess && upcomingEvents.length === 0 && (
        <Card.Root borderStyle="dashed">
          <Card.Body>
            <Text color="fg.muted">{t("page.home.events.empty")}</Text>
          </Card.Body>
        </Card.Root>
      )}

      {eventsState.isSuccess && upcomingEvents.length > 0 && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
          {upcomingEvents.map(({ event, timeSlots }) => (
            <EventCard event={event} key={event.id} timeSlots={timeSlots} />
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Event Card
//------------------------------------------------------------------------------

function EventCard({
  event,
  timeSlots,
}: {
  event: Event;
  timeSlots: EventTimeSlot[];
}) {
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
          <DateBadge date={firstTimeSlot.startsAt} locale={locale} />

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
                {formatTimeSlotRange(timeSlots, locale)}
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

//------------------------------------------------------------------------------
// Date Badge
//------------------------------------------------------------------------------

function DateBadge({ date, locale }: { date: Date; locale: string }) {
  const month = new Intl.DateTimeFormat(locale, { month: "short" }).format(
    date,
  );
  const day = new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date);

  return (
    <VStack
      bg="orange.50"
      borderColor="orange.200"
      borderRadius="xl"
      borderWidth="1px"
      color="orange.950"
      flexShrink={0}
      gap={0}
      minW="4.5rem"
      px={3}
      py={2}
    >
      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
        {month}
      </Text>
      <Text fontSize="2xl" fontWeight="bold" lineHeight={1}>
        {day}
      </Text>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Format Time Slot Range
//------------------------------------------------------------------------------

function formatTimeSlotRange(timeSlots: EventTimeSlot[], locale: string) {
  const firstTimeSlot = timeSlots[0];
  const lastTimeSlot = timeSlots.at(-1);
  if (!firstTimeSlot || !lastTimeSlot) return "";

  const date = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
  }).format(firstTimeSlot.startsAt);

  if (
    firstTimeSlot.startsAt.toDateString() !== lastTimeSlot.endsAt.toDateString()
  ) {
    const endDate = new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
    }).format(lastTimeSlot.endsAt);
    return `${capitalize(date)} - ${endDate}`;
  }

  const endTime = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(lastTimeSlot.endsAt);

  return `${capitalize(date)} - ${endTime}`;
}

//------------------------------------------------------------------------------
// Capitalize
//------------------------------------------------------------------------------

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}
