import { Button, Heading, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import AdminBreadcrumb from "../components/admin-breadcrumb";

//------------------------------------------------------------------------------
// Admin Game Systems New Page
//------------------------------------------------------------------------------

export default function AdminGameSystemsNewPage() {
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          {
            label: t("page.admin_game_systems_new.breadcrumb.admin"),
            to: "/admin",
          },
          {
            label: t("page.admin_game_systems_new.breadcrumb.game_systems"),
            to: "/admin/game-systems",
          },
          { label: t("page.admin_game_systems_new.breadcrumb.new") },
        ]}
      />

      <Heading size="3xl">{t("page.admin_game_systems_new.heading")}</Heading>

      <Button alignSelf="flex-start" asChild size="sm" variant="outline">
        <RouterLink to="/admin/game-systems">
          {t("page.admin_game_systems_new.back_to_game_systems")}
        </RouterLink>
      </Button>
    </VStack>
  );
}
