import { type DateValue, Field, HStack, Input } from "@chakra-ui/react";
import { CalendarDate } from "@internationalized/date";
import type { ReactNode } from "react";
import type { EventTimeSlot } from "~/domain/event-time-slots";
import useI18n from "~/i18n/use-i18n";
import DatePicker from "~/ui/date-picker";
import Form from "~/ui/form";

//------------------------------------------------------------------------------
// Event Time Slot Form Value
//------------------------------------------------------------------------------

export type EventTimeSlotFormValue = Pick<EventTimeSlot, "endsAt" | "startsAt">;

//------------------------------------------------------------------------------
// Event Time Slot Form
//------------------------------------------------------------------------------

export type EventTimeSlotFormProps = {
  actions: ReactNode;
  disabled?: boolean;
  initialValue?: EventTimeSlotFormValue;
  message?: ReactNode;
  onSubmit: (
    value: EventTimeSlotFormValue,
    e: React.SubmitEvent<HTMLFormElement>,
  ) => void;
};

export default function EventTimeSlotForm({
  actions,
  disabled,
  initialValue,
  message,
  onSubmit,
}: EventTimeSlotFormProps) {
  const { t } = useI18n();

  const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(eventTimeSlotFormValueFromForm(e.currentTarget), e);
  };

  return (
    <Form
      alignItems="flex-start"
      display="flex"
      flexDirection="column"
      gap={3}
      onSubmit={submit}
      w="full"
    >
      <Field.Root disabled={disabled} required>
        <Field.Label>
          {t("form.event_time_slot.date.label")}
          <Field.RequiredIndicator />
        </Field.Label>
        <DatePicker
          defaultValue={initialValue?.startsAt}
          format={formatDate}
          locale="en-CA"
          name="date"
          parse={parseDate}
          placeholder="yyyy-mm-dd"
          size="sm"
        />
      </Field.Root>

      <HStack w="full">
        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_time_slot.starts_at_time.label")}
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

        <Field.Root disabled={disabled} required>
          <Field.Label>
            {t("form.event_time_slot.ends_at_time.label")}
            <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={
              initialValue ? formatTime(initialValue.endsAt) : undefined
            }
            name="ends-at-time"
            size="sm"
            type="time"
          />
        </Field.Root>
      </HStack>

      {message}

      <HStack>{actions}</HStack>
    </Form>
  );
}

//------------------------------------------------------------------------------
// Event Time Slot Form Value From Form
//------------------------------------------------------------------------------

function eventTimeSlotFormValueFromForm(
  form: HTMLFormElement,
): EventTimeSlotFormValue {
  const formData = new FormData(form);
  const date = formData.get("date");
  const startsAtTime = formData.get("starts-at-time");
  const endsAtTime = formData.get("ends-at-time");

  return {
    endsAt: new Date(`${date}T${endsAtTime}`),
    startsAt: new Date(`${date}T${startsAtTime}`),
  };
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
