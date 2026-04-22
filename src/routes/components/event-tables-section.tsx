import {
  Alert,
  Badge,
  Button,
  Card,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useAuth } from "~/auth/use-auth";
import {
  type EventTableExperienceLevel,
  experienceLevelColorPalette,
} from "~/domain/enums/event-table-experience-level";
import {
  type EventTable,
  createEventTable,
  deleteEventTable,
  fetchEventTables,
  updateEventTable,
} from "~/domain/event-tables";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import { type GameSystem, fetchGameSystems } from "~/domain/game-systems";
import { formatPlayerCount } from "~/domain/players";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import EventTableForm, { type EventTableFormValue } from "./event-table-form";

//------------------------------------------------------------------------------
// Event Tables Section
//------------------------------------------------------------------------------

export type EventTablesSectionProps = {
  eventId: Event["id"];
  timeSlots: EventTimeSlot[];
};

export default function EventTablesSection({
  eventId,
  timeSlots,
}: EventTablesSectionProps) {
  const { t, ti } = useI18n();
  const { user } = useAuth();
  const [createState, setCreateState] = useState<AsyncState>(initial());
  const [deleteError, setDeleteError] = useState("");
  const [deletingEventTableId, setDeletingEventTableId] = useState<
    EventTable["id"] | null
  >(null);
  const [editingEventTableId, setEditingEventTableId] = useState<
    EventTable["id"] | null
  >(null);
  const [eventTablesState, setEventTablesState] =
    useState<AsyncState<EventTable[]>>(initial());
  const [gameSystemsState, setGameSystemsState] =
    useState<AsyncState<GameSystem[]>>(initial());
  const [updateState, setUpdateState] = useState<AsyncState>(initial());

  const gameSystemById = useMemo(() => {
    if (!gameSystemsState.isSuccess) return new Map<string, GameSystem>();
    return new Map(
      gameSystemsState.data.map((gameSystem) => [gameSystem.id, gameSystem]),
    );
  }, [gameSystemsState]);

  const loadEventTables = async () => {
    setEventTablesState(loading());
    const eventTables = await fetchEventTables(eventId);
    setEventTablesState(eventTables);
  };

  useAsyncEffect(
    async (isActive) => {
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

  const handleCreateEventTable = async (value: EventTableFormValue) => {
    try {
      if (user === null)
        return setCreateState(
          failure("page.admin_event.tables.error.missing_user"),
        );

      setCreateState(loading());
      const error = await createEventTable({
        createdBy: user.id,
        ...value,
      });

      if (error) return setCreateState(failure(error));

      setCreateState(success(undefined));
      await loadEventTables();
    } catch (e) {
      console.error(e);
      setCreateState(failure("page.admin_event.tables.error.generic"));
    }
  };

  const handleUpdateEventTable = async (
    eventTable: EventTable,
    value: EventTableFormValue,
  ) => {
    try {
      setUpdateState(loading());
      const updatedEventTable = { ...eventTable, ...value };
      const error = await updateEventTable(updatedEventTable);

      if (error) return setUpdateState(failure(error));

      setUpdateState(success(undefined));
      setEditingEventTableId(null);
      await loadEventTables();
    } catch (e) {
      console.error(e);
      setUpdateState(failure("page.admin_event.tables.error.generic"));
    }
  };

  const handleDeleteEventTable = async (eventTable: EventTable) => {
    const message = ti(
      "page.admin_event.tables.delete.confirm",
      eventTable.title,
    );
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setDeleteError("");
    setDeletingEventTableId(eventTable.id);
    const error = await deleteEventTable(eventTable.id);
    setDeletingEventTableId(null);

    if (error) return setDeleteError(error);
    await loadEventTables();
  };

  return (
    <VStack align="stretch" gap={4} w="full">
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap={3} w="full">
            <Heading size="md">{t("page.admin_event.tables.new")}</Heading>

            {gameSystemsState.isLoading && <Spinner />}

            {gameSystemsState.hasError && (
              <Alert.Root status="error">
                <Alert.Description>
                  {t(gameSystemsState.error)}
                </Alert.Description>
              </Alert.Root>
            )}

            {gameSystemsState.isSuccess &&
              gameSystemsState.data.length === 0 && (
                <Text color="fg.muted">
                  {t("page.admin_event.tables.no_game_systems")}
                </Text>
              )}

            {timeSlots.length === 0 && (
              <Text color="fg.muted">
                {t("page.admin_event.tables.no_time_slots")}
              </Text>
            )}

            {gameSystemsState.isSuccess &&
              gameSystemsState.data.length > 0 &&
              timeSlots.length > 0 && (
                <EventTableForm
                  actions={
                    <Button
                      loading={createState.isLoading}
                      size="sm"
                      type="submit"
                    >
                      {t("page.admin_event.tables.create")}
                    </Button>
                  }
                  disabled={createState.isLoading}
                  gameSystems={gameSystemsState.data}
                  message={
                    createState.hasError ?
                      <Alert.Root status="error">
                        <Alert.Description>
                          {t(createState.error)}
                        </Alert.Description>
                      </Alert.Root>
                    : undefined
                  }
                  onSubmit={handleCreateEventTable}
                  timeSlots={timeSlots}
                />
              )}
          </VStack>
        </Card.Body>
      </Card.Root>

      <VStack align="stretch" gap={3} w="full">
        {eventTablesState.isLoading && <Spinner />}

        {eventTablesState.hasError && (
          <Alert.Root status="error">
            <Alert.Description>{t(eventTablesState.error)}</Alert.Description>
          </Alert.Root>
        )}

        {deleteError && (
          <Alert.Root status="error">
            <Alert.Description>{t(deleteError)}</Alert.Description>
          </Alert.Root>
        )}

        {eventTablesState.isSuccess && eventTablesState.data.length > 0 && (
          <VStack align="stretch" gap={3}>
            {eventTablesState.data.map((eventTable) => (
              <EventTableCard
                deleting={deletingEventTableId === eventTable.id}
                editing={editingEventTableId === eventTable.id}
                eventTable={eventTable}
                gameSystemName={
                  gameSystemById.get(eventTable.gameSystemId)?.name ?? ""
                }
                gameSystems={
                  gameSystemsState.isSuccess ? gameSystemsState.data : []
                }
                key={eventTable.id}
                onCancelEdit={() => setEditingEventTableId(null)}
                onDelete={handleDeleteEventTable}
                onEdit={() => {
                  setUpdateState(initial());
                  setEditingEventTableId(eventTable.id);
                }}
                onUpdate={handleUpdateEventTable}
                timeSlots={timeSlots}
                updateState={updateState}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Event Table Card
//------------------------------------------------------------------------------

function EventTableCard({
  deleting,
  editing,
  eventTable,
  gameSystemName,
  gameSystems,
  onCancelEdit,
  onDelete,
  onEdit,
  onUpdate,
  timeSlots,
  updateState,
}: {
  deleting: boolean;
  editing: boolean;
  eventTable: EventTable;
  gameSystemName: string;
  gameSystems: GameSystem[];
  onCancelEdit: () => void;
  onDelete: (eventTable: EventTable) => void;
  onEdit: () => void;
  onUpdate: (eventTable: EventTable, value: EventTableFormValue) => void;
  timeSlots: EventTimeSlot[];
  updateState: AsyncState;
}) {
  const { locale, t, ti } = useI18n();
  const timeSlot = timeSlots.find(
    (timeSlot) => timeSlot.id === eventTable.timeSlotId,
  );
  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const showDescription = () => setDescriptionVisible(true);
  const hideDescription = () => setDescriptionVisible(false);

  return (
    <Card.Root>
      <Card.Body gap={3}>
        {editing ?
          <EventTableForm
            actions={
              <>
                <Button loading={updateState.isLoading} size="sm" type="submit">
                  {t("page.admin_event.tables.save")}
                </Button>
                <Button onClick={onCancelEdit} size="sm" variant="outline">
                  {t("page.admin_event.tables.cancel")}
                </Button>
              </>
            }
            disabled={updateState.isLoading}
            gameSystems={gameSystems}
            initialValue={eventTable}
            message={
              updateState.hasError ?
                <Alert.Root status="error">
                  <Alert.Description>{t(updateState.error)}</Alert.Description>
                </Alert.Root>
              : undefined
            }
            onSubmit={(value) => onUpdate(eventTable, value)}
            timeSlots={timeSlots}
          />
        : <VStack align="stretch" gap={2}>
            <HStack align="stretch" justify="space-between" w="full">
              <VStack align="flex-start" gap={0}>
                <Heading size="md">{eventTable.title}</Heading>

                <Text color="fg.muted" fontSize="sm">
                  {`${gameSystemName} (${eventTable.gameMasterName})`}
                </Text>
                <HStack gap={2}>
                  <Text fontSize="sm">
                    {`${formatPlayerCount({ ...eventTable, t, ti })}`}
                  </Text>
                  <ExperienceLevelBadge
                    experienceLevel={eventTable.experienceLevel}
                  />
                </HStack>
                {timeSlot && (
                  <Text fontSize="sm">
                    {ti(
                      "page.admin_event.tables.time_slot",
                      formatSlot(timeSlot, locale),
                    )}
                  </Text>
                )}
              </VStack>

              <VStack align="flex-end" justify="space-between">
                <HStack gap={2}>
                  <Button onClick={onEdit} size="xs" variant="outline">
                    {t("page.admin_event.tables.edit")}
                  </Button>
                  <Button
                    colorPalette="red"
                    loading={deleting}
                    onClick={() => onDelete(eventTable)}
                    size="xs"
                    variant="outline"
                  >
                    {t("page.admin_event.tables.delete")}
                  </Button>
                </HStack>

                {eventTable.description && (
                  <Button
                    h="auto"
                    minW={0}
                    onClick={
                      descriptionVisible ? hideDescription : showDescription
                    }
                    p={0}
                    size="xs"
                    variant="plain"
                  >
                    {descriptionVisible ?
                      t("page.admin_event.tables.hide_description")
                    : t("page.admin_event.tables.show_description")}
                  </Button>
                )}
              </VStack>
            </HStack>

            {descriptionVisible && (
              <Text color="fg.muted" fontSize="sm" whiteSpace="pre-line">
                {eventTable.description}
              </Text>
            )}
          </VStack>
        }
      </Card.Body>
    </Card.Root>
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
    <Badge
      colorPalette={experienceLevelColorPalette(experienceLevel)}
      size="sm"
    >
      {t(`enum.event_table_experience_level.${experienceLevel}`)}
    </Badge>
  );
}

//------------------------------------------------------------------------------
// Format Slot
//------------------------------------------------------------------------------

function formatSlot(timeSlot: EventTimeSlot, locale: string) {
  return `${formatDateTime(timeSlot.startsAt, locale)}-${formatTime(timeSlot.endsAt, locale)}`;
}

//------------------------------------------------------------------------------
// Format Date Time
//------------------------------------------------------------------------------

function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

//------------------------------------------------------------------------------
// Format Time
//------------------------------------------------------------------------------

function formatTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(date);
}
