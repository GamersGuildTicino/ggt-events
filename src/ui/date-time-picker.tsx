"use client";

import {
  Button,
  DatePicker,
  Input,
  Portal,
  useControllableState,
} from "@chakra-ui/react";
import {
  CalendarDateTime,
  DateFormatter,
  type DateValue,
} from "@internationalized/date";
import type { ComponentProps, ReactNode } from "react";
import { useCallback, useMemo } from "react";
import { LuCalendar } from "react-icons/lu";

//------------------------------------------------------------------------------
// Date Time Picker
//------------------------------------------------------------------------------

const formatter = new DateFormatter("en-GB", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  year: "numeric",
});

export type DateTimePickerProps = Omit<
  ComponentProps<typeof DatePicker.Root>,
  "defaultValue" | "onValueChange" | "value"
> & {
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: ReactNode;
  value?: Date | null;
};

export default function DateTimePicker({
  defaultValue = null,
  onValueChange,
  placeholder,
  value: valueProp,
  ...rest
}: DateTimePickerProps) {
  const [value, setValue] = useControllableState<Date | null>({
    defaultValue,
    onChange: onValueChange,
    value: valueProp,
  });

  const pickerValue = useMemo(
    () => (value === null ? [] : [toCalendarDateTime(value)]),
    [value],
  );

  const timeValue =
    value === null ? "" : (
      `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    );

  const handleDateChange = useCallback(
    (details: { value: DateValue[] }) => {
      const nextDate = details.value[0];
      if (!nextDate) return setValue(null);

      const currentValue = value ?? new Date();
      const nextValue = new Date(
        nextDate.year,
        nextDate.month - 1,
        nextDate.day,
        currentValue.getHours(),
        currentValue.getMinutes(),
        currentValue.getSeconds(),
        currentValue.getMilliseconds(),
      );

      setValue(nextValue);
    },
    [setValue, value],
  );

  const handleTimeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const [hours, minutes] = event.currentTarget.value.split(":").map(Number);

      if (
        hours === undefined ||
        minutes === undefined ||
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
      )
        return;

      const currentValue = value ?? new Date();
      const nextValue = new Date(currentValue);

      nextValue.setHours(
        hours,
        minutes,
        currentValue.getSeconds(),
        currentValue.getMilliseconds(),
      );
      setValue(nextValue);
    },
    [setValue, value],
  );

  return (
    <DatePicker.Root
      closeOnSelect={false}
      onValueChange={handleDateChange}
      selectionMode="single"
      value={pickerValue}
      {...rest}
    >
      <DatePicker.Control>
        <DatePicker.Trigger asChild unstyled>
          <Button justifyContent="space-between" variant="outline" width="full">
            {value === null ? placeholder : formatter.format(value)}
            <LuCalendar />
          </Button>
        </DatePicker.Trigger>
      </DatePicker.Control>

      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day">
              <DatePicker.Header />
              <DatePicker.DayTable />
              <Input
                onChange={handleTimeChange}
                type="time"
                value={timeValue}
              />
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  );
}

//------------------------------------------------------------------------------
// To Calendar Date Time
//------------------------------------------------------------------------------

function toCalendarDateTime(date: Date) {
  return new CalendarDateTime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}
