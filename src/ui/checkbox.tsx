import {
  Checkbox as ChakraCheckbox,
  type CheckboxRootProps as ChakraCheckboxRootProps,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Checkbox
//------------------------------------------------------------------------------

export type CheckboxProps = ChakraCheckboxRootProps & {
  children?: ReactNode;
};

export default function Checkbox({ children, ...rest }: CheckboxProps) {
  return (
    <ChakraCheckbox.Root {...rest}>
      <ChakraCheckbox.HiddenInput />
      <ChakraCheckbox.Control />
      {children && <ChakraCheckbox.Label>{children}</ChakraCheckbox.Label>}
    </ChakraCheckbox.Root>
  );
}
