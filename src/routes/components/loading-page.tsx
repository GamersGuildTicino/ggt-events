import { Center, Spinner } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Loading Page
//------------------------------------------------------------------------------

export default function LoadingPage() {
  return (
    <Center minH="100vh">
      <Spinner />
    </Center>
  );
}
