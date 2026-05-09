import { Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Eyebrow
//------------------------------------------------------------------------------

export type EyebrowProps = {
  children: ReactNode;
};

export default function Eyebrow({ children }: EyebrowProps) {
  return (
    <Text
      color="fg.muted"
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="0.08em"
      textTransform="uppercase"
    >
      {children}
    </Text>
  );
}
