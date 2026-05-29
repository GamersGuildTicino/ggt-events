import { Center, Flex, VStack } from "@chakra-ui/react";
import { Outlet } from "react-router";
import PublicFooter from "./public-footer";

//------------------------------------------------------------------------------
// Public Layout
//------------------------------------------------------------------------------

export default function PublicLayout() {
  return (
    <VStack backgroundColor="publicPageBg" gap={0} minH="100vh">
      <Flex flex="1" justify="center" p={{ base: 4, md: 8 }} w="full">
        <Flex maxW="72em" w="full">
          <Outlet />
        </Flex>
      </Flex>

      <Center bg="publicFooterBg" px={{ base: 4, md: 8 }} w="full">
        <Flex maxW="72em" w="full">
          <PublicFooter />
        </Flex>
      </Center>
    </VStack>
  );
}
