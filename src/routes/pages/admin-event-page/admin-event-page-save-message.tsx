import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import type { AsyncState } from "~/utils/async-state";

//------------------------------------------------------------------------------
// Admin Event Page Save Message
//------------------------------------------------------------------------------

type AdminEventPageSaveMessageProps = {
  saveState: AsyncState;
};

export default function AdminEventPageSaveMessage({
  saveState,
}: AdminEventPageSaveMessageProps) {
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
          {t("page.admin_event.saved")}
        </AppAlert>
      )}
    </>
  );
}
