import { Alert, Button, Card, HStack, Text } from "@chakra-ui/react";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial } from "~/utils/async-state";
import EventTimeSlotForm, {
  type EventTimeSlotFormValue,
} from "../../components/event-time-slot-form";
import { formatAdminEventTimeSlot } from "./admin-event-time-slot-format";

//------------------------------------------------------------------------------
// Admin Event Time Slot Card
//------------------------------------------------------------------------------

type AdminEventTimeSlotCardProps = {
  deleting: boolean;
  editing: boolean;
  onCancelEdit: () => void;
  onDelete: (timeSlot: EventTimeSlot) => void;
  onEdit: () => void;
  onUpdate: (timeSlot: EventTimeSlot, value: EventTimeSlotFormValue) => void;
  setUpdateState: (state: AsyncState) => void;
  timeSlot: EventTimeSlot;
  updateState: AsyncState;
};

export default function AdminEventTimeSlotCard({
  deleting,
  editing,
  onCancelEdit,
  onDelete,
  onEdit,
  onUpdate,
  setUpdateState,
  timeSlot,
  updateState,
}: AdminEventTimeSlotCardProps) {
  const { locale, t } = useI18n();

  return (
    <Card.Root>
      <Card.Body gap={3}>
        {editing ?
          <EventTimeSlotForm
            actions={
              <>
                <Button loading={updateState.isLoading} size="sm" type="submit">
                  {t("page.admin_event.time_slots.save")}
                </Button>
                <Button onClick={onCancelEdit} size="sm" variant="outline">
                  {t("page.admin_event.time_slots.cancel")}
                </Button>
              </>
            }
            disabled={updateState.isLoading}
            initialValue={timeSlot}
            message={
              updateState.hasError ?
                <Alert.Root status="error">
                  <Alert.Description>{t(updateState.error)}</Alert.Description>
                </Alert.Root>
              : undefined
            }
            onSubmit={(value) => onUpdate(timeSlot, value)}
          />
        : <HStack justify="space-between">
            <Text fontWeight="medium">
              {formatAdminEventTimeSlot(timeSlot, locale)}
            </Text>

            <HStack gap={2}>
              <Button
                onClick={() => {
                  setUpdateState(initial());
                  onEdit();
                }}
                size="xs"
                variant="outline"
              >
                {t("page.admin_event.time_slots.edit")}
              </Button>
              <Button
                colorPalette="red"
                loading={deleting}
                onClick={() => onDelete(timeSlot)}
                size="xs"
                variant="outline"
              >
                {t("page.admin_event.time_slots.delete")}
              </Button>
            </HStack>
          </HStack>
        }
      </Card.Body>
    </Card.Root>
  );
}
