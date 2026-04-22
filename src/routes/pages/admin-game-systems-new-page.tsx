import { Alert, Button, Heading, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router";
import { useAuth } from "~/auth/use-auth";
import { createGameSystem } from "~/domain/game-systems";
import useI18n from "~/i18n/use-i18n";
import {
  type AsyncState,
  failure,
  initial,
  loading,
  success,
} from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";
import GameSystemForm, {
  type GameSystemFormValue,
} from "../components/game-system-form";

//------------------------------------------------------------------------------
// Admin Game Systems New Page
//------------------------------------------------------------------------------

export default function AdminGameSystemsNewPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [createState, setCreateState] = useState<AsyncState>(initial());

  const handleCreateGameSystem = async (value: GameSystemFormValue) => {
    try {
      if (user === null)
        return setCreateState(
          failure("page.admin_game_systems_new.error.missing_user"),
        );

      setCreateState(loading());

      const error = await createGameSystem({ createdBy: user.id, ...value });
      if (error) return setCreateState(failure(error));

      setCreateState(success(undefined));
      navigate("/admin/game-systems");
    } catch (e) {
      console.error(e);
      setCreateState(failure("page.admin_game_systems_new.error.generic"));
    }
  };

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

      <GameSystemForm
        actions={
          <>
            <Button loading={createState.isLoading} size="sm" type="submit">
              {t("page.admin_game_systems_new.create")}
            </Button>

            <Button asChild size="sm" variant="outline">
              <RouterLink to="/admin/game-systems">
                {t("page.admin_game_systems_new.back_to_game_systems")}
              </RouterLink>
            </Button>
          </>
        }
        disabled={createState.isLoading}
        message={
          createState.hasError ?
            <Alert.Root status="error">
              <Alert.Description>{t(createState.error)}</Alert.Description>
            </Alert.Root>
          : undefined
        }
        onSubmit={handleCreateGameSystem}
      />
    </VStack>
  );
}
