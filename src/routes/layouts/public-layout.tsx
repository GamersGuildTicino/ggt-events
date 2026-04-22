import { Center, Flex, VStack } from "@chakra-ui/react";
import { Outlet } from "react-router";

//------------------------------------------------------------------------------
// Public Layout
//------------------------------------------------------------------------------

export default function PublicLayout() {
  return (
    <VStack minH="100vh">
      <Center px={8} py={8} w="full">
        <Flex maxW="72em" w="full">
          <Outlet />
        </Flex>
      </Center>
    </VStack>
  );
}
