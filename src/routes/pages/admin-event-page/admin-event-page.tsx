import {
  Button,
  Grid,
  HStack,
  Heading,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import { isEventOver } from "~/domain/event-time-slots";
import { type Event, updateEvent } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import { toaster } from "~/ui/toaster";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import { createMailtoUrl } from "~/utils/mailto";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import EventDetailsForm, {
  type EventDetailsFormValue,
} from "../../components/event-details-form";
import AdminEventPageHeadingActions from "./admin-event-page-heading-actions";
import AdminEventTablesSection from "./admin-event-tables-section";
import AdminEventTimeSlotsSection from "./admin-event-time-slots-section";
import useAdminEvent from "./use-admin-event";
import useAdminEventEmails from "./use-admin-event-emails";
import useAdminEventTimeSlots from "./use-admin-event-time-slots";

//------------------------------------------------------------------------------
// Admin Event Page
//------------------------------------------------------------------------------

export default function AdminEventPage() {
  const { eventId } = useParams();
  const { t, ti } = useI18n();
  const [saveState, setSaveState] = useState<AsyncState>(initial());
  const { eventState, setEventState } = useAdminEvent(eventId);
  const {
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
  } = useAdminEventTimeSlots(eventId);
  const { eventEmailsState, eventHasEmails } = useAdminEventEmails(eventId);

  const updateAdminEvent = useCallback(
    async (eventDetails: EventDetailsFormValue) => {
      if (!eventState.isSuccess) return;

      try {
        setSaveState(loading());

        const updatedEvent: Event = { ...eventState.data, ...eventDetails };
        const error = await updateEvent(updatedEvent);
        if (error) return setSaveState(failure(error));

        setEventState(success(updatedEvent));
        setSaveState(success(undefined));
        toaster.success({
          description: t("page.admin_event.saved"),
          id: `admin-event-saved-${updatedEvent.id}`,
        });
      } catch (e) {
        console.error(e);
        setSaveState(failure("page.admin_event.error.generic"));
      }
    },
    [eventState, setEventState, t],
  );

  const copyAdminEventEmails = useCallback(async () => {
    if (!eventState.isSuccess || !eventEmailsState.isSuccess) return;

    try {
      await navigator.clipboard.writeText(eventEmailsState.data.join(", "));
      toaster.success({
        description: ti(
          "page.admin_events.copy_emails_success",
          eventState.data.title,
        ),
        id: `admin-event-copy-emails-success-${eventState.data.id}`,
      });
    } catch {
      toaster.error({
        description: t("page.admin_events.copy_emails_error"),
        id: `admin-event-copy-emails-error-${eventState.data.id}`,
      });
    }
  }, [eventEmailsState, eventState, t, ti]);

  const composeAdminEventEmail = useCallback(() => {
    if (!eventState.isSuccess || !eventEmailsState.isSuccess) return;

    try {
      window.location.href = createMailtoUrl({
        bcc: eventEmailsState.data,
        body: ti("page.admin_events.compose_email_body", eventState.data.title),
        subject: ti(
          "page.admin_events.compose_email_subject",
          eventState.data.title,
        ),
      });
    } catch {
      toaster.error({
        description: t("page.admin_events.compose_email_error"),
        id: `admin-event-compose-email-error-${eventState.data.id}`,
      });
    }
  }, [eventEmailsState, eventState, t, ti]);

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

      <HStack align="center" justify="space-between">
        <Heading size="3xl">{t("page.admin_event.heading")}</Heading>

        {eventTimeSlotsState.isSuccess && eventState.isSuccess && (
          <AdminEventPageHeadingActions
            eventHasEmails={eventHasEmails}
            onComposeEmail={composeAdminEventEmail}
            onCopyEmails={copyAdminEventEmails}
            timeSlots={eventTimeSlotsState.data}
          />
        )}
      </HStack>

      {eventState.isLoading && <Spinner />}

      {eventState.hasError && (
        <AppAlert status="error">{t(eventState.error)}</AppAlert>
      )}

      {eventState.isSuccess && (
        <Grid
          alignItems="flex-start"
          gap={4}
          templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) minmax(0, 1fr)" }}
          w="full"
        >
          <VStack align="stretch" gap={4}>
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
                saveState.hasError ?
                  <AppAlert dismissible status="error">
                    {t(saveState.error)}
                  </AppAlert>
                : undefined
              }
              onSubmit={updateAdminEvent}
            />

            <AdminEventTimeSlotsSection
              createAdminEventTimeSlot={createAdminEventTimeSlot}
              createState={createState}
              deleteAdminEventTimeSlot={deleteAdminEventTimeSlot}
              deleteError={deleteError}
              deletingTimeSlotId={deletingTimeSlotId}
              editingTimeSlotId={editingTimeSlotId}
              eventTimeSlotsState={eventTimeSlotsState}
              setEditingTimeSlotId={setEditingTimeSlotId}
              setUpdateState={setUpdateState}
              updateAdminEventTimeSlot={updateAdminEventTimeSlot}
              updateState={updateState}
            />
          </VStack>

          <VStack align="stretch" gap={4} minW={0}>
            {eventTimeSlotsState.isLoading && <Spinner />}

            {eventTimeSlotsState.hasError && (
              <AppAlert status="error">{t(eventTimeSlotsState.error)}</AppAlert>
            )}

            {eventTimeSlotsState.isSuccess &&
              isEventOver(eventTimeSlotsState.data) && (
                <AppAlert status="warning">
                  {t("page.admin_event.event_over_notice")}
                </AppAlert>
              )}

            {eventTimeSlotsState.isSuccess &&
              eventTimeSlotsState.data.length > 0 && (
                <AdminEventTablesSection
                  eventId={eventState.data.id}
                  timeSlots={eventTimeSlotsState.data}
                />
              )}
          </VStack>
        </Grid>
      )}
    </VStack>
  );
}
