import {
  Alert,
  Button,
  Card,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import { initial } from "~/utils/async-state";
import EventTableForm from "../../components/event-table-form";
import AdminEventTableCard from "./admin-event-table-card";
import useAdminEventTables from "./use-admin-event-tables";

//------------------------------------------------------------------------------
// Admin Event Tables Section
//------------------------------------------------------------------------------

export type AdminEventTablesSectionProps = {
  eventId: Event["id"];
  timeSlots: EventTimeSlot[];
};

export default function AdminEventTablesSection({
  eventId,
  timeSlots,
}: AdminEventTablesSectionProps) {
  const { locale, t, ti } = useI18n();
  const {
    createFormKey,
    createState,
    createAdminEventRegistration,
    createAdminEventTable,
    deleteError,
    deleteAdminEventRegistration,
    deleteAdminEventTable,
    deletingEventTableId,
    editingEventTableId,
    eventRegistrationsState,
    eventTablesState,
    gameSystemById,
    gameSystemsState,
    registrationsByTableId,
    setEditingEventTableId,
    setUpdateState,
    updateAdminEventTable,
    updateState,
  } = useAdminEventTables(eventId, locale);

  const confirmDeleteEventTable = (eventTableTitle: string) =>
    window.confirm(
      ti("page.admin_event.tables.delete.confirm", eventTableTitle),
    );

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
                  key={createFormKey}
                  message={
                    createState.hasError ?
                      <Alert.Root status="error">
                        <Alert.Description>
                          {t(createState.error)}
                        </Alert.Description>
                      </Alert.Root>
                    : undefined
                  }
                  onSubmit={createAdminEventTable}
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
              <AdminEventTableCard
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
                onCreateRegistration={createAdminEventRegistration}
                onDelete={(targetEventTable) =>
                  void deleteAdminEventTable(
                    targetEventTable,
                    confirmDeleteEventTable(targetEventTable.title),
                  )
                }
                onDeleteRegistration={(registration) =>
                  deleteAdminEventRegistration(registration.id)
                }
                onEdit={() => {
                  setUpdateState(initial());
                  setEditingEventTableId(eventTable.id);
                }}
                onUpdate={updateAdminEventTable}
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
