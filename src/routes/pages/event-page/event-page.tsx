import { Button, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { ChevronLeft } from "lucide-react";
import { Link as RouterLink, useParams } from "react-router";
import usePageTitle from "~/hooks/use-page-title";
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
  const { eventSlugOrId } = useParams();
  const { t } = useI18n();
  const eventState = useEvent(eventSlugOrId);
  const eventTimeSlotsState = useEventTimeSlots(
    eventState.isSuccess ? eventState.data.id : undefined,
  );
  const eventTablesState = usePublicEventTables(
    eventState.isSuccess ? eventState.data.id : undefined,
  );
  const { gameSystemById, gameSystemsState } = useGameSystems();
  const pageTitle = eventState.isSuccess ? eventState.data.title : undefined;

  usePageTitle(pageTitle);

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

          {eventState.data.description && (
            <Text color="fg.muted" whiteSpace="pre-line">
              {eventState.data.description}
            </Text>
          )}

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
