import { Center, Spinner } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Home Upcoming Events Loading
//------------------------------------------------------------------------------

export default function HomeUpcomingEventsLoading() {
  return (
    <Center flex={1} w="full">
      <Spinner />
    </Center>
  );
}
