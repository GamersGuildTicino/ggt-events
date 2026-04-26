import { Card, Field, Heading, Input } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useCallback } from "react";
import {
  type EventVisibility,
  useEventVisibilityOptions,
} from "~/domain/enums/event-visibility";
import type { Event } from "~/domain/events";
import useI18n from "~/i18n/use-i18n";
import Checkbox from "~/ui/checkbox";
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
    locationAddress: getString("location-address"),
    locationName: getString("location-name"),
    registrationsOpen: formData.get("registrations-open") === "on",
    title: getString("title"),
    visibility: formData.get("visibility") as EventVisibility,
  };
}
