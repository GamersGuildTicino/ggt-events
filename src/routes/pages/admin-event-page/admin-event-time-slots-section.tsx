import {
  Alert,
  Button,
  Card,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import useI18n from "~/i18n/use-i18n";
import EventTimeSlotForm from "../../components/event-time-slot-form";
import AdminEventTimeSlotCard from "./admin-event-time-slot-card";
import { formatAdminEventTimeSlot } from "./admin-event-time-slot-format";
import useAdminEventTimeSlots from "./use-admin-event-time-slots";

//------------------------------------------------------------------------------
// Admin Event Time Slots Section
//------------------------------------------------------------------------------

type AdminEventTimeSlotsSectionProps = {
  createState: ReturnType<typeof useAdminEventTimeSlots>["createState"];
  createAdminEventTimeSlot: ReturnType<
    typeof useAdminEventTimeSlots
  >["createAdminEventTimeSlot"];
  deleteError: ReturnType<typeof useAdminEventTimeSlots>["deleteError"];
  deleteAdminEventTimeSlot: ReturnType<
    typeof useAdminEventTimeSlots
  >["deleteAdminEventTimeSlot"];
  deletingTimeSlotId: ReturnType<
    typeof useAdminEventTimeSlots
  >["deletingTimeSlotId"];
  editingTimeSlotId: ReturnType<
    typeof useAdminEventTimeSlots
  >["editingTimeSlotId"];
  eventTimeSlotsState: ReturnType<
    typeof useAdminEventTimeSlots
  >["eventTimeSlotsState"];
  setEditingTimeSlotId: ReturnType<
    typeof useAdminEventTimeSlots
  >["setEditingTimeSlotId"];
  setUpdateState: ReturnType<typeof useAdminEventTimeSlots>["setUpdateState"];
  updateAdminEventTimeSlot: ReturnType<
    typeof useAdminEventTimeSlots
  >["updateAdminEventTimeSlot"];
  updateState: ReturnType<typeof useAdminEventTimeSlots>["updateState"];
};

export default function AdminEventTimeSlotsSection({
  createState,
  createAdminEventTimeSlot,
  deleteError,
  deleteAdminEventTimeSlot,
  deletingTimeSlotId,
  editingTimeSlotId,
  eventTimeSlotsState,
  setEditingTimeSlotId,
  setUpdateState,
  updateAdminEventTimeSlot,
  updateState,
}: AdminEventTimeSlotsSectionProps) {
  const { locale, t, ti } = useI18n();

  const confirmAdminEventTimeSlotDelete = useCallback(
    (timeSlot: EventTimeSlot) =>
      window.confirm(
        ti(
          "page.admin_event.time_slots.delete.confirm",
          formatAdminEventTimeSlot(timeSlot, locale),
        ),
      ),
    [locale, ti],
  );

  return (
    <VStack align="stretch" gap={4} w="full">
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap={3} w="full">
            <Heading size="md">{t("page.admin_event.time_slots.new")}</Heading>

            <EventTimeSlotForm
              actions={
                <Button loading={createState.isLoading} size="sm" type="submit">
                  {t("page.admin_event.time_slots.create")}
                </Button>
              }
              disabled={createState.isLoading}
              message={
                createState.hasError ?
                  <Alert.Root status="error">
                    <Alert.Description>
                      {t(createState.error)}
                    </Alert.Description>
                  </Alert.Root>
                : undefined
              }
              onSubmit={createAdminEventTimeSlot}
            />
          </VStack>
        </Card.Body>
      </Card.Root>

      <VStack align="stretch" gap={3}>
        {eventTimeSlotsState.isLoading && <Spinner />}

        {eventTimeSlotsState.hasError && (
          <Alert.Root status="error">
            <Alert.Description>
              {t(eventTimeSlotsState.error)}
            </Alert.Description>
          </Alert.Root>
        )}

        {deleteError && (
          <Alert.Root status="error">
            <Alert.Description>{t(deleteError)}</Alert.Description>
          </Alert.Root>
        )}

        {eventTimeSlotsState.isSuccess &&
          eventTimeSlotsState.data.length === 0 && (
            <Text color="fg.muted">
              {t("page.admin_event.time_slots.empty")}
            </Text>
          )}

        {eventTimeSlotsState.isSuccess &&
          eventTimeSlotsState.data.map((timeSlot) => (
            <AdminEventTimeSlotCard
              deleting={deletingTimeSlotId === timeSlot.id}
              editing={editingTimeSlotId === timeSlot.id}
              key={timeSlot.id}
              onCancelEdit={() => setEditingTimeSlotId(null)}
              onDelete={(targetTimeSlot) =>
                void deleteAdminEventTimeSlot(
                  targetTimeSlot.id,
                  confirmAdminEventTimeSlotDelete(targetTimeSlot),
                )
              }
              onEdit={() => setEditingTimeSlotId(timeSlot.id)}
              onUpdate={updateAdminEventTimeSlot}
              setUpdateState={setUpdateState}
              timeSlot={timeSlot}
              updateState={updateState}
            />
          ))}
      </VStack>
    </VStack>
  );
}
