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
    <Center minH="100vh" px="6">
      <Heading size="2xl" textAlign="center">
        {title}
      </Heading>
    </Center>
  );
}
