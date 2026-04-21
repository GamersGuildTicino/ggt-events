import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { useAuth } from "~/auth/use-auth";
import { signOut } from "~/lib/supabase";

//------------------------------------------------------------------------------
// Admin Layout
//------------------------------------------------------------------------------

export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <VStack minH="100vh">
      <HStack justify="space-between" px="6" py="4" w="full">
        <Text fontSize="sm" truncate>
          {user?.email ?? "Admin"}
        </Text>
        <Button onClick={signOut} size="sm" variant="outline">
          Sign out
        </Button>
      </HStack>

      <Outlet />
    </VStack>
  );
}
