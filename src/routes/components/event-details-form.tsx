import {
  type DateValue,
  Field,
  HStack,
  Heading,
  Input,
} from "@chakra-ui/react";
import { CalendarDate } from "@internationalized/date";
import type { ReactNode } from "react";
import {
  type EventVisibility,
  useEventVisibilityOptions,
} from "~/domain/enums/event-visibility";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import Checkbox from "~/ui/checkbox";
import DatePicker from "~/ui/date-picker";
import Form from "~/ui/form";
import SelectEnum from "~/ui/select-enum";

//------------------------------------------------------------------------------
// Event Details Form Value
//------------------------------------------------------------------------------

export type EventDetailsFormValue = Pick<
  Event,
  | "locationAddress"
  | "locationName"
  | "registrationsOpen"
  | "startsAt"
  | "title"
  | "visibility"
>;

//------------------------------------------------------------------------------
// Event Details Form
//------------------------------------------------------------------------------

export type EventDetailsFormProps = {
  actions: ReactNode;
  disabled?: boolean;
  initialValue?: EventDetailsFormValue;
  message?: ReactNode;
  onSubmit: (
    value: EventDetailsFormValue,
    e: React.SubmitEvent<HTMLFormElement>,
  ) => void;
  title: string;
};

export default function EventDetailsForm({
  actions,
  disabled,
  initialValue,
  message,
  onSubmit,
  title,
}: EventDetailsFormProps) {
  const { t } = useI18n();
  const eventVisibilityOptions = useEventVisibilityOptions();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(eventDetailsFormValueFromForm(e.currentTarget), e);
  };

  return (
    <Form
      alignItems="flex-start"
      display="flex"
      flexDirection="column"
      gap={3}
      justifyContent="center"
      onSubmit={handleSubmit}
      w="full"
    >
      <Heading size="xl">{title}</Heading>

      <Field.Root disabled={disabled} required>
        <Field.Label>
          {t("form.event_details.title.label")}
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          defaultValue={initialValue?.title}
          name="title"
          pattern="\s*\S.*"
          size="sm"
        />
      </Field.Root>

      <HStack w="full">
        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_details.starts_at_date.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <DatePicker
            defaultValue={initialValue?.startsAt}
            format={formatDate}
            locale="en-CA" // This allows using - in the input field
            name="starts-at-date"
            parse={parseDate}
            placeholder="yyyy-mm-dd"
            size="sm"
          />
        </Field.Root>

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_details.starts_at_time.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={
              initialValue ? formatTime(initialValue.startsAt) : undefined
            }
            name="starts-at-time"
            size="sm"
            type="time"
          />
        </Field.Root>
      </HStack>

      <Field.Root disabled={disabled} required>
        <Field.Label>
          {t("form.event_details.location_name.label")}
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          defaultValue={initialValue?.locationName}
          name="location-name"
          pattern="\s*\S.*"
          size="sm"
        />
      </Field.Root>

      <Field.Root disabled={disabled}>
        <Field.Label>
          {t("form.event_details.location_address.label")}
        </Field.Label>
        <Input
          defaultValue={initialValue?.locationAddress}
          name="location-address"
          size="sm"
        />
      </Field.Root>

      <Field.Root disabled={disabled} required>
        <Field.Label>
          {t("form.event_details.visibility.label")}
          <Field.RequiredIndicator />
        </Field.Label>
        <SelectEnum<EventVisibility>
          defaultValue={initialValue?.visibility ?? "public"}
          name="visibility"
          options={eventVisibilityOptions}
          size="sm"
        />
      </Field.Root>

      <Field.Root disabled={disabled} my={2}>
        <Checkbox
          defaultChecked={initialValue?.registrationsOpen}
          name="registrations-open"
          size="sm"
        >
          {t("form.event_details.registrations_open")}
        </Checkbox>
      </Field.Root>

      {message}

      {actions}
    </Form>
  );
}

//------------------------------------------------------------------------------
// Event Details Form Value From Form
//------------------------------------------------------------------------------

function eventDetailsFormValueFromForm(
  form: HTMLFormElement,
): EventDetailsFormValue {
  const formData = new FormData(form);
  const getString = (key: string) => String(formData.get(key) ?? "").trim();

  const startsAtDate = formData.get("starts-at-date");
  const startsAtTime = formData.get("starts-at-time");

  return {
    locationAddress: getString("location-address"),
    locationName: getString("location-name"),
    registrationsOpen: formData.get("registrations-open") === "on",
    startsAt: new Date(`${startsAtDate}T${startsAtTime}`),
    title: getString("title"),
    visibility: formData.get("visibility") as EventVisibility,
  };
}

//------------------------------------------------------------------------------
// Format Date
//------------------------------------------------------------------------------

function formatDate(date: DateValue) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

//------------------------------------------------------------------------------
// Parse Date
//------------------------------------------------------------------------------

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return new CalendarDate(Number(year), Number(month), Number(day));
}

//------------------------------------------------------------------------------
// Format Time
//------------------------------------------------------------------------------

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}
