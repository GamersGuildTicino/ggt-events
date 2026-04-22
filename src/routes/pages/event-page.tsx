import {
  Alert,
  Badge,
  Button,
  Card,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import { type EventTable, fetchEventTables } from "~/domain/event-tables";
import { type Event, fetchPublicEvent } from "~/domain/events";
import { type GameSystem, fetchGameSystems } from "~/domain/game-systems";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import {
  type AsyncState,
  failure,
  initial,
  loading,
} from "~/utils/async-state";
import AdminContentColumns from "../components/admin-content-columns";

//------------------------------------------------------------------------------
// Event Page
//------------------------------------------------------------------------------

export default function EventPage() {
  const { eventId } = useParams();
  const { locale, t } = useI18n();
  const [eventState, setEventState] = useState<AsyncState<Event>>(initial());
  const [eventTablesState, setEventTablesState] =
    useState<AsyncState<EventTable[]>>(initial());
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
      <Button alignSelf="flex-start" asChild size="sm" variant="outline">
        <RouterLink to="/">{t("page.event.back_to_home")}</RouterLink>
      </Button>

      {eventState.isLoading && <Spinner />}

      {eventState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(eventState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {eventState.isSuccess && (
        <>
          <VStack align="flex-start" gap={3}>
            <Heading size="3xl">{eventState.data.title}</Heading>

            <Badge
              colorPalette={
                eventState.data.registrationsOpen ? "green" : "gray"
              }
            >
              {eventState.data.registrationsOpen ?
                t("page.event.registrations_open")
              : t("page.event.registrations_closed")}
            </Badge>

            <Text color="fg.muted">
              {formatDateTime(eventState.data.startsAt, locale)}
            </Text>

            <Text>
              {[eventState.data.locationName, eventState.data.locationAddress]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </VStack>

          <VStack align="stretch" gap={3}>
            <Heading size="xl">{t("page.event.tables.heading")}</Heading>

            {eventTablesState.isLoading && <Spinner />}

            {eventTablesState.hasError && (
              <Alert.Root status="error">
                <Alert.Description>
                  {t(eventTablesState.error)}
                </Alert.Description>
              </Alert.Root>
            )}

            {gameSystemsState.hasError && (
              <Alert.Root status="error">
                <Alert.Description>
                  {t(gameSystemsState.error)}
                </Alert.Description>
              </Alert.Root>
            )}

            {eventTablesState.isSuccess &&
              eventTablesState.data.length === 0 && (
                <Text color="fg.muted">{t("page.event.tables.empty")}</Text>
              )}

            {eventTablesState.isSuccess && eventTablesState.data.length > 0 && (
              <AdminContentColumns>
                {eventTablesState.data.map((eventTable) => (
                  <EventTableCard
                    eventTable={eventTable}
                    gameSystemName={
                      gameSystemById.get(eventTable.gameSystemId)?.name ?? ""
                    }
                    key={eventTable.id}
                  />
                ))}
              </AdminContentColumns>
            )}
          </VStack>
        </>
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
}: {
  eventTable: EventTable;
  gameSystemName: string;
}) {
  const { ti } = useI18n();

  return (
    <Card.Root>
      <Card.Body gap={2}>
        <Heading size="md">{eventTable.title}</Heading>
        <Text color="fg.muted" fontSize="sm">
          {gameSystemName}
        </Text>
        <Text fontSize="sm">{eventTable.gameMasterName}</Text>
        <Text fontSize="sm">
          {ti(
            "page.event.tables.players",
            String(eventTable.minPlayers),
            String(eventTable.maxPlayers),
          )}
        </Text>
      </Card.Body>
    </Card.Root>
  );
}

//------------------------------------------------------------------------------
// Format Date Time
//------------------------------------------------------------------------------

function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}
