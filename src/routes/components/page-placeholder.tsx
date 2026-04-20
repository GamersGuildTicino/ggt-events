import { Center, Heading } from "@chakra-ui/react";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Page Placeholder
//------------------------------------------------------------------------------

export type PagePlaceholderProps = {
  title: ReactNode;
};

export default function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <Center flex={1} px="6">
      <Heading size="2xl" textAlign="center">
        {title}
      </Heading>
    </Center>
  );
}
