import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
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
        <AppAlert dismissible status="error">
          {t(saveState.error)}
        </AppAlert>
      )}

      {saveState.isSuccess && (
        <AppAlert dismissible status="success">
          {t("page.admin_game_system.saved")}
        </AppAlert>
      )}
    </>
  );
}
