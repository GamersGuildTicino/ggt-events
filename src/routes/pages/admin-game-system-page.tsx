import { Alert, Button, Heading, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router";
import useI18n from "~/i18n/use-i18n";
import { type AsyncState, initial, success } from "~/utils/async-state";
import AdminBreadcrumb from "../components/admin-breadcrumb";
import GameSystemForm, {
  type GameSystemFormValue,
} from "../components/game-system-form";

//------------------------------------------------------------------------------
// Admin Game System Page
//------------------------------------------------------------------------------

export default function AdminGameSystemPage() {
  // const { gameSystemId } = useParams();
  const { t } = useI18n();
  const [saveState, setSaveState] = useState<AsyncState>(initial());

  const handleUpdateGameSystem = (value: GameSystemFormValue) => {
    console.log("update game system", value);
    setSaveState(success(undefined));
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

      <GameSystemForm
        actions={
          <>
            <Button size="sm" type="submit">
              {t("page.admin_game_system.save")}
            </Button>

            <Button asChild size="sm" variant="outline">
              <RouterLink to="/admin/game-systems">
                {t("page.admin_game_system.back_to_game_systems")}
              </RouterLink>
            </Button>
          </>
        }
        initialValue={{
          description: "",
          imageUrl: "",
          name: "",
        }}
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
    </VStack>
  );
}
