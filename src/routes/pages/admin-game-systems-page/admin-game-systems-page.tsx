import {
  Button,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { Link as RouterLink } from "react-router";
import type { GameSystem } from "~/domain/game-systems";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import AdminContentColumns from "../../components/admin-content-columns";
import AdminGameSystemCard from "./admin-game-system-card";
import useAdminGameSystems from "./use-admin-game-systems";

//------------------------------------------------------------------------------
// Admin Game Systems Page
//------------------------------------------------------------------------------

export default function AdminGameSystemsPage() {
  const { t, ti } = useI18n();
  const {
    deleteAdminGameSystem,
    deleteError,
    deletingGameSystemId,
    gameSystemsState,
  } = useAdminGameSystems();

  usePageTitle(t("page.admin_game_systems.heading"));

  const confirmAdminGameSystemDelete = useCallback(
    (gameSystemName: GameSystem["name"]) =>
      window.confirm(
        ti("page.admin_game_systems.delete.confirm", gameSystemName),
      ),
    [ti],
  );

  const deleteAdminGameSystemForCard = useCallback(
    (gameSystem: GameSystem) =>
      void deleteAdminGameSystem(
        gameSystem.id,
        confirmAdminGameSystemDelete(gameSystem.name),
      ),
    [confirmAdminGameSystemDelete, deleteAdminGameSystem],
  );

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
        <Heading size="3xl">{t("page.admin_game_systems.heading")}</Heading>

        <Button asChild size="xs">
          <RouterLink to="/admin/game-systems/new">
            {t("page.admin_game_systems.new")}
          </RouterLink>
        </Button>
      </HStack>

      {gameSystemsState.isLoading && <Spinner />}

      {gameSystemsState.hasError && (
        <AppAlert status="error">
          {gameSystemsState.error || t("page.admin_game_systems.error")}
        </AppAlert>
      )}

      {deleteError && (
        <AppAlert dismissible status="error">
          {t(deleteError)}
        </AppAlert>
      )}

      {gameSystemsState.isSuccess && gameSystemsState.data.length === 0 && (
        <Text color="fg.muted">{t("page.admin_game_systems.empty")}</Text>
      )}

      {gameSystemsState.isSuccess && gameSystemsState.data.length > 0 && (
        <AdminContentColumns maxColumns={3}>
          {gameSystemsState.data.map((gameSystem) => (
            <AdminGameSystemCard
              deleting={deletingGameSystemId === gameSystem.id}
              gameSystem={gameSystem}
              key={gameSystem.id}
              onDelete={deleteAdminGameSystemForCard}
            />
          ))}
        </AdminContentColumns>
      )}
    </VStack>
  );
}
