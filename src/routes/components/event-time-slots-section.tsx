import {
  Alert,
  Button,
  Card,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "~/auth/use-auth";
import {
  type EventTimeSlot,
  createEventTimeSlot,
  deleteEventTimeSlot,
  fetchEventTimeSlots,
  updateEventTimeSlot,
} from "~/domain/event-time-slots";
import type { Event } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import EventTimeSlotForm, {
  type EventTimeSlotFormValue,
} from "./event-time-slot-form";

//------------------------------------------------------------------------------
// Event Time Slots Section
//------------------------------------------------------------------------------

export type EventTimeSlotsSectionProps = {
  eventId: Event["id"];
  onChange?: () => void;
};

export default function EventTimeSlotsSection({
  eventId,
  onChange,
}: EventTimeSlotsSectionProps) {
  const { locale, t, ti } = useI18n();
  const { user } = useAuth();
  const [createState, setCreateState] = useState<AsyncState>(initial());
  const [deleteError, setDeleteError] = useState("");
  const [deletingTimeSlotId, setDeletingTimeSlotId] = useState<
    EventTimeSlot["id"] | null
  >(null);
  const [editingTimeSlotId, setEditingTimeSlotId] = useState<
    EventTimeSlot["id"] | null
  >(null);
  const [timeSlotsState, setTimeSlotsState] =
    useState<AsyncState<EventTimeSlot[]>>(initial());
  const [updateState, setUpdateState] = useState<AsyncState>(initial());

  const loadTimeSlots = async () => {
    setTimeSlotsState(loading());
    const timeSlots = await fetchEventTimeSlots(eventId);
    setTimeSlotsState(timeSlots);
    onChange?.();
  };

  useAsyncEffect(
    async (isActive) => {
      setTimeSlotsState(loading());
      const timeSlots = await fetchEventTimeSlots(eventId);
      if (!isActive()) return;
      setTimeSlotsState(timeSlots);
    },
    [eventId],
  );

  const handleCreateTimeSlot = async (value: EventTimeSlotFormValue) => {
    try {
      if (user === null)
        return setCreateState(
          failure("page.admin_event.time_slots.error.missing_user"),
        );

      setCreateState(loading());
      const error = await createEventTimeSlot({
        createdBy: user.id,
        eventId,
        ...value,
      });

      if (error) return setCreateState(failure(error));

      setCreateState(success(undefined));
      await loadTimeSlots();
    } catch (e) {
      console.error(e);
      setCreateState(failure("page.admin_event.time_slots.error.generic"));
    }
  };

  const handleUpdateTimeSlot = async (
    timeSlot: EventTimeSlot,
    value: EventTimeSlotFormValue,
  ) => {
    try {
      setUpdateState(loading());
      const error = await updateEventTimeSlot({ ...timeSlot, ...value });

      if (error) return setUpdateState(failure(error));

      setUpdateState(success(undefined));
      setEditingTimeSlotId(null);
      await loadTimeSlots();
    } catch (e) {
      console.error(e);
      setUpdateState(failure("page.admin_event.time_slots.error.generic"));
    }
  };

  const handleDeleteTimeSlot = async (timeSlot: EventTimeSlot) => {
    const confirmed = window.confirm(
      ti(
        "page.admin_event.time_slots.delete.confirm",
        formatSlot(timeSlot, locale),
      ),
    );
    if (!confirmed) return;

    setDeleteError("");
    setDeletingTimeSlotId(timeSlot.id);
    const error = await deleteEventTimeSlot(timeSlot.id);
    setDeletingTimeSlotId(null);

    if (error) return setDeleteError(error);
    await loadTimeSlots();
  };

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
              onSubmit={handleCreateTimeSlot}
            />
          </VStack>
        </Card.Body>
      </Card.Root>

      <VStack align="stretch" gap={3}>
        <Heading size="md">{t("page.admin_event.time_slots.existing")}</Heading>

        {timeSlotsState.isLoading && <Spinner />}

        {timeSlotsState.hasError && (
          <Alert.Root status="error">
            <Alert.Description>{t(timeSlotsState.error)}</Alert.Description>
          </Alert.Root>
        )}

        {deleteError && (
          <Alert.Root status="error">
            <Alert.Description>{t(deleteError)}</Alert.Description>
          </Alert.Root>
        )}

        {timeSlotsState.isSuccess && timeSlotsState.data.length === 0 && (
          <Text color="fg.muted">{t("page.admin_event.time_slots.empty")}</Text>
        )}

        {timeSlotsState.isSuccess &&
          timeSlotsState.data.map((timeSlot) => (
            <Card.Root key={timeSlot.id}>
              <Card.Body gap={3}>
                {editingTimeSlotId === timeSlot.id ?
                  <EventTimeSlotForm
                    actions={
                      <>
                        <Button
                          loading={updateState.isLoading}
                          size="sm"
                          type="submit"
                        >
                          {t("page.admin_event.time_slots.save")}
                        </Button>
                        <Button
                          onClick={() => setEditingTimeSlotId(null)}
                          size="sm"
                          variant="outline"
                        >
                          {t("page.admin_event.time_slots.cancel")}
                        </Button>
                      </>
                    }
                    disabled={updateState.isLoading}
                    initialValue={timeSlot}
                    message={
                      updateState.hasError ?
                        <Alert.Root status="error">
                          <Alert.Description>
                            {t(updateState.error)}
                          </Alert.Description>
                        </Alert.Root>
                      : undefined
                    }
                    onSubmit={(value) => handleUpdateTimeSlot(timeSlot, value)}
                  />
                : <HStack justify="space-between">
                    <Text fontWeight="medium">
                      {formatSlot(timeSlot, locale)}
                    </Text>

                    <HStack gap={2}>
                      <Button
                        onClick={() => {
                          setUpdateState(initial());
                          setEditingTimeSlotId(timeSlot.id);
                        }}
                        size="xs"
                        variant="outline"
                      >
                        {t("page.admin_event.time_slots.edit")}
                      </Button>
                      <Button
                        colorPalette="red"
                        loading={deletingTimeSlotId === timeSlot.id}
                        onClick={() => handleDeleteTimeSlot(timeSlot)}
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
          ))}
      </VStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Format Slot
//------------------------------------------------------------------------------

function formatSlot(timeSlot: EventTimeSlot, locale: string) {
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    timeSlot.startsAt,
  );
  const startsAt = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(timeSlot.startsAt);
  const endsAt = new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
  }).format(timeSlot.endsAt);

  return `${date}, ${startsAt}-${endsAt}`;
}
