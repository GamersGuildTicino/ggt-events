import {
  Button,
  Card,
  HStack,
  Heading,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import type { EventRegistration } from "~/domain/event-registrations";
import type { EventTable } from "~/domain/event-tables";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import type { GameSystem } from "~/domain/game-systems";
import { formatPlayerCount } from "~/domain/players";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import type { AsyncState } from "~/utils/async-state";
import EventTableExperienceLevelBadge from "../../components/event-table-experience-level-badge";
import EventTableForm, {
  type EventTableFormValue,
} from "../../components/event-table-form";
import EventTableLanguageBadge from "../../components/event-table-language-badge";
import { formatSlot } from "./admin-event-table-format";
import AdminEventTableRegistrationsSection from "./admin-event-table-registrations-section";

//------------------------------------------------------------------------------
// Admin Event Table Card
//------------------------------------------------------------------------------

type AdminEventTableCardProps = {
  deleting: boolean;
  editing: boolean;
  eventTable: EventTable;
  gameSystemName: string;
  gameSystems: GameSystem[];
  onCancelEdit: () => void;
  onCreateRegistration: (
    eventTableId: EventTable["id"],
    value: {
      email: string;
      phoneNumber: string;
      playerName: string;
    },
  ) => Promise<string>;
  onDelete: (eventTable: EventTable) => void;
  onDeleteRegistration: (registration: EventRegistration) => Promise<string>;
  onEdit: () => void;
  onUpdate: (eventTable: EventTable, value: EventTableFormValue) => void;
  registrations: EventRegistration[];
  registrationsState: AsyncState<EventRegistration[]>;
  timeSlots: EventTimeSlot[];
  updateState: AsyncState;
};

export default function AdminEventTableCard({
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
}: AdminEventTableCardProps) {
  const { locale, t, ti } = useI18n();
  const timeSlot = timeSlots.find(
    (candidateTimeSlot) => candidateTimeSlot.id === eventTable.timeSlotId,
  );
  const [detailsVisible, setDetailsVisible] = useState(false);
  const hasDetails = Boolean(eventTable.description || eventTable.notes);
  const hasFreeSeats = registrations.length < eventTable.maxPlayers;
  const toggleDetails = useCallback(() => {
    setDetailsVisible((currentDetailsVisible) => !currentDetailsVisible);
  }, []);

  if (editing) {
    return (
      <Card.Root>
        <Card.Body gap={3}>
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
                <AppAlert dismissible status="error">
                  {t(updateState.error)}
                </AppAlert>
              : undefined
            }
            onSubmit={(value) => onUpdate(eventTable, value)}
            timeSlots={timeSlots}
          />
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Body gap={3}>
        <VStack align="stretch" gap={2}>
          <HStack align="stretch" justify="space-between" w="full">
            <VStack align="flex-start" gap={0.5}>
              <Heading size="md">{eventTable.title}</Heading>

              <Text color="fg.muted" fontSize="sm">
                {`${gameSystemName} (${eventTable.gameMasterName})`}
              </Text>
              <HStack gap={2}>
                <Text fontSize="sm">
                  {formatPlayerCount({ ...eventTable, t, ti })}
                </Text>
                <EventTableExperienceLevelBadge
                  experienceLevel={eventTable.experienceLevel}
                  size="sm"
                />
                <EventTableLanguageBadge
                  language={eventTable.language}
                  size="sm"
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

              {hasDetails && (
                <Button
                  h="auto"
                  minW={0}
                  onClick={toggleDetails}
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

          <AdminEventTableRegistrationsSection
            eventTable={eventTable}
            hasFreeSeats={hasFreeSeats}
            onCreateRegistration={onCreateRegistration}
            onDeleteRegistration={onDeleteRegistration}
            registrations={registrations}
            registrationsState={registrationsState}
          />
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
