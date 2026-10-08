import { Center, Flex, VStack } from "@chakra-ui/react";
import { Outlet } from "react-router";
import PublicFooter from "./public-footer";

export default function PublicEventLayout() {
  return (
    <VStack backgroundColor="ggt.page.bg" gap={0} minH="100vh">
      <Flex flex="1" w="full">
        <Outlet />
      </Flex>

      <Center bg="ggt.footer.bg" px={{ base: 4, md: 8 }} w="full">
        <Flex maxW="72em" w="full">
          <PublicFooter />
        </Flex>
      </Center>
    </VStack>
  );
}
