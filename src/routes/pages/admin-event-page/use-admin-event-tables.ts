import { useMemo, useState } from "react";
import { useAuth } from "~/auth/use-auth";
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
import type { Event } from "~/domain/events";
import { type GameSystem, fetchGameSystems } from "~/domain/game-systems";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import type { Locale } from "~/i18n/locale";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import type { EventTableFormValue } from "../../components/event-table-form";
import type { EventTableRegistrationFormValue } from "./admin-event-table-registration-form";

//------------------------------------------------------------------------------
// Use Admin Event Tables
//------------------------------------------------------------------------------

export default function useAdminEventTables(
  eventId: Event["id"],
  locale: Locale,
) {
  const { user } = useAuth();
  const [createState, setCreateState] = useState<AsyncState>(initial());
  const [createFormKey, setCreateFormKey] = useState(0);
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

  const loadRegistrations = async (eventTables: EventTable[]) => {
    setEventRegistrationsState(loading());
    const registrations = await fetchEventRegistrations(
      eventTables.map((eventTable) => eventTable.id),
    );
    setEventRegistrationsState(registrations);
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

  const handleCreateEventTable = async (
    value: EventTableFormValue,
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    try {
      const form = e.currentTarget;

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
      form.reset();
      setCreateFormKey((key) => key + 1);
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

  const handleDeleteEventTable = async (
    eventTable: EventTable,
    confirm: boolean,
  ) => {
    if (!confirm) return;

    setDeleteError("");
    setDeletingEventTableId(eventTable.id);
    const error = await deleteEventTable(eventTable.id);
    setDeletingEventTableId(null);

    if (error) return setDeleteError(error);
    await loadEventTables();
  };

  const handleCreateRegistration = async (
    eventTableId: EventTable["id"],
    value: EventTableRegistrationFormValue,
  ) => {
    const error = await registerForEventTable({
      email: value.email,
      eventTableId,
      locale,
      phoneNumber: value.phoneNumber,
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

  return {
    createFormKey,
    createState,
    deleteError,
    deletingEventTableId,
    editingEventTableId,
    eventRegistrationsState,
    eventTablesState,
    gameSystemById,
    gameSystemsState,
    handleCreateEventTable,
    handleCreateRegistration,
    handleDeleteEventTable,
    handleDeleteRegistration,
    handleUpdateEventTable,
    registrationsByTableId,
    setDeleteError,
    setEditingEventTableId,
    setUpdateState,
    updateState,
  };
}
