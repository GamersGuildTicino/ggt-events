import { useCallback, useState } from "react";
import { useAuth } from "~/auth/use-auth";
import {
  type EventTimeSlot,
  createEventTimeSlot,
  deleteEventTimeSlot,
  fetchEventTimeSlots,
  updateEventTimeSlot,
} from "~/domain/event-time-slots";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import type { EventTimeSlotFormValue } from "../../components/event-time-slot-form";

//------------------------------------------------------------------------------
// Use Admin Event Time Slots
//------------------------------------------------------------------------------

export default function useAdminEventTimeSlots(eventId?: string) {
  const { user } = useAuth();
  const [createState, setCreateState] = useState<AsyncState>(initial());
  const [deleteError, setDeleteError] = useState("");
  const [deletingTimeSlotId, setDeletingTimeSlotId] = useState<
    EventTimeSlot["id"] | null
  >(null);
  const [editingTimeSlotId, setEditingTimeSlotId] = useState<
    EventTimeSlot["id"] | null
  >(null);
  const [eventTimeSlotsState, setEventTimeSlotsState] =
    useState<AsyncState<EventTimeSlot[]>>(initial());
  const [updateState, setUpdateState] = useState<AsyncState>(initial());

  const loadTimeSlots = useCallback(async () => {
    if (!eventId) return;
    setEventTimeSlotsState(loading());
    const timeSlots = await fetchEventTimeSlots(eventId);
    setEventTimeSlotsState(timeSlots);
  }, [eventId]);

  useAsyncEffect(
    async (isActive) => {
      setEventTimeSlotsState(loading());

      if (!eventId)
        return setEventTimeSlotsState(
          failure("page.admin_event.error.missing_event"),
        );

      const timeSlots = await fetchEventTimeSlots(eventId);
      if (!isActive()) return;
      setEventTimeSlotsState(timeSlots);
    },
    [eventId],
  );

  const createAdminEventTimeSlot = async (value: EventTimeSlotFormValue) => {
    try {
      if (!eventId)
        return setCreateState(failure("page.admin_event.error.missing_event"));

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

  const updateAdminEventTimeSlot = async (
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

  const deleteAdminEventTimeSlot = async (
    timeSlotId: EventTimeSlot["id"],
    confirmed: boolean,
  ) => {
    if (!confirmed) return;

    setDeleteError("");
    setDeletingTimeSlotId(timeSlotId);
    const error = await deleteEventTimeSlot(timeSlotId);
    setDeletingTimeSlotId(null);

    if (error) return setDeleteError(error);
    await loadTimeSlots();
  };

  return {
    createAdminEventTimeSlot,
    createState,
    deleteAdminEventTimeSlot,
    deleteError,
    deletingTimeSlotId,
    editingTimeSlotId,
    eventTimeSlotsState,
    loadTimeSlots,
    setEditingTimeSlotId,
    setUpdateState,
    updateAdminEventTimeSlot,
    updateState,
  };
}
