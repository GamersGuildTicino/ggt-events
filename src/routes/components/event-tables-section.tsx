import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  HStack,
  Heading,
  Input,
  Separator,
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
import type { EventTableLanguage } from "~/domain/enums/event-table-language";
import {
  type EventRegistration,
  deleteEventRegistration,
  fetchEventRegistrations,
  registerForEventTable,
} from "~/domain/event-registrations";
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
  const [eventRegistrationsState, setEventRegistrationsState] =
    useState<AsyncState<EventRegistration[]>>(initial());
  const [gameSystemsState, setGameSystemsState] =
    useState<AsyncState<GameSystem[]>>(initial());
  const [updateState, setUpdateState] = useState<AsyncState>(initial());

  const gameSystemById = useMemo(() => {
    if (!gameSystemsState.isSuccess) return new Map<string, GameSystem>();
    return new Map(
      gameSystemsState.data.map((gameSystem) => [gameSystem.id, gameSystem]),
    );
  }, [gameSystemsState]);

  const registrationsByTableId = useMemo(() => {
    if (!eventRegistrationsState.isSuccess)
      return new Map<string, EventRegistration[]>();

    const result = new Map<string, EventRegistration[]>();
    for (const registration of eventRegistrationsState.data) {
      const registrations = result.get(registration.eventTableId) ?? [];
      registrations.push(registration);
      result.set(registration.eventTableId, registrations);
    }
    return result;
  }, [eventRegistrationsState]);

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

  useAsyncEffect(
    async (isActive) => {
      if (!eventTablesState.isSuccess) return;

      setEventRegistrationsState(loading());
      const registrations = await fetchEventRegistrations(
        eventTablesState.data.map((eventTable) => eventTable.id),
      );
      if (!isActive()) return;
      setEventRegistrationsState(registrations);
    },
    [eventTablesState],
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

  const loadRegistrations = async (eventTables: EventTable[]) => {
    setEventRegistrationsState(loading());
    const registrations = await fetchEventRegistrations(
      eventTables.map((eventTable) => eventTable.id),
    );
    setEventRegistrationsState(registrations);
  };

  const handleCreateRegistration = async (
    eventTableId: EventTable["id"],
    value: RegistrationFormValue,
  ) => {
    const error = await registerForEventTable({
      email: value.email,
      eventTableId,
      playerName: value.playerName,
    });

    if (error) return error;

    if (eventTablesState.isSuccess)
      await loadRegistrations(eventTablesState.data);
    return "";
  };

  const handleDeleteRegistration = async (
    registrationId: EventRegistration["id"],
  ) => {
    const error = await deleteEventRegistration(registrationId);
    if (error) return error;

    if (eventTablesState.isSuccess)
      await loadRegistrations(eventTablesState.data);
    return "";
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
                onCreateRegistration={handleCreateRegistration}
                onDelete={handleDeleteEventTable}
                onDeleteRegistration={handleDeleteRegistration}
                onEdit={() => {
                  setUpdateState(initial());
                  setEditingEventTableId(eventTable.id);
                }}
                onUpdate={handleUpdateEventTable}
                registrations={registrationsByTableId.get(eventTable.id) ?? []}
                registrationsState={eventRegistrationsState}
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
  onCreateRegistration,
  onDelete,
  onDeleteRegistration,
  onEdit,
  onUpdate,
  registrations,
  registrationsState,
  timeSlots,
  updateState,
}: {
  deleting: boolean;
  editing: boolean;
  eventTable: EventTable;
  gameSystemName: string;
  gameSystems: GameSystem[];
  onCancelEdit: () => void;
  onCreateRegistration: (
    eventTableId: EventTable["id"],
    value: RegistrationFormValue,
  ) => Promise<string>;
  onDelete: (eventTable: EventTable) => void;
  onDeleteRegistration: (
    registrationId: EventRegistration["id"],
  ) => Promise<string>;
  onEdit: () => void;
  onUpdate: (eventTable: EventTable, value: EventTableFormValue) => void;
  registrations: EventRegistration[];
  registrationsState: AsyncState<EventRegistration[]>;
  timeSlots: EventTimeSlot[];
  updateState: AsyncState;
}) {
  const { locale, t, ti } = useI18n();
  const timeSlot = timeSlots.find(
    (timeSlot) => timeSlot.id === eventTable.timeSlotId,
  );
  const [createRegistrationState, setCreateRegistrationState] =
    useState<AsyncState>(initial());
  const [deletingRegistrationId, setDeletingRegistrationId] = useState<
    EventRegistration["id"] | null
  >(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [registrationsVisible, setRegistrationsVisible] = useState(false);
  const showDetails = () => setDetailsVisible(true);
  const hideDetails = () => setDetailsVisible(false);
  const hasDetails = Boolean(eventTable.description || eventTable.notes);
  const hasFreeSeats = registrations.length < eventTable.maxPlayers;

  const handleCreateRegistration = async (value: RegistrationFormValue) => {
    setCreateRegistrationState(loading());
    const error = await onCreateRegistration(eventTable.id, value);
    if (error) return setCreateRegistrationState(failure(error));

    setCreateRegistrationState(success(undefined));
  };

  const handleDeleteRegistration = async (registration: EventRegistration) => {
    const message = ti(
      "page.admin_event.tables.registrations.delete.confirm",
      registration.playerName,
    );
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    setDeletingRegistrationId(registration.id);
    const error = await onDeleteRegistration(registration.id);
    setDeletingRegistrationId(null);
    if (error) setCreateRegistrationState(failure(error));
  };

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
              <VStack align="flex-start" gap={0.5}>
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
                  <LanguageBadge language={eventTable.language} />
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

                {hasDetails && (
                  <Button
                    h="auto"
                    minW={0}
                    onClick={detailsVisible ? hideDetails : showDetails}
                    p={0}
                    size="xs"
                    variant="plain"
                  >
                    {detailsVisible ?
                      t("page.admin_event.tables.hide_description")
                    : t("page.admin_event.tables.show_description")}
                  </Button>
                )}
              </VStack>
            </HStack>

            {detailsVisible && (
              <VStack align="flex-start" gap={2}>
                {eventTable.description && (
                  <Text color="fg.muted" fontSize="sm" whiteSpace="pre-line">
                    {eventTable.description}
                  </Text>
                )}
                {eventTable.notes && (
                  <VStack align="flex-start" gap={1}>
                    <Text fontSize="xs" fontWeight="bold">
                      {t("page.admin_event.tables.notes")}
                    </Text>
                    <Text color="fg.muted" fontSize="sm" whiteSpace="pre-line">
                      {eventTable.notes}
                    </Text>
                  </VStack>
                )}
              </VStack>
            )}

            <Separator />

            <VStack align="stretch" gap={3}>
              <HStack justify="space-between">
                <Heading size="sm">
                  {ti(
                    "page.admin_event.tables.registrations.heading",
                    String(registrations.length),
                    String(eventTable.maxPlayers),
                  )}
                </Heading>

                <Button
                  h="auto"
                  minW={0}
                  onClick={() => setRegistrationsVisible(!registrationsVisible)}
                  p={0}
                  size="xs"
                  variant="plain"
                >
                  {registrationsVisible ?
                    t("page.admin_event.tables.registrations.hide")
                  : t("page.admin_event.tables.registrations.show")}
                </Button>
              </HStack>

              {registrationsVisible && (
                <VStack align="stretch" gap={3}>
                  {registrationsState.isLoading && <Spinner size="sm" />}

                  {registrationsState.hasError && (
                    <Alert.Root status="error">
                      <Alert.Description>
                        {t(registrationsState.error)}
                      </Alert.Description>
                    </Alert.Root>
                  )}

                  {createRegistrationState.hasError && (
                    <Alert.Root status="error">
                      <Alert.Description>
                        {t(createRegistrationState.error)}
                      </Alert.Description>
                    </Alert.Root>
                  )}

                  {createRegistrationState.isSuccess && (
                    <Alert.Root status="success">
                      <Alert.Description>
                        {t("page.admin_event.tables.registrations.added")}
                      </Alert.Description>
                    </Alert.Root>
                  )}

                  {!registrationsState.hasError &&
                    registrations.length === 0 &&
                    !registrationsState.isLoading && (
                      <Text color="fg.muted" fontSize="sm">
                        {t("page.admin_event.tables.registrations.empty")}
                      </Text>
                    )}

                  {!registrationsState.hasError &&
                    registrations.map((registration) => (
                      <HStack
                        justify="space-between"
                        key={registration.id}
                        w="full"
                      >
                        <VStack align="flex-start" gap={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {registration.playerName}
                          </Text>
                          <Text color="fg.muted" fontSize="sm">
                            {registration.email}
                          </Text>
                        </VStack>

                        <Button
                          colorPalette="red"
                          loading={deletingRegistrationId === registration.id}
                          onClick={() => handleDeleteRegistration(registration)}
                          size="xs"
                          variant="outline"
                        >
                          {t("page.admin_event.tables.registrations.delete")}
                        </Button>
                      </HStack>
                    ))}

                  {!registrationsState.hasError && hasFreeSeats && (
                    <RegistrationForm
                      onSubmit={handleCreateRegistration}
                      submitting={createRegistrationState.isLoading}
                    />
                  )}
                </VStack>
              )}
            </VStack>
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
// Language Badge
//------------------------------------------------------------------------------

function LanguageBadge({ language }: { language: EventTableLanguage }) {
  const { t } = useI18n();
  if (language === "italian" || language === "unspecified") return null;

  return (
    <Badge colorPalette="pink" size="sm">
      {t(`enum.event_table_language.${language}`)}
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

//------------------------------------------------------------------------------
// Registration Form
//------------------------------------------------------------------------------

type RegistrationFormValue = {
  email: string;
  playerName: string;
};

function RegistrationForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (value: RegistrationFormValue) => void;
  submitting: boolean;
}) {
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onSubmit({
      email: String(formData.get("email") ?? "").trim(),
      playerName: String(formData.get("player-name") ?? "").trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <HStack align="flex-end">
        <Field.Root required>
          <Input
            name="email"
            placeholder={t("page.admin_event.tables.registrations.email")}
            size="xs"
            type="email"
          />
        </Field.Root>

        <Field.Root required>
          <Input
            name="player-name"
            pattern="\s*\S.*"
            placeholder={t("page.admin_event.tables.registrations.player_name")}
            size="xs"
          />
        </Field.Root>

        <Button loading={submitting} size="xs" type="submit">
          {t("page.admin_event.tables.registrations.add")}
        </Button>
      </HStack>
    </form>
  );
}
