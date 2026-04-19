import {
  IconButton as ChakraIconButton,
  type IconButtonProps as ChakraIconButtonProps,
  createIcon,
} from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

//------------------------------------------------------------------------------
// Icon Button
//------------------------------------------------------------------------------

export type IconButtonProps = Omit<ChakraIconButtonProps, "children"> & {
  Icon: LucideIcon | ReturnType<typeof createIcon>;
};

export default function IconButton({ Icon, ...rest }: IconButtonProps) {
  return (
    <ChakraIconButton rounded="full" {...rest}>
      <Icon />
    </ChakraIconButton>
  );
}
