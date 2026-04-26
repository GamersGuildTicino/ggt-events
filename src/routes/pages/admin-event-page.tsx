import {
  Alert,
  Badge,
  Button,
  Grid,
  HStack,
  Heading,
  Menu as ChakraMenu,
  Portal,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { EllipsisVertical } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import { fetchEventRegistrations } from "~/domain/event-registrations";
import { fetchEventTables } from "~/domain/event-tables";
import {
  type EventTimeSlot,
  fetchEventTimeSlots,
  isEventOver,
} from "~/domain/event-time-slots";
import { type Event, fetchEvent, updateEvent } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import IconButton from "~/ui/icon-button";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import { createMailtoUrl } from "~/utils/mailto";
import AdminBreadcrumb from "../components/admin-breadcrumb";
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
  const { t, ti } = useI18n();
  const [copyError, setCopyError] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [eventState, setEventState] = useState<AsyncState<Event>>(initial());
  const [eventEmailsState, setEventEmailsState] =
    useState<AsyncState<string[]>>(initial());
  const [eventTimeSlotsState, setEventTimeSlotsState] =
    useState<AsyncState<EventTimeSlot[]>>(initial());
  const [saveState, setSaveState] = useState<AsyncState>(initial());
  const eventHasEmails = useMemo(
    () => eventEmailsState.isSuccess && eventEmailsState.data.length > 0,
    [eventEmailsState],
  );

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

  useAsyncEffect(
    async (isActive) => {
      if (!eventId)
        return setEventEmailsState(
          failure("page.admin_event.error.missing_event"),
        );

      setEventEmailsState(loading());

      const eventTables = await fetchEventTables(eventId);
      if (!isActive()) return;
      if (!eventTables.isSuccess)
        return setEventEmailsState(failure(eventTables.error));

      const registrations = await fetchEventRegistrations(
        eventTables.data.map((eventTable) => eventTable.id),
      );
      if (!isActive()) return;
      if (!registrations.isSuccess)
        return setEventEmailsState(failure(registrations.error));

      const emails = [
        ...new Set(registrations.data.map((row) => row.email)),
      ].sort((a, b) => a.localeCompare(b));
      setEventEmailsState(success(emails));
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

  const handleCopyEmails = async () => {
    if (!eventState.isSuccess || !eventEmailsState.isSuccess) return;

    setCopyError("");

    try {
      await navigator.clipboard.writeText(eventEmailsState.data.join(", "));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("page.admin_events.copy_emails_error");
    }
  };

  const handleComposeEmail = () => {
    if (!eventState.isSuccess || !eventEmailsState.isSuccess) return;

    setEmailError("");

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
      setEmailError("page.admin_events.compose_email_error");
    }
  };

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

        <HStack>
          {eventTimeSlotsState.isSuccess &&
            isEventOver(eventTimeSlotsState.data) && (
              <Badge colorPalette="orange" size="lg">
                {t("page.admin_event.event_over")}
              </Badge>
            )}

          <ChakraMenu.Root positioning={{ placement: "bottom-end" }}>
            <ChakraMenu.Trigger asChild>
              <IconButton
                Icon={EllipsisVertical}
                aria-label={t("page.admin_events.more")}
                size="sm"
                variant="ghost"
              />
            </ChakraMenu.Trigger>
            <Portal>
              <ChakraMenu.Positioner>
                <ChakraMenu.Content minW="12rem">
                  <ChakraMenu.Item
                    disabled={!eventHasEmails}
                    onClick={handleComposeEmail}
                    value="compose-email"
                  >
                    {t("page.admin_events.compose_email")}
                  </ChakraMenu.Item>
                  <ChakraMenu.Item
                    disabled={!eventHasEmails}
                    onClick={handleCopyEmails}
                    value="copy-emails"
                  >
                    {t("page.admin_events.copy_emails")}
                  </ChakraMenu.Item>
                </ChakraMenu.Content>
              </ChakraMenu.Positioner>
            </Portal>
          </ChakraMenu.Root>
        </HStack>
      </HStack>

      {eventState.isLoading && <Spinner />}

      {eventState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(eventState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {copyError && (
        <Alert.Root status="error">
          <Alert.Description>{t(copyError)}</Alert.Description>
        </Alert.Root>
      )}

      {emailError && (
        <Alert.Root status="error">
          <Alert.Description>{t(emailError)}</Alert.Description>
        </Alert.Root>
      )}

      {copied && eventState.isSuccess && (
        <Alert.Root status="success">
          <Alert.Description>
            {ti("page.admin_events.copy_emails_success", eventState.data.title)}
          </Alert.Description>
        </Alert.Root>
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
                <>
                  {saveState.hasError && (
                    <Alert.Root status="error">
                      <Alert.Description>
                        {t(saveState.error)}
                      </Alert.Description>
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
          </VStack>

          <VStack align="stretch" gap={4} minW={0}>
            {eventTimeSlotsState.isLoading && <Spinner />}

            {eventTimeSlotsState.hasError && (
              <Alert.Root status="error">
                <Alert.Description>
                  {t(eventTimeSlotsState.error)}
                </Alert.Description>
              </Alert.Root>
            )}

            {eventTimeSlotsState.isSuccess &&
              isEventOver(eventTimeSlotsState.data) && (
                <Alert.Root status="warning">
                  <Alert.Description>
                    {t("page.admin_event.event_over_notice")}
                  </Alert.Description>
                </Alert.Root>
              )}

            {eventTimeSlotsState.isSuccess && (
              <EventTablesSection
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
