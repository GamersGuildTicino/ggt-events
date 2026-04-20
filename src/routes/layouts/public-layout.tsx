import { VStack } from "@chakra-ui/react";
import { Outlet } from "react-router";

//------------------------------------------------------------------------------
// Public Layout
//------------------------------------------------------------------------------

export default function PublicLayout() {
  return (
    <VStack minH="100vh">
      <Outlet />
    </VStack>
  );
}
