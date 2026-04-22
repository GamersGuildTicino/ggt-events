import { Button, Heading, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import AdminBreadcrumb from "../components/admin-breadcrumb";

//------------------------------------------------------------------------------
// Admin Game System Page
//------------------------------------------------------------------------------

export default function AdminGameSystemPage() {
  // const { gameSystemId } = useParams();
  const { t } = useI18n();

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          {
            label: t("page.admin_game_system.breadcrumb.admin"),
            to: "/admin",
          },
          {
            label: t("page.admin_game_system.breadcrumb.game_systems"),
            to: "/admin/game-systems",
          },
          { label: t("page.admin_game_system.breadcrumb.game_system") },
        ]}
      />

      <Heading size="3xl">{t("page.admin_game_system.heading")}</Heading>

      <Button alignSelf="flex-start" asChild size="sm" variant="outline">
        <RouterLink to="/admin/game-systems">
          {t("page.admin_game_system.back_to_game_systems")}
        </RouterLink>
      </Button>
    </VStack>
  );
}
