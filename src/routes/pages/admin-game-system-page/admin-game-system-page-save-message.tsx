import { Alert } from "@chakra-ui/react";
import useI18n from "~/i18n/use-i18n";
import type { AsyncState } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Game System Page Save Message
//------------------------------------------------------------------------------

type AdminGameSystemPageSaveMessageProps = {
  saveState: AsyncState;
};

export default function AdminGameSystemPageSaveMessage({
  saveState,
}: AdminGameSystemPageSaveMessageProps) {
  const { t } = useI18n();

  return (
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
  );
}
