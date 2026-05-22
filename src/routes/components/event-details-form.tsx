import {
  Card,
  Field,
  HStack,
  Heading,
  Input,
  Textarea,
} from "@chakra-ui/react";
import type { DateValue } from "@chakra-ui/react";
import { CalendarDate } from "@internationalized/date";
import type { ReactNode } from "react";
import { useCallback } from "react";
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
  | "description"
  | "imageUrl"
  | "locationAddress"
  | "locationName"
  | "registrationsOpenAt"
  | "registrationsOpen"
  | "shortDescription"
  | "slug"
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
};

export default function EventDetailsForm({
  actions,
  disabled,
  initialValue,
  message,
  onSubmit,
}: EventDetailsFormProps) {
  const { t } = useI18n();
  const eventVisibilityOptions = useEventVisibilityOptions();
  const submitEventDetailsForm = useCallback(
    (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(eventDetailsFormValueFromForm(e.currentTarget), e);
    },
    [onSubmit],
  );

  return (
    <Card.Root>
      <Card.Body>
        <Form
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
          gap={3}
          justifyContent="center"
          onSubmit={submitEventDetailsForm}
          w="full"
        >
          <Heading size="md">{t("form.event_details.heading")}</Heading>

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

          <Field.Root disabled={disabled} required>
            <Field.Label>
              {t("form.event_details.slug.label")}
              <Field.RequiredIndicator />
            </Field.Label>
            <Input defaultValue={initialValue?.slug} name="slug" size="sm" />
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>
              {t("form.event_details.short_description.label")}
            </Field.Label>
            <Input
              defaultValue={initialValue?.shortDescription}
              name="short-description"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>
              {t("form.event_details.description.label")}
            </Field.Label>
            <Textarea
              defaultValue={initialValue?.description}
              name="description"
              size="sm"
            />
          </Field.Root>

          <Field.Root disabled={disabled}>
            <Field.Label>{t("form.event_details.image_url.label")}</Field.Label>
            <Input
              defaultValue={initialValue?.imageUrl}
              name="image-url"
              size="sm"
            />
          </Field.Root>

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

          <HStack w="full">
            <Field.Root disabled={disabled} required>
              <Field.Label>
                {t("form.event_details.registrations_open_at.label")}
                <Field.RequiredIndicator />
              </Field.Label>
              <DatePicker
                defaultValue={
                  initialValue?.registrationsOpenAt ??
                  defaultRegistrationOpeningDate()
                }
                format={formatDate}
                locale="en-CA"
                name="registrations-open-at-date"
                parse={parseDate}
                placeholder="yyyy-mm-dd"
                size="sm"
              />
            </Field.Root>

            <Field.Root disabled={disabled} required>
              <Field.Label>
                {t("form.event_details.registrations_open_at_time.label")}
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                defaultValue={formatTime(
                  initialValue?.registrationsOpenAt ??
                    defaultRegistrationOpeningDate(),
                )}
                name="registrations-open-at-time"
                size="sm"
                type="time"
              />
            </Field.Root>
          </HStack>

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
      </Card.Body>
    </Card.Root>
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

  return {
    description: getString("description"),
    imageUrl: getString("image-url"),
    locationAddress: getString("location-address"),
    locationName: getString("location-name"),
    registrationsOpen: formData.get("registrations-open") === "on",
    registrationsOpenAt: getDateTime(
      formData,
      "registrations-open-at-date",
      "registrations-open-at-time",
    ),
    shortDescription: getString("short-description"),
    slug: normalizeSlug(getString("slug")),
    title: getString("title"),
    visibility: formData.get("visibility") as EventVisibility,
  };
}

//------------------------------------------------------------------------------
// Get Date Time
//------------------------------------------------------------------------------

function getDateTime(formData: FormData, dateKey: string, timeKey: string) {
  const date = String(formData.get(dateKey) ?? "").trim();
  const time = String(formData.get(timeKey) ?? "").trim();
  if (!date || !time) return defaultRegistrationOpeningDate();
  return new Date(`${date}T${time}`);
}

//------------------------------------------------------------------------------
// Default Registration Opening Date
//------------------------------------------------------------------------------

function defaultRegistrationOpeningDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  date.setHours(18, 0, 0, 0);
  return date;
}

//------------------------------------------------------------------------------
// Format Date
//------------------------------------------------------------------------------

function formatDate(date: DateValue) {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

//------------------------------------------------------------------------------
// Format Time
//------------------------------------------------------------------------------

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
// Normalize Slug
//------------------------------------------------------------------------------

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "");
}
