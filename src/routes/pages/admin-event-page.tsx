import {
  Alert,
  Button,
  type DateValue,
  Field,
  HStack,
  Heading,
  Input,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { CalendarDate } from "@internationalized/date";
import { useCallback, useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  type EventVisibility,
  useEventVisibilityOptions,
} from "~/domain/enums/event-visibility";
import { type Event, fetchEvent, updateEvent } from "~/domain/events";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import Checkbox from "~/ui/checkbox";
import DatePicker from "~/ui/date-picker";
import Form from "~/ui/form";
import SelectEnum from "~/ui/select-enum";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";

//------------------------------------------------------------------------------
// Admin Event Page
//------------------------------------------------------------------------------

export default function AdminEventPage() {
  const { eventId } = useParams();
  const { t } = useI18n();
  const [eventState, setEventState] = useState<AsyncState<Event>>(initial());
  const [saveState, setSaveState] = useState<AsyncState>(initial());

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

  const handleUpdateEvent = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!eventState.isSuccess) return;

      try {
        setSaveState(loading());

        const formData = new FormData(e.currentTarget);
        const getString = (key: string) =>
          String(formData.get(key) ?? "").trim();

        const title = getString("title");
        const startsAtDate = formData.get("starts-at-date");
        const startsAtTime = formData.get("starts-at-time");
        const startsAt = new Date(`${startsAtDate}T${startsAtTime}`);
        const locationName = getString("location-name");
        const locationAddress = getString("location-address");
        const visibility = formData.get("visibility") as EventVisibility;
        const registrationsOpen = formData.get("registrations-open") === "on";

        const updatedEvent: Event = {
          ...eventState.data,
          locationAddress,
          locationName,
          registrationsOpen,
          startsAt,
          title,
          visibility,
        };

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
        <EventDetailsForm
          event={eventState.data}
          onSubmit={handleUpdateEvent}
          saveState={saveState}
        />
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Event Details Form
//------------------------------------------------------------------------------

function EventDetailsForm({
  event,
  onSubmit,
  saveState,
}: {
  event: Event;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  saveState: AsyncState;
}) {
  const { t } = useI18n();
  const eventVisibilityOptions = useEventVisibilityOptions();

  return (
    <Form
      alignItems="flex-start"
      display="flex"
      flexDirection="column"
      gap={3}
      justifyContent="center"
      onSubmit={onSubmit}
      w="full"
    >
      <Heading size="xl">{t("page.admin_event.details.heading")}</Heading>

      <Field.Root disabled={saveState.isLoading} required>
        <Field.Label>
          {t("page.admin_event.title.label")}
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          defaultValue={event.title}
          name="title"
          pattern="\s*\S.*"
          size="sm"
        />
      </Field.Root>

      <HStack w="full">
        <Field.Root disabled={saveState.isLoading} required>
          <Field.Label>
            {t("page.admin_event.starts_at_date.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <DatePicker
            defaultValue={event.startsAt}
            format={formatDate}
            locale="en-CA"
            name="starts-at-date"
            parse={parseDate}
            placeholder="yyyy-mm-dd"
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={saveState.isLoading} required>
          <Field.Label>
            {t("page.admin_event.starts_at_time.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={formatTime(event.startsAt)}
            name="starts-at-time"
            size="sm"
            type="time"
          />
        </Field.Root>
      </HStack>

      <Field.Root disabled={saveState.isLoading} required>
        <Field.Label>
          {t("page.admin_event.location_name.label")}
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          defaultValue={event.locationName}
          name="location-name"
          pattern="\s*\S.*"
          size="sm"
        />
      </Field.Root>

      <Field.Root disabled={saveState.isLoading}>
        <Field.Label>
          {t("page.admin_event.location_address.label")}
        </Field.Label>
        <Input
          defaultValue={event.locationAddress}
          name="location-address"
          size="sm"
        />
      </Field.Root>

      <Field.Root disabled={saveState.isLoading} required>
        <Field.Label>
          {t("page.admin_event.visibility.label")}
          <Field.RequiredIndicator />
        </Field.Label>
        <SelectEnum<EventVisibility>
          defaultValue={event.visibility}
          name="visibility"
          options={eventVisibilityOptions}
          size="sm"
        />
      </Field.Root>

      <Field.Root disabled={saveState.isLoading} my={2}>
        <Checkbox
          defaultChecked={event.registrationsOpen}
          name="registrations-open"
          size="sm"
        >
          {t("page.admin_event.registrations_open")}
        </Checkbox>
      </Field.Root>

      {saveState.hasError && (
        <Alert.Root status="error">
          <Alert.Description>{t(saveState.error)}</Alert.Description>
        </Alert.Root>
      )}

      {saveState.isSuccess && (
        <Alert.Root status="success">
          <Alert.Description>{t("page.admin_event.saved")}</Alert.Description>
        </Alert.Root>
      )}

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
    </Form>
  );
}

//------------------------------------------------------------------------------
// Format / Parse Date
//------------------------------------------------------------------------------

function formatDate(date: DateValue) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return new CalendarDate(Number(year), Number(month), Number(day));
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}
