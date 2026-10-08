import {
  Button,
  Card,
  Field,
  HStack,
  NativeSelect,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import {
  type EventManager,
  assignEventManager,
  fetchEventManagers,
  unassignEventManager,
} from "~/domain/event-managers";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";

type AdminEventManagersSectionProps = {
  eventId: string;
};

export default function AdminEventManagersSection({
  eventId,
}: AdminEventManagersSectionProps) {
  const { locale, t } = useI18n();
  const [managersState, setManagersState] =
    useState<AsyncState<EventManager[]>>(initial());
  const [actionState, setActionState] = useState<AsyncState>(initial());
  const [selectedUserId, setSelectedUserId] = useState("");

  const loadManagers = useCallback(async () => {
    setManagersState(loading());
    setManagersState(await fetchEventManagers());
  }, []);

  useAsyncEffect(async (isActive) => {
    const managers = await fetchEventManagers();
    if (isActive()) setManagersState(managers);
  }, []);

  const assignedManagers = useMemo(
    () =>
      managersState.isSuccess ?
        sortGameMasters(
          managersState.data.filter((manager) =>
            manager.eventIds.includes(eventId),
          ),
          locale,
        )
      : [],
    [eventId, locale, managersState],
  );
  const availableManagers = useMemo(
    () =>
      managersState.isSuccess ?
        sortGameMasters(
          managersState.data.filter(
            (manager) => !manager.eventIds.includes(eventId),
          ),
          locale,
        )
      : [],
    [eventId, locale, managersState],
  );

  const updateAssignment = async (userId: string, assign: boolean) => {
    setActionState(loading());
    const error =
      assign ?
        await assignEventManager(userId, eventId)
      : await unassignEventManager(userId, eventId);
    if (error) {
      setActionState(failure(error));
      return;
    }
    setActionState(success(undefined));
    setSelectedUserId("");
    await loadManagers();
  };

  return (
    <Card.Root>
      <Card.Body gap={4}>
        <Text fontWeight="semibold">
          {t("page.admin_event.game_masters.heading")}
        </Text>

        {managersState.isLoading && <Spinner />}
        {managersState.hasError && (
          <AppAlert status="error">{t(managersState.error)}</AppAlert>
        )}
        {actionState.hasError && (
          <AppAlert status="error">{t(actionState.error)}</AppAlert>
        )}

        {managersState.isSuccess && (
          <>
            <HStack align="end">
              <Field.Root
                disabled={availableManagers.length === 0}
                flex="1"
                minW={0}
              >
                <NativeSelect.Root
                  disabled={availableManagers.length === 0}
                  size="sm"
                >
                  <NativeSelect.Field
                    aria-label={t("page.admin_event.game_masters.select")}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    value={selectedUserId}
                  >
                    <option value="">-</option>
                    {availableManagers.map((manager) => (
                      <option key={manager.userId} value={manager.userId}>
                        {manager.displayName || manager.email}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Button
                disabled={!selectedUserId || availableManagers.length === 0}
                loading={actionState.isLoading}
                onClick={() => void updateAssignment(selectedUserId, true)}
                size="sm"
              >
                {t("page.admin_event.game_masters.add")}
              </Button>
            </HStack>

            {assignedManagers.length === 0 ?
              <Text color="fg.muted">
                {t("page.admin_event.game_masters.empty")}
              </Text>
            : <Table.Root interactive size="sm">
                <Table.Body>
                  {assignedManagers.map((manager) => (
                    <Table.Row key={manager.userId}>
                      <Table.Cell
                        borderBottom={0}
                        fontSize="sm"
                        fontWeight="medium"
                        py={2}
                      >
                        {manager.displayName || manager.email}
                      </Table.Cell>
                      <Table.Cell borderBottom={0} py={2} textAlign="end">
                        <Button
                          colorPalette="red"
                          loading={actionState.isLoading}
                          onClick={() =>
                            void updateAssignment(manager.userId, false)
                          }
                          size="xs"
                          variant="outline"
                        >
                          {t("page.admin_event.game_masters.remove")}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            }
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}

function sortGameMasters(managers: EventManager[], locale: string) {
  return [...managers].sort((a, b) => {
    const aName = a.displayName || a.email;
    const bName = b.displayName || b.email;
    return (
      aName.localeCompare(bName, locale) ||
      a.email.localeCompare(b.email, locale)
    );
  });
}
