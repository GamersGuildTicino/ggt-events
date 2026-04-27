import { Button, Heading, Spinner, VStack } from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import AdminContentColumns from "../../components/admin-content-columns";
import GameSystemForm from "../../components/game-system-form";
import AdminGameSystemPageSaveMessage from "./admin-game-system-page-save-message";
import useAdminGameSystem from "./use-admin-game-system";

//------------------------------------------------------------------------------
// Admin Game System Page
//------------------------------------------------------------------------------

export default function AdminGameSystemPage() {
  const { gameSystemId } = useParams();
  const { t } = useI18n();
  const { gameSystemState, saveState, updateAdminGameSystem } =
    useAdminGameSystem(gameSystemId);

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

      {gameSystemState.isLoading && <Spinner />}

      {gameSystemState.hasError && (
        <AppAlert status="error">{t(gameSystemState.error)}</AppAlert>
      )}

      {gameSystemState.isSuccess && (
        <AdminContentColumns maxColumns={2}>
          <GameSystemForm
            actions={
              <>
                <Button loading={saveState.isLoading} size="sm" type="submit">
                  {t("page.admin_game_system.save")}
                </Button>

                <Button asChild size="sm" variant="outline">
                  <RouterLink to="/admin/game-systems">
                    {t("page.admin_game_system.back_to_game_systems")}
                  </RouterLink>
                </Button>
              </>
            }
            disabled={saveState.isLoading}
            initialValue={gameSystemState.data}
            message={<AdminGameSystemPageSaveMessage saveState={saveState} />}
            onSubmit={updateAdminGameSystem}
          />
        </AdminContentColumns>
      )}
    </VStack>
  );
}
