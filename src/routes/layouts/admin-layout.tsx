import { Center, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { LogOutIcon } from "lucide-react";
import { Outlet } from "react-router";
import { useAuth } from "~/auth/use-auth";
import LocaleSelect from "~/i18n/locale-select";
import useI18n from "~/i18n/use-i18n";
import { signOut } from "~/lib/supabase";
import ThemeButton from "~/theme/theme-button";
import IconButton from "~/ui/icon-button";

//------------------------------------------------------------------------------
// Admin Layout
//------------------------------------------------------------------------------

export default function AdminLayout() {
  const { t } = useI18n();
  const { user } = useAuth();

  return (
    <VStack minH="100vh">
      <HStack justify="space-between" px="6" py="4" w="full">
        <Text
          color="fg.muted"
          display={{ base: "none", sm: "block" }}
          fontSize="sm"
          truncate
        >
          {user?.email ?? "Admin"}
        </Text>

        <HStack gap={2}>
          <LocaleSelect />
          <ThemeButton />
          <IconButton
            Icon={LogOutIcon}
            aria-label={t("common.sign_out")}
            onClick={signOut}
            size="sm"
            variant="ghost"
          />
        </HStack>
      </HStack>

      <Center px={8} py={4} w="full">
        <Flex maxW="40em" w="full">
          <Outlet />
        </Flex>
      </Center>
    </VStack>
  );
}
