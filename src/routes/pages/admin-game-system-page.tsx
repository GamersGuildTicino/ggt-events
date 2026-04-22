import { Alert, Button, Heading, Spinner, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router";
import {
  type GameSystem,
  fetchGameSystem,
  updateGameSystem,
} from "~/domain/game-systems";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import useI18n from "~/i18n/use-i18n";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";
import AdminContentColumns from "../components/admin-content-columns";
import GameSystemForm, {
  type GameSystemFormValue,
} from "../components/game-system-form";

//------------------------------------------------------------------------------
// Admin Game System Page
//------------------------------------------------------------------------------

export default function AdminGameSystemPage() {
  const { gameSystemId } = useParams();
  const { t } = useI18n();
  const [gameSystemState, setGameSystemState] =
    useState<AsyncState<GameSystem>>(initial());
  const [saveState, setSaveState] = useState<AsyncState>(initial());

  useAsyncEffect(
    async (isActive) => {
      setGameSystemState(loading());

      if (!gameSystemId)
        return setGameSystemState(
          failure("page.admin_game_system.error.missing_game_system"),
        );

      const gameSystem = await fetchGameSystem(gameSystemId);
      if (!isActive()) return;
      setGameSystemState(gameSystem);
    },
    [gameSystemId],
  );

  const handleUpdateGameSystem = async (value: GameSystemFormValue) => {
    if (!gameSystemState.isSuccess) return;

    try {
      setSaveState(loading());

      const updatedGameSystem: GameSystem = {
        ...gameSystemState.data,
        ...value,
      };

      const error = await updateGameSystem(updatedGameSystem);
      if (error) return setSaveState(failure(error));

      setGameSystemState(success(updatedGameSystem));
      setSaveState(success(undefined));
    } catch (e) {
      console.error(e);
      setSaveState(failure("page.admin_game_system.error.generic"));
    }
  };

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
        <Alert.Root status="error">
          <Alert.Description>{t(gameSystemState.error)}</Alert.Description>
        </Alert.Root>
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
            message={
              <>
                {saveState.hasError && (
                  <Alert.Root status="error">
                    <Alert.Description>{t(saveState.error)}</Alert.Description>
                  </Alert.Root>
                )}

                {saveState.isSuccess && (
                  <Alert.Root status="success">
                    <Alert.Description>
                      {t("page.admin_game_system.saved")}
                    </Alert.Description>
                  </Alert.Root>
                )}
              </>
            }
            onSubmit={handleUpdateGameSystem}
          />
        </AdminContentColumns>
      )}
    </VStack>
  );
}
