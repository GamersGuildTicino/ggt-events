import {
  Button,
  Card,
  HStack,
  Heading,
  Image,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import type { PublicEventTable } from "~/domain/event-tables";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import type { GameSystem } from "~/domain/game-systems";
import { formatPlayerCount } from "~/domain/players";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import EventTableAgeRequirementBadge from "../../components/event-table-age-requirement-badge";
import EventTableExperienceLevelBadge from "../../components/event-table-experience-level-badge";
import EventTableLanguageBadge from "../../components/event-table-language-badge";
import { isPastTimeSlot, seatAvailabilityColor } from "./event-page-format";
import EventRegistrationSection from "./event-registration-section";

//------------------------------------------------------------------------------
// Event Table Card
//------------------------------------------------------------------------------

type EventTableCardProps = {
  eventTable: PublicEventTable;
  gameSystem?: GameSystem;
  onRegistrationSuccess: (eventTableId: PublicEventTable["id"]) => void;
  registrationsOpen: boolean;
  timeSlot: EventTimeSlot;
};

export default function EventTableCard({
  eventTable,
  gameSystem,
  onRegistrationSuccess,
  registrationsOpen,
  timeSlot,
}: EventTableCardProps) {
  const { t, ti, tpi } = useI18n();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [registrationVisible, setRegistrationVisible] = useState(false);
  const [registrationSucceeded, setRegistrationSucceeded] = useState(false);
  const canRegister = registrationsOpen && !isPastTimeSlot(timeSlot);
  const availableSeats = Math.max(
    0,
    eventTable.maxPlayers - eventTable.registrationCount,
  );
  const hasDetails = Boolean(eventTable.description || eventTable.notes);

  const toggleEventRegistration = useCallback(() => {
    setRegistrationSucceeded(false);
    setRegistrationVisible(
      (currentRegistrationVisible) => !currentRegistrationVisible,
    );
  }, []);

  const toggleEventTableDetails = useCallback(() => {
    setDetailsVisible((currentDetailsVisible) => !currentDetailsVisible);
  }, []);

  const hideEventRegistration = useCallback(() => {
    setRegistrationVisible(false);
  }, []);

  const completeEventRegistration = useCallback(() => {
    setRegistrationSucceeded(true);
    setRegistrationVisible(false);
    onRegistrationSuccess(eventTable.id);
  }, [eventTable.id, onRegistrationSuccess]);

  return (
    <Card.Root
      _hover={{ borderColor: "ggt.border.primary" }}
      bg="ggt.surface.bg"
      borderColor="ggt.surface.border"
      overflow="hidden"
      transition="border-color 160ms ease"
    >
      <Card.Body backgroundPosition="center" backgroundSize="cover" gap={4}>
        <VStack align="flex-start" gap={2} w="full">
          <HStack
            align="flex-start"
            gap={4}
            justify="center"
            w="full"
            wrap="wrap"
          >
            {gameSystem?.coverImageUrl && (
              <Image src={gameSystem?.coverImageUrl} w="5em" />
            )}

            <VStack
              align={{ sm: "flex-start", xs: "center" }}
              flex={1}
              gap={1}
              minW={{ sm: "30%", xs: "100%" }}
              textAlign={{ sm: "left", xs: "center" }}
            >
              <Heading
                letterSpacing="0.03em"
                size="lg"
                textTransform="uppercase"
              >
                {gameSystem?.name ?? (
                  <i>{t("page.event.tables.no_game_system")}</i>
                )}
              </Heading>

              <VStack
                align={{ sm: "flex-start", xs: "center" }}
                gap={0}
                w="ful"
              >
                <Text color="fg.muted" fontSize="xs" fontWeight="semibold">
                  {eventTable.title}
                </Text>
                <Text color="fg.muted" fontSize="xs">
                  {ti(
                    "page.event.tables.game_master",
                    eventTable.gameMasterName,
                  )}
                </Text>
              </VStack>
            </VStack>

            <VStack
              align={{ sm: "flex-end", xs: "center" }}
              gap={1}
              maxW={{ sm: "30%", xs: "100%" }}
            >
              <HStack
                gap={1}
                justify={{ sm: "flex-end", xs: "center" }}
                wrap="wrap"
              >
                <EventTableAgeRequirementBadge
                  ageRequirement={eventTable.ageRequirement}
                />
                <EventTableExperienceLevelBadge
                  experienceLevel={eventTable.experienceLevel}
                />
                <EventTableLanguageBadge language={eventTable.language} />
              </HStack>

              {hasDetails && (
                <Button
                  display={{ sm: "none", xs: "inline-flex" }}
                  onClick={toggleEventTableDetails}
                  p={0}
                  size="xs"
                  variant="plain"
                >
                  {detailsVisible ?
                    t("page.event.tables.hide_details")
                  : t("page.event.tables.show_details")}
                </Button>
              )}
            </VStack>
          </HStack>

          <VStack
            align="flex-start"
            display={
              detailsVisible ?
                { sm: "flex", xs: "flex" }
              : { sm: "flex", xs: "none" }
            }
            gap={2}
          >
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
        </VStack>

        <Separator />

        <HStack justify="space-between" wrap="wrap">
          <VStack align="flex-start" gap={0}>
            <Text fontWeight="semibold">
              {formatPlayerCount({ ...eventTable, t, ti })}
            </Text>
            <Text
              color={seatAvailabilityColor(
                availableSeats,
                eventTable.maxPlayers,
              )}
              fontSize="sm"
              fontWeight="medium"
            >
              {tpi(
                "page.event.tables.available_seats",
                availableSeats,
                String(availableSeats),
              )}
            </Text>
          </VStack>

          <Button
            disabled={!canRegister}
            onClick={toggleEventRegistration}
            size="sm"
          >
            {!canRegister ?
              t("page.event.tables.closed")
            : registrationVisible ?
              t("page.event.tables.close")
            : t("page.event.tables.choose")}
          </Button>
        </HStack>

        {registrationSucceeded && (
          <AppAlert dismissible status="success">
            {t("page.event.registration.success")}
          </AppAlert>
        )}

        <EventRegistrationSection
          ageRequirement={eventTable.ageRequirement}
          eventTableId={eventTable.id}
          onCancel={hideEventRegistration}
          onSuccess={completeEventRegistration}
          registrationsOpen={canRegister}
          visible={registrationVisible}
        />
      </Card.Body>
    </Card.Root>
  );
}
