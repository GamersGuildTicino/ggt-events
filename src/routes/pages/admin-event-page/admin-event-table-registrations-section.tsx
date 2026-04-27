import {
  Button,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import type { EventRegistration } from "~/domain/event-registrations";
import type { EventTable } from "~/domain/event-tables";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import AdminEventTableRegistrationForm, {
  type EventTableRegistrationFormValue,
} from "./admin-event-table-registration-form";

//------------------------------------------------------------------------------
// Admin Event Table Registrations Section
//------------------------------------------------------------------------------

type AdminEventTableRegistrationsSectionProps = {
  eventTable: EventTable;
  hasFreeSeats: boolean;
  onCreateRegistration: (
    eventTableId: EventTable["id"],
    value: EventTableRegistrationFormValue,
  ) => Promise<string>;
  onDeleteRegistration: (registration: EventRegistration) => Promise<string>;
  registrations: EventRegistration[];
  registrationsState: AsyncState<EventRegistration[]>;
};

export default function AdminEventTableRegistrationsSection({
  eventTable,
  hasFreeSeats,
  onCreateRegistration,
  onDeleteRegistration,
  registrations,
  registrationsState,
}: AdminEventTableRegistrationsSectionProps) {
  const { t, ti } = useI18n();
  const [createRegistrationState, setCreateRegistrationState] =
    useState<AsyncState>(initial());
  const [deletingRegistrationId, setDeletingRegistrationId] = useState<
    EventRegistration["id"] | null
  >(null);
  const [registrationsVisible, setRegistrationsVisible] = useState(false);

  const createAdminEventRegistration = useCallback(
    async (value: EventTableRegistrationFormValue) => {
      setCreateRegistrationState(loading());
      const error = await onCreateRegistration(eventTable.id, value);
      if (error) return setCreateRegistrationState(failure(error));

      setCreateRegistrationState(success(undefined));
      return "";
    },
    [eventTable.id, onCreateRegistration],
  );

  const deleteAdminEventRegistration = useCallback(
    async (registration: EventRegistration) => {
      const message = ti(
        "page.admin_event.tables.registrations.delete.confirm",
        registration.playerName,
      );
      const confirmed = window.confirm(message);
      if (!confirmed) return;

      setDeletingRegistrationId(registration.id);
      const error = await onDeleteRegistration(registration);
      setDeletingRegistrationId(null);
      if (error) setCreateRegistrationState(failure(error));
    },
    [onDeleteRegistration, ti],
  );

  const toggleAdminEventRegistrations = useCallback(() => {
    setRegistrationsVisible(
      (currentRegistrationsVisible) => !currentRegistrationsVisible,
    );
  }, []);

  return (
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
          onClick={toggleAdminEventRegistrations}
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
            <AppAlert status="error">{t(registrationsState.error)}</AppAlert>
          )}

          {createRegistrationState.hasError && (
            <AppAlert dismissible status="error">
              {t(createRegistrationState.error)}
            </AppAlert>
          )}

          {createRegistrationState.isSuccess && (
            <AppAlert dismissible status="success">
              {t("page.admin_event.tables.registrations.added")}
            </AppAlert>
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
              <HStack justify="space-between" key={registration.id} w="full">
                <VStack align="flex-start" gap={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    {registration.playerName}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {registration.email}
                  </Text>
                  {registration.phoneNumber && (
                    <Text color="fg.muted" fontSize="sm">
                      {registration.phoneNumber}
                    </Text>
                  )}
                </VStack>

                <Button
                  colorPalette="red"
                  loading={deletingRegistrationId === registration.id}
                  onClick={() => deleteAdminEventRegistration(registration)}
                  size="xs"
                  variant="outline"
                >
                  {t("page.admin_event.tables.registrations.delete")}
                </Button>
              </HStack>
            ))}

          {!registrationsState.hasError && hasFreeSeats && (
            <AdminEventTableRegistrationForm
              onSubmit={createAdminEventRegistration}
              submitting={createRegistrationState.isLoading}
            />
          )}
        </VStack>
      )}
    </VStack>
  );
}
