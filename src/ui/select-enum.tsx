import { type SelectRootProps as ChakraSelectRootProps } from "@chakra-ui/react";
import Select, { type SelectOption } from "./select";

//------------------------------------------------------------------------------
// Select Enum
//------------------------------------------------------------------------------

export type SelectEnumProps<T> = Omit<
  ChakraSelectRootProps,
  "collection" | "defaultValue" | "multiple" | "onValueChange" | "value"
> & {
  categories?: { id: string; items: SelectOption<T>[]; title: string }[];
  options: SelectOption<T>[];
  placeholder?: string;
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

export default function SelectEnum<T extends string>(
  props: SelectEnumProps<T>,
) {
  return <Select parse={parseEnum} stringify={stringifyEnum} {...props} />;
}

//------------------------------------------------------------------------------
// Parse Enum / Stringify Enum
//------------------------------------------------------------------------------

const parseEnum = <T extends string>(value: string): T => value as T;
const stringifyEnum = <T extends string>(value: T): string => value;
