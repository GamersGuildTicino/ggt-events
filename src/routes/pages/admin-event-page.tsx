import {
  Alert,
  Button,
  HStack,
  Heading,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  type EventTimeSlot,
  fetchEventTimeSlots,
} from "~/domain/event-time-slots";
import { type Event, fetchEvent, updateEvent } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";
import AdminContentColumns from "../components/admin-content-columns";
import EventDetailsForm, {
  type EventDetailsFormValue,
} from "../components/event-details-form";
import EventTablesSection from "../components/event-tables-section";
import EventTimeSlotsSection from "../components/event-time-slots-section";

//------------------------------------------------------------------------------
// Admin Event Page
//------------------------------------------------------------------------------

export default function AdminEventPage() {
  const { eventId } = useParams();
  const { t } = useI18n();
  const [eventState, setEventState] = useState<AsyncState<Event>>(initial());
  const [eventTimeSlotsState, setEventTimeSlotsState] =
    useState<AsyncState<EventTimeSlot[]>>(initial());
  const [saveState, setSaveState] = useState<AsyncState>(initial());

  const loadTimeSlots = useCallback(async () => {
    if (!eventId) return;
    setEventTimeSlotsState(loading());
    const timeSlots = await fetchEventTimeSlots(eventId);
    setEventTimeSlotsState(timeSlots);
  }, [eventId]);

  useAsyncEffect(
    async (isActive) => {
      setEventState(loading());

      if (!eventId)
        return setEventState(failure("page.admin_event.error.missing_event"));

      const event = await fetchEvent(eventId);
      if (!isActive()) return;
      setEventState(event);
    },
    [eventId],
  );

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

  const handleUpdateEvent = useCallback(
    async (eventDetails: EventDetailsFormValue) => {
      if (!eventState.isSuccess) return;

      try {
        setSaveState(loading());

        const updatedEvent: Event = { ...eventState.data, ...eventDetails };

        const error = await updateEvent(updatedEvent);
        if (error) return setSaveState(failure(error));

        setEventState(success(updatedEvent));
        setSaveState(success(undefined));
      } catch (e) {
        console.error(e);
        setSaveState(failure("page.admin_event.error.generic"));
      }
    },
    [eventState],
  );

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          { label: t("page.admin_event.breadcrumb.admin"), to: "/admin" },
          {
            label: t("page.admin_event.breadcrumb.events"),
            to: "/admin/events",
          },
          { label: t("page.admin_event.breadcrumb.event") },
        ]}
      />

      <Heading size="3xl">{t("page.admin_event.heading")}</Heading>

      {eventState.isLoading && <Spinner />}

      {eventState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(eventState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {eventState.isSuccess && (
        <AdminContentColumns>
          <EventDetailsForm
            actions={
              <HStack>
                <Button loading={saveState.isLoading} size="sm" type="submit">
                  {t("page.admin_event.save")}
                </Button>

                <Button asChild size="sm" variant="outline">
                  <RouterLink to="/admin/events">
                    {t("page.admin_event.back_to_events")}
                  </RouterLink>
                </Button>
              </HStack>
            }
            disabled={saveState.isLoading}
            initialValue={eventState.data}
            message={
              <>
                {saveState.hasError && (
                  <Alert.Root status="error">
                    <Alert.Description>{t(saveState.error)}</Alert.Description>
                  </Alert.Root>
                )}

                {saveState.isSuccess && (
                  <Alert.Root status="success">
                    <Alert.Description>
                      {t("page.admin_event.saved")}
                    </Alert.Description>
                  </Alert.Root>
                )}
              </>
            }
            onSubmit={handleUpdateEvent}
          />

          <EventTimeSlotsSection
            eventId={eventState.data.id}
            onChange={loadTimeSlots}
          />

          {eventTimeSlotsState.isLoading && <Spinner />}

          {eventTimeSlotsState.hasError && (
            <Alert.Root status="error">
              <Alert.Description>
                {t(eventTimeSlotsState.error)}
              </Alert.Description>
            </Alert.Root>
          )}

          {eventTimeSlotsState.isSuccess && (
            <EventTablesSection
              eventId={eventState.data.id}
              timeSlots={eventTimeSlotsState.data}
            />
          )}
        </AdminContentColumns>
      )}
    </VStack>
  );
}
