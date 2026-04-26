import {
  Alert,
  Badge,
  Button,
  Card,
  HStack,
  Heading,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import type { PublicEventTable } from "~/domain/event-tables";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import { formatPlayerCount } from "~/domain/players";
import useI18n from "~/i18n/use-i18n";
import EventTableExperienceLevelBadge from "../../components/event-table-experience-level-badge";
import EventTableLanguageBadge from "../../components/event-table-language-badge";
import { isPastTimeSlot, seatAvailabilityColor } from "./event-page-format";
import EventRegistrationSection from "./event-registration-section";

//------------------------------------------------------------------------------
// Event Table Card
//------------------------------------------------------------------------------

type EventTableCardProps = {
  eventTable: PublicEventTable;
  gameSystemImageUrl?: string;
  gameSystemName: string;
  registrationsOpen: boolean;
  timeSlot: EventTimeSlot;
};

export default function EventTableCard({
  eventTable,
  gameSystemImageUrl,
  gameSystemName,
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
  const imageUrl = eventTable.imageUrl || gameSystemImageUrl;

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
  }, []);

  return (
    <Card.Root
      _hover={{ borderColor: "blue.400", transform: "translateY(-2px)" }}
      overflow="hidden"
      transition="border-color 160ms ease, transform 160ms ease"
    >
      <Card.Body
        backgroundImage={
          imageUrl ?
            `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 38%, rgba(255,255,255,0.72) 100%), url(${imageUrl})`
          : undefined
        }
        backgroundPosition="center"
        backgroundSize="cover"
        gap={4}
      >
        <VStack align="flex-start" gap={2}>
          <HStack align="flex-start" justify="space-between" w="full">
            <VStack align="flex-start" gap={1}>
              <Heading size="lg">{eventTable.title}</Heading>
              <Text color="fg.muted" fontSize="sm">
                {ti("page.event.tables.game_master", eventTable.gameMasterName)}
              </Text>
            </VStack>

            <VStack align="flex-end" gap={1}>
              <Badge colorPalette="gray">{gameSystemName}</Badge>
              <HStack gap={1}>
                <EventTableExperienceLevelBadge
                  experienceLevel={eventTable.experienceLevel}
                />
                <EventTableLanguageBadge language={eventTable.language} />
              </HStack>
            </VStack>
          </HStack>

          {hasDetails && (
            <Button
              alignSelf="flex-start"
              display={{ base: "inline-flex", md: "none" }}
              h="auto"
              minW={0}
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

          <VStack
            align="flex-start"
            display={
              detailsVisible ?
                { base: "flex", md: "flex" }
              : { base: "none", md: "flex" }
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

        <HStack justify="space-between">
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
          <Alert.Root status="success">
            <Alert.Description>
              {t("page.event.registration.success")}
            </Alert.Description>
          </Alert.Root>
        )}

        <EventRegistrationSection
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
