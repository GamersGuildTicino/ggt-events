import { Button, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import AdminBreadcrumb from "../components/admin-breadcrumb";

//------------------------------------------------------------------------------
// Admin Game Systems Page
//------------------------------------------------------------------------------

export default function AdminGameSystemsPage() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          {
            label: t("page.admin_game_systems.breadcrumb.admin"),
            to: "/admin",
          },
          { label: t("page.admin_game_systems.breadcrumb.game_systems") },
        ]}
      />

      <HStack justify="space-between">
        <VStack align="flex-start" gap={1}>
          <Heading size="3xl">{t("page.admin_game_systems.heading")}</Heading>
          <Text color="fg.muted">
            {t("page.admin_game_systems.description")}
          </Text>
        </VStack>

        <Button asChild size="xs">
          <RouterLink to="/admin/game-systems/new">
            {t("page.admin_game_systems.new")}
          </RouterLink>
        </Button>
      </HStack>
    </VStack>
  );
}
