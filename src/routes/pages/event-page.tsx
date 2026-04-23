import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Field,
  Grid,
  HStack,
  Heading,
  Input,
  Separator,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  type EventTableExperienceLevel,
  experienceLevelColorPalette,
} from "~/domain/enums/event-table-experience-level";
import type { EventTableLanguage } from "~/domain/enums/event-table-language";
import { registerForEventTable } from "~/domain/event-registrations";
import { type EventTable, fetchEventTables } from "~/domain/event-tables";
import {
  type EventTimeSlot,
  fetchEventTimeSlots,
} from "~/domain/event-time-slots";
import { type Event, fetchPublicEvent } from "~/domain/events";
import { type GameSystem, fetchGameSystems } from "~/domain/game-systems";
import { formatPlayerCount } from "~/domain/players";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import AdminContentColumns from "../components/admin-content-columns";

//------------------------------------------------------------------------------
// Event Page
//------------------------------------------------------------------------------

export default function EventPage() {
  const { eventId } = useParams();
  const { t } = useI18n();
  const [eventState, setEventState] = useState<AsyncState<Event>>(initial());
  const [eventTablesState, setEventTablesState] =
    useState<AsyncState<EventTable[]>>(initial());
  const [eventTimeSlotsState, setEventTimeSlotsState] =
    useState<AsyncState<EventTimeSlot[]>>(initial());
  const [gameSystemsState, setGameSystemsState] =
    useState<AsyncState<GameSystem[]>>(initial());

  const gameSystemById = useMemo(() => {
    if (!gameSystemsState.isSuccess) return new Map<string, GameSystem>();
    return new Map(
      gameSystemsState.data.map((gameSystem) => [gameSystem.id, gameSystem]),
    );
  }, [gameSystemsState]);

  useAsyncEffect(
    async (isActive) => {
      setEventState(loading());

      if (!eventId) return setEventState(failure("page.event.error.missing"));

      const event = await fetchPublicEvent(eventId);
      if (!isActive()) return;
      setEventState(event);
    },
    [eventId],
  );

  useAsyncEffect(
    async (isActive) => {
      if (!eventId) return;

      setEventTimeSlotsState(loading());
      const eventTimeSlots = await fetchEventTimeSlots(eventId);
      if (!isActive()) return;
      setEventTimeSlotsState(eventTimeSlots);
    },
    [eventId],
  );

  useAsyncEffect(
    async (isActive) => {
      if (!eventId) return;

      setEventTablesState(loading());
      const eventTables = await fetchEventTables(eventId);
      if (!isActive()) return;
      setEventTablesState(eventTables);
    },
    [eventId],
  );

  useAsyncEffect(async (isActive) => {
    setGameSystemsState(loading());
    const gameSystems = await fetchGameSystems();
    if (!isActive()) return;
    setGameSystemsState(gameSystems);
  }, []);

  return (
    <VStack align="stretch" gap={6} w="full">
      <HStack justify="space-between" w="full">
        <Button asChild size="sm" variant="ghost">
          <RouterLink to="/">
            <ChevronLeft />
            {t("page.event.back_to_home")}
          </RouterLink>
        </Button>
        <LocaleSelect />
      </HStack>

      {eventState.isLoading && <Spinner />}

      {eventState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(eventState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {eventState.isSuccess && (
        <>
          <EventHero
            event={eventState.data}
            timeSlots={
              eventTimeSlotsState.isSuccess ? eventTimeSlotsState.data : []
            }
          />

          <TablesSection
            event={eventState.data}
            eventTablesState={eventTablesState}
            eventTimeSlotsState={eventTimeSlotsState}
            gameSystemById={gameSystemById}
            gameSystemsState={gameSystemsState}
          />
        </>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Event Hero
//------------------------------------------------------------------------------

function EventHero({
  event,
  timeSlots,
}: {
  event: Event;
  timeSlots: EventTimeSlot[];
}) {
  const { locale, t } = useI18n();

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
          <Badge
            bg={event.registrationsOpen ? "green.500" : "whiteAlpha.300"}
            color="white"
            rounded="full"
          >
            {event.registrationsOpen ?
              t("page.event.registrations_open")
            : t("page.event.registrations_closed")}
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
              {event.registrationsOpen ?
                t("page.event.hero.registration_open")
              : t("page.event.hero.registration_closed")}
            </Text>
          </VStack>
        </VStack>

        <Card.Root
          bg="whiteAlpha.200"
          borderColor="whiteAlpha.300"
          color="white"
        >
          <Card.Body gap={4}>
            <DetailRow
              label={t("page.event.details.date")}
              value={formatDateRange(timeSlots, locale)}
            />
            <DetailRow
              label={t("page.event.details.time")}
              value={formatTimeRange(timeSlots, locale)}
            />
            <DetailRow
              label={t("page.event.details.location")}
              value={event.locationName}
            />
            {event.locationAddress && (
              <DetailRow
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
// Detail Row
//------------------------------------------------------------------------------

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <VStack align="flex-start" gap={1}>
      <Text color="cyan.100" fontSize="xs" fontWeight="bold">
        {label}
      </Text>
      <Text fontSize="md" fontWeight="semibold">
        {value}
      </Text>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Tables Section
//------------------------------------------------------------------------------

function TablesSection({
  event,
  eventTablesState,
  eventTimeSlotsState,
  gameSystemById,
  gameSystemsState,
}: {
  event: Event;
  eventTablesState: AsyncState<EventTable[]>;
  eventTimeSlotsState: AsyncState<EventTimeSlot[]>;
  gameSystemById: Map<string, GameSystem>;
  gameSystemsState: AsyncState<GameSystem[]>;
}) {
  const { locale, t } = useI18n();
  const tablesBySlotId = useMemo(() => {
    if (!eventTablesState.isSuccess) return new Map<string, EventTable[]>();

    const result = new Map<string, EventTable[]>();
    for (const eventTable of eventTablesState.data) {
      const tables = result.get(eventTable.timeSlotId) ?? [];
      tables.push(eventTable);
      result.set(eventTable.timeSlotId, tables);
    }
    return result;
  }, [eventTablesState]);
  const showSlotDate =
    eventTimeSlotsState.isSuccess &&
    spansMultipleDays(eventTimeSlotsState.data);

  return (
    <VStack align="stretch" gap={4}>
      <Heading size="2xl">{t("page.event.tables.heading")}</Heading>

      {eventTablesState.isLoading && <Spinner />}
      {eventTimeSlotsState.isLoading && <Spinner />}

      {eventTablesState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(eventTablesState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {gameSystemsState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(gameSystemsState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {eventTimeSlotsState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(eventTimeSlotsState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {eventTablesState.isSuccess && eventTablesState.data.length === 0 && (
        <Card.Root borderStyle="dashed">
          <Card.Body>
            <Text color="fg.muted">{t("page.event.tables.empty")}</Text>
          </Card.Body>
        </Card.Root>
      )}

      {eventTablesState.isSuccess &&
        eventTablesState.data.length > 0 &&
        eventTimeSlotsState.isSuccess && (
          <VStack align="stretch" gap={6}>
            {eventTimeSlotsState.data.map((timeSlot) => {
              const tables = tablesBySlotId.get(timeSlot.id) ?? [];
              if (tables.length === 0) return null;

              return (
                <VStack align="stretch" gap={3} key={timeSlot.id}>
                  {eventTimeSlotsState.data.length > 1 && (
                    <Heading size="md">
                      {formatSlot(timeSlot, locale, showSlotDate)}
                    </Heading>
                  )}

                  <AdminContentColumns minColumnWidth="22rem">
                    {tables.map((eventTable) => (
                      <EventTableCard
                        eventTable={eventTable}
                        gameSystemName={
                          gameSystemById.get(eventTable.gameSystemId)?.name ??
                          ""
                        }
                        key={eventTable.id}
                        registrationsOpen={event.registrationsOpen}
                      />
                    ))}
                  </AdminContentColumns>
                </VStack>
              );
            })}
          </VStack>
        )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Event Table Card
//------------------------------------------------------------------------------

function EventTableCard({
  eventTable,
  gameSystemName,
  registrationsOpen,
}: {
  eventTable: EventTable;
  gameSystemName: string;
  registrationsOpen: boolean;
}) {
  const { t, ti } = useI18n();
  const [registrationVisible, setRegistrationVisible] = useState(false);

  return (
    <Card.Root
      _hover={{ borderColor: "blue.400", transform: "translateY(-2px)" }}
      transition="border-color 160ms ease, transform 160ms ease"
    >
      <Card.Body gap={4}>
        <VStack align="flex-start" gap={2}>
          <HStack align="flex-start" justify="space-between" w="full">
            <VStack align="flex-start" gap={1}>
              <Heading size="lg">{eventTable.title}</Heading>
              <Text color="fg.muted" fontSize="sm">
                {ti("page.event.tables.game_master", eventTable.gameMasterName)}
              </Text>
            </VStack>

            <VStack align="flex-end" gap={1}>
              <Badge colorPalette="gray">{gameSystemName}</Badge>
              <HStack gap={1}>
                <ExperienceLevelBadge
                  experienceLevel={eventTable.experienceLevel}
                />
                <LanguageBadge language={eventTable.language} />
              </HStack>
            </VStack>
          </HStack>

          {eventTable.description && (
            <Text fontSize="sm" whiteSpace="pre-line">
              {eventTable.description}
            </Text>
          )}

          {eventTable.notes && (
            <VStack align="flex-start" gap={1}>
              <Text fontSize="xs" fontWeight="bold">
                {t("page.event.tables.notes")}
              </Text>
              <Text color="fg.muted" fontSize="sm" whiteSpace="pre-line">
                {eventTable.notes}
              </Text>
            </VStack>
          )}
        </VStack>

        <Separator />

        <HStack justify="space-between">
          <VStack align="flex-start" gap={0}>
            <Text color="fg.muted" fontSize="xs" fontWeight="bold">
              {t("page.event.tables.seats")}
            </Text>
            <Text fontWeight="semibold">
              {formatPlayerCount({ ...eventTable, t, ti })}
            </Text>
          </VStack>

          <Button
            disabled={!registrationsOpen}
            onClick={() => setRegistrationVisible(true)}
            size="sm"
          >
            {registrationsOpen ?
              t("page.event.tables.choose")
            : t("page.event.tables.closed")}
          </Button>
        </HStack>

        <RegistrationSection
          eventTableId={eventTable.id}
          onCancel={() => setRegistrationVisible(false)}
          onSuccess={() => setRegistrationVisible(false)}
          registrationsOpen={registrationsOpen}
          visible={registrationVisible}
        />
      </Card.Body>
    </Card.Root>
  );
}

//------------------------------------------------------------------------------
// Registration Section
//------------------------------------------------------------------------------

function RegistrationSection({
  eventTableId,
  onCancel,
  onSuccess,
  registrationsOpen,
  visible,
}: {
  eventTableId: EventTable["id"];
  onCancel: () => void;
  onSuccess: () => void;
  registrationsOpen: boolean;
  visible: boolean;
}) {
  const { t } = useI18n();
  const [registrationState, setRegistrationState] =
    useState<AsyncState>(initial());

  if (!registrationsOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const formData = new FormData(form);
    const playerName = String(formData.get("player-name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    setRegistrationState(loading());

    const error = await registerForEventTable({
      email,
      eventTableId,
      playerName,
    });

    if (error) return setRegistrationState(failure(error));

    form.reset();
    setRegistrationState(success(undefined));
    onSuccess();
  };

  return (
    <VStack align="stretch" gap={3}>
      {registrationState.isSuccess && (
        <Alert.Root status="success">
          <Alert.Description>
            {t("page.event.registration.success")}
          </Alert.Description>
        </Alert.Root>
      )}

      {visible && (
        <form onSubmit={handleSubmit}>
          <VStack align="stretch" gap={3}>
            <Field.Root required>
              <Field.Label>
                {t("page.event.registration.name")}
                <Field.RequiredIndicator />
              </Field.Label>
              <Input name="player-name" pattern="\s*\S.*" size="sm" />
            </Field.Root>

            <Field.Root required>
              <Field.Label>
                {t("page.event.registration.email")}
                <Field.RequiredIndicator />
              </Field.Label>
              <Input name="email" size="sm" type="email" />
            </Field.Root>

            {registrationState.hasError && (
              <Alert.Root status="error">
                <Alert.Description>
                  {t(registrationState.error)}
                </Alert.Description>
              </Alert.Root>
            )}

            <HStack>
              <Button
                loading={registrationState.isLoading}
                size="sm"
                type="submit"
              >
                {t("page.event.registration.submit")}
              </Button>
              <Button
                onClick={onCancel}
                size="sm"
                type="button"
                variant="outline"
              >
                {t("page.event.registration.cancel")}
              </Button>
            </HStack>
          </VStack>
        </form>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Experience Level Badge
//------------------------------------------------------------------------------

function ExperienceLevelBadge({
  experienceLevel,
}: {
  experienceLevel: EventTableExperienceLevel;
}) {
  const { t } = useI18n();
  if (experienceLevel === "unspecified") return null;

  return (
    <Badge colorPalette={experienceLevelColorPalette(experienceLevel)}>
      {t(`enum.event_table_experience_level.${experienceLevel}`)}
    </Badge>
  );
}

//------------------------------------------------------------------------------
// Language Badge
//------------------------------------------------------------------------------

function LanguageBadge({ language }: { language: EventTableLanguage }) {
  const { t } = useI18n();
  if (language === "italian" || language === "unspecified") return null;

  return (
    <Badge colorPalette="pink">
      {t(`enum.event_table_language.${language}`)}
    </Badge>
  );
}

//------------------------------------------------------------------------------
// Format Date Range
//------------------------------------------------------------------------------

function formatDateRange(timeSlots: EventTimeSlot[], locale: string) {
  const firstTimeSlot = timeSlots[0];
  const lastTimeSlot = timeSlots.at(-1);
  if (!firstTimeSlot || !lastTimeSlot) return "";

  const format = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const startDate = capitalize(format.format(firstTimeSlot.startsAt));
  const endDate = capitalize(format.format(lastTimeSlot.endsAt));

  if (startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
}

//------------------------------------------------------------------------------
// Format Time Range
//------------------------------------------------------------------------------

function formatTimeRange(timeSlots: EventTimeSlot[], locale: string) {
  const firstTimeSlot = timeSlots[0];
  const lastTimeSlot = timeSlots.at(-1);
  if (!firstTimeSlot || !lastTimeSlot) return "";

  return `${formatTime(firstTimeSlot.startsAt, locale)} - ${formatTime(lastTimeSlot.endsAt, locale)}`;
}

//------------------------------------------------------------------------------
// Format Time
//------------------------------------------------------------------------------

function formatTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(date);
}

//------------------------------------------------------------------------------
// Format Slot
//------------------------------------------------------------------------------

function formatSlot(
  timeSlot: EventTimeSlot,
  locale: string,
  showDate: boolean,
) {
  const time = `${formatTime(timeSlot.startsAt, locale)}-${formatTime(timeSlot.endsAt, locale)}`;
  if (!showDate) return time;

  const date = capitalize(
    new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(
      timeSlot.startsAt,
    ),
  );

  return `${date}, ${time}`;
}

//------------------------------------------------------------------------------
// Spans Multiple Days
//------------------------------------------------------------------------------

function spansMultipleDays(timeSlots: EventTimeSlot[]) {
  const firstDate = timeSlots[0]?.startsAt.toDateString();
  if (!firstDate) return false;
  return timeSlots.some(
    (timeSlot) => timeSlot.startsAt.toDateString() !== firstDate,
  );
}

//------------------------------------------------------------------------------
// Capitalize
//------------------------------------------------------------------------------

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}
