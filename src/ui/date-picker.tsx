"use client";

import {
  DatePicker as ChakraDatePicker,
  Portal,
  useControllableState,
  useFieldContext,
} from "@chakra-ui/react";
import { CalendarDate, type DateValue } from "@internationalized/date";
import type { ComponentProps } from "react";
import { useCallback, useMemo } from "react";
import { LuCalendar } from "react-icons/lu";

//------------------------------------------------------------------------------
// Date Picker
//------------------------------------------------------------------------------

export type DatePickerProps = Omit<
  ComponentProps<typeof ChakraDatePicker.Root>,
  "defaultValue" | "onValueChange" | "selectionMode" | "value"
> & {
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  placeholder?: string;
  value?: Date | null;
};

export default function DatePicker({
  defaultValue = null,
  disabled,
  invalid,
  onValueChange,
  placeholder,
  readOnly,
  required,
  value: valueProp,
  ...rest
}: DatePickerProps) {
  const field = useFieldContext();
  const rootDisabled = disabled ?? field?.disabled;
  const rootInvalid = invalid ?? field?.invalid;
  const rootReadOnly = readOnly ?? field?.readOnly;
  const rootRequired = required ?? field?.required;

  const [value, setValue] = useControllableState<Date | null>({
    defaultValue,
    onChange: onValueChange,
    value: valueProp,
  });

  const pickerValue = useMemo(
    () => (value === null ? [] : [toCalendarDate(value)]),
    [value],
  );

  const handleValueChange = useCallback(
    (details: { value: DateValue[] }) => {
      const nextDate = details.value[0];
      if (!nextDate) return setValue(null);

      setValue(new Date(nextDate.year, nextDate.month - 1, nextDate.day));
    },
    [setValue],
  );

  return (
    <ChakraDatePicker.Root
      disabled={rootDisabled}
      invalid={rootInvalid}
      onValueChange={handleValueChange}
      readOnly={rootReadOnly}
      required={rootRequired}
      selectionMode="single"
      value={pickerValue}
      {...rest}
    >
      <ChakraDatePicker.Control>
        <ChakraDatePicker.Input placeholder={placeholder} />
        <ChakraDatePicker.IndicatorGroup>
          <ChakraDatePicker.Trigger>
            <LuCalendar />
          </ChakraDatePicker.Trigger>
        </ChakraDatePicker.IndicatorGroup>
      </ChakraDatePicker.Control>

      <Portal>
        <ChakraDatePicker.Positioner>
          <ChakraDatePicker.Content>
            <ChakraDatePicker.View view="day">
              <ChakraDatePicker.Header />
              <ChakraDatePicker.DayTable />
            </ChakraDatePicker.View>
            <ChakraDatePicker.View view="month">
              <ChakraDatePicker.Header />
              <ChakraDatePicker.MonthTable />
            </ChakraDatePicker.View>
            <ChakraDatePicker.View view="year">
              <ChakraDatePicker.Header />
              <ChakraDatePicker.YearTable />
            </ChakraDatePicker.View>
          </ChakraDatePicker.Content>
        </ChakraDatePicker.Positioner>
      </Portal>
    </ChakraDatePicker.Root>
  );
}

//------------------------------------------------------------------------------
// To Calendar Date
//------------------------------------------------------------------------------

function toCalendarDate(date: Date) {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}
