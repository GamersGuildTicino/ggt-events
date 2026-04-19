import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { Outlet } from "react-router";
import { useAuth } from "~/auth/use-auth";

export default function AdminLayout() {
  const { signOut, user } = useAuth();

  return (
    <Box minH="100vh">
      <HStack justify="space-between" px="6" py="4">
        <Text fontSize="sm" truncate>
          {user?.email ?? "Admin"}
        </Text>
        <Button onClick={signOut} size="sm" variant="outline">
          Sign out
        </Button>
      </HStack>
      <Outlet />
    </Box>
  );
}
