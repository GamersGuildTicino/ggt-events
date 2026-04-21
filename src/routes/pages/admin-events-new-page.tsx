import {
  Alert,
  Button,
  type DateValue,
  Field,
  HStack,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import { CalendarDate } from "@internationalized/date";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/auth/use-auth";
import {
  type EventVisibility,
  useEventVisibilityOptions,
} from "~/domain/enums/event-visibility";
import { createEvent } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import Checkbox from "~/ui/checkbox";
import DatePicker from "~/ui/date-picker";
import Form from "~/ui/form";
import SelectEnum from "~/ui/select-enum";
import { failure, initial, loading, success } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Events New Page
//------------------------------------------------------------------------------

export default function AdminEventsNewPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createEventState, setCreateEventState] = useState(initial());
  const eventVisibilityOptions = useEventVisibilityOptions();

  const handleCreateEvent = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        if (user === null)
          return setCreateEventState(
            failure("page.admin_events_new.error.missing_user"),
          );

        setCreateEventState(loading());

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

        const error = await createEvent({
          createdBy: user.id,
          locationAddress,
          locationName,
          registrationsOpen,
          startsAt,
          title,
          visibility,
        });

        if (error) return setCreateEventState(failure(error));

        setCreateEventState(success(undefined));
        navigate("/admin/events");
      } catch (e) {
        console.log(e);
        setCreateEventState(failure("page.admin_events_new.error.generic"));
      }
    },
    [navigate, user],
  );

  return (
    <Form
      display="flex"
      justifyContent="center"
      onSubmit={handleCreateEvent}
      w="full"
    >
      <VStack align="flex-start" gap={3} maxW="20em" p={1} w="full">
        <Heading size="3xl">{t("page.admin_events_new.heading")}</Heading>

        <Field.Root disabled={createEventState.isLoading} required>
          <Field.Label>
            {t("page.admin_events_new.title.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input name="title" pattern="\s*\S.*" size="sm" />
        </Field.Root>

        <HStack w="full">
          <Field.Root disabled={createEventState.isLoading} required>
            <Field.Label>
              {t("page.admin_events_new.starts_at_date.label")}
              <Field.RequiredIndicator />
            </Field.Label>
            <DatePicker
              format={formatDate}
              locale="en-CA" // This allows using - in the input field
              name="starts-at-date"
              parse={parseDate}
              placeholder="yyyy-mm-dd"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={createEventState.isLoading} required>
            <Field.Label>
              {t("page.admin_events_new.starts_at_time.label")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input name="starts-at-time" type="time" />
          </Field.Root>
        </HStack>

        <Field.Root disabled={createEventState.isLoading} required>
          <Field.Label>
            {t("page.admin_events_new.location_name.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input name="location-name" pattern="\s*\S.*" size="sm" />
        </Field.Root>

        <Field.Root disabled={createEventState.isLoading}>
          <Field.Label>
            {t("page.admin_events_new.location_address.label")}
          </Field.Label>
          <Input name="location-address" size="sm" />
        </Field.Root>

        <Field.Root disabled={createEventState.isLoading} required>
          <Field.Label>
            {t("page.admin_events_new.visibility.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <SelectEnum<EventVisibility>
            defaultValue="public"
            name="visibility"
            options={eventVisibilityOptions}
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={createEventState.isLoading}>
          <Checkbox name="registrations-open" size="sm">
            {t("page.admin_events_new.registrations_open")}
          </Checkbox>
        </Field.Root>

        {createEventState.hasError && (
          <Alert.Root status="error">
            <Alert.Description>{t(createEventState.error)}</Alert.Description>
          </Alert.Root>
        )}

        <Button loading={createEventState.isLoading} size="sm" type="submit">
          {t("page.admin_events_new.create")}
        </Button>
      </VStack>
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
