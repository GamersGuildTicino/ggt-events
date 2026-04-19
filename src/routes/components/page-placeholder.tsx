import { Center, Heading } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type PagePlaceholderProps = {
  title: ReactNode;
};

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <Center minH="100vh" px="6">
      <Heading size="2xl" textAlign="center">
        {title}
      </Heading>
    </Center>
  );
}
