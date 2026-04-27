import { Card, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";
import type { PublicEventTable } from "~/domain/event-tables";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import type { GameSystem } from "~/domain/game-systems";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import type { AsyncState } from "~/utils/async-state";
import AdminContentColumns from "../../components/admin-content-columns";
import { formatSlot, spansMultipleDays } from "./event-page-format";
import EventTableCard from "./event-table-card";

//------------------------------------------------------------------------------
// Event Tables Section
//------------------------------------------------------------------------------

type EventTablesSectionProps = {
  event: Event;
  eventTablesState: AsyncState<PublicEventTable[]>;
  eventTimeSlotsState: AsyncState<EventTimeSlot[]>;
  gameSystemById: Map<string, GameSystem>;
  gameSystemsState: AsyncState<GameSystem[]>;
};

export default function EventTablesSection({
  event,
  eventTablesState,
  eventTimeSlotsState,
  gameSystemById,
  gameSystemsState,
}: EventTablesSectionProps) {
  const { locale, t } = useI18n();
  const tablesBySlotId = useMemo(() => {
    if (!eventTablesState.isSuccess)
      return new Map<string, PublicEventTable[]>();

    const result = new Map<string, PublicEventTable[]>();
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
        <AppAlert status="error">{t(eventTablesState.error)}</AppAlert>
      )}

      {gameSystemsState.hasError && (
        <AppAlert status="error">{t(gameSystemsState.error)}</AppAlert>
      )}

      {eventTimeSlotsState.hasError && (
        <AppAlert status="error">{t(eventTimeSlotsState.error)}</AppAlert>
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
                        gameSystemImageUrl={
                          gameSystemById.get(eventTable.gameSystemId)?.imageUrl
                        }
                        gameSystemName={
                          gameSystemById.get(eventTable.gameSystemId)?.name ??
                          ""
                        }
                        key={eventTable.id}
                        registrationsOpen={event.registrationsOpen}
                        timeSlot={timeSlot}
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
