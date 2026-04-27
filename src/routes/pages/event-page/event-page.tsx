import { Button, HStack, Spinner, VStack } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { Link as RouterLink, useParams } from "react-router";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import EventHero from "./event-hero";
import EventTablesSection from "./event-tables-section";
import useEvent from "./use-event";
import useEventTimeSlots from "./use-event-time-slots";
import useGameSystems from "./use-game-systems";
import usePublicEventTables from "./use-public-event-tables";

//------------------------------------------------------------------------------
// Event Page
//------------------------------------------------------------------------------

export default function EventPage() {
  const { eventId } = useParams();
  const { t } = useI18n();
  const eventState = useEvent(eventId);
  const eventTimeSlotsState = useEventTimeSlots(eventId);
  const eventTablesState = usePublicEventTables(eventId);
  const { gameSystemById, gameSystemsState } = useGameSystems();

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
        <AppAlert status="error">{t(eventState.error)}</AppAlert>
      )}

      {eventState.isSuccess && (
        <>
          <EventHero
            event={eventState.data}
            timeSlots={
              eventTimeSlotsState.isSuccess ? eventTimeSlotsState.data : []
            }
          />

          <EventTablesSection
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
