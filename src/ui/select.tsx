import {
  Portal,
  Select as ChakraSelect,
  type SelectRootProps as ChakraSelectRootProps,
  useControllableState,
  useListCollection,
} from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";

//------------------------------------------------------------------------------
// Select
//------------------------------------------------------------------------------

export type SelectOption<T> = { label: string; value: T };

export type SelectProps<T> = Omit<
  ChakraSelectRootProps,
  "collection" | "defaultValue" | "multiple" | "onValueChange" | "value"
> & {
  categories?: { id: string; items: SelectOption<T>[]; title: string }[];
  options: SelectOption<T>[];
  parse: (value: string) => T;
  placeholder?: string;
  stringify: (value: T) => string;
  withinDialog?: boolean;
} & (
    | {
        defaultValue?: T;
        multiple?: false;
        onValueChange?: (value: T) => void;
        value?: T;
      }
    | {
        defaultValue?: T[];
        multiple: true;
        onValueChange?: (value: T[]) => void;
        value?: T[];
      }
  );

export default function Select<T>({
  categories,
  defaultValue,
  multiple,
  onValueChange,
  options,
  parse,
  placeholder,
  stringify,
  value,
  withinDialog,
  ...rest
}: SelectProps<T>) {
  const stringifiedOptions = useMemo(
    () => options.map((o) => ({ ...o, value: stringify(o.value) })),
    [options, stringify],
  );

  const stringifiedCategories = useMemo(
    () =>
      categories?.map(({ id, items, title }) => ({
        id,
        items: items.map((item) => ({ ...item, value: stringify(item.value) })),
        title,
      })),
    [categories, stringify],
  );

  const { collection, set } = useListCollection({
    initialItems: stringifiedOptions,
  });

  useLayoutEffect(
    () => set(stringifiedOptions),
    [options, set, stringifiedOptions],
  );

  const [selectedValue, setSelectedValue] = useControllableState<string[]>({
    defaultValue:
      defaultValue === undefined ? undefined
      : multiple ? defaultValue.map(stringify)
      : [stringify(defaultValue)],
    onChange:
      onValueChange === undefined ? undefined : (
        (nextValue) => {
          if (multiple) {
            onValueChange(nextValue.map(parse));
            return;
          }

          const first = nextValue[0];
          if (first !== undefined) onValueChange(parse(first));
        }
      ),
    value:
      value === undefined ? undefined
      : multiple ? value.map(stringify)
      : [stringify(value)],
  });

  const content = (
    <ChakraSelect.Positioner>
      <ChakraSelect.Content>
        {stringifiedCategories ?
          stringifiedCategories.map(({ id, items, title }) => (
            <ChakraSelect.ItemGroup key={id}>
              <ChakraSelect.ItemGroupLabel>{title}</ChakraSelect.ItemGroupLabel>
              {items.map((item) => (
                <ChakraSelect.Item item={item} key={item.value}>
                  {item.label}
                  <ChakraSelect.ItemIndicator />
                </ChakraSelect.Item>
              ))}
            </ChakraSelect.ItemGroup>
          ))
        : collection.items.map((option) => (
            <ChakraSelect.Item item={option} key={option.value}>
              {option.label}
              <ChakraSelect.ItemIndicator />
            </ChakraSelect.Item>
          ))
        }
      </ChakraSelect.Content>
    </ChakraSelect.Positioner>
  );

  return (
    <ChakraSelect.Root
      collection={collection}
      multiple={multiple}
      onValueChange={(e) => setSelectedValue(e.value)}
      value={selectedValue}
      {...rest}
    >
      <ChakraSelect.HiddenSelect aria-labelledby="" />
      <ChakraSelect.Control>
        <ChakraSelect.Trigger>
          <ChakraSelect.ValueText placeholder={placeholder} />
        </ChakraSelect.Trigger>
        <ChakraSelect.IndicatorGroup>
          <ChakraSelect.Indicator />
        </ChakraSelect.IndicatorGroup>
      </ChakraSelect.Control>
      {withinDialog ? content : <Portal>{content}</Portal>}
    </ChakraSelect.Root>
  );
}
