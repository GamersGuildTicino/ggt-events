import { Button, Heading, Spinner, VStack } from "@chakra-ui/react";
import { useCallback } from "react";
import { Link as RouterLink } from "react-router";
import usePageTitle from "~/hooks/use-page-title";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import { toaster } from "~/ui/toaster";
import AdminBreadcrumb from "../../components/admin-breadcrumb";
import AdminContentColumns from "../../components/admin-content-columns";
import HomeMessageForm, {
  type HomeMessageFormValue,
} from "../../components/home-message-form";
import useAdminHomeMessage from "./use-admin-home-message";

//------------------------------------------------------------------------------
// Admin Home Message Page
//------------------------------------------------------------------------------

export default function AdminHomeMessagePage() {
  const { t } = useI18n();
  const { homeMessageState, saveState, updateAdminHomeMessage } =
    useAdminHomeMessage();

  usePageTitle(t("page.admin_home_message.heading"));

  const saveAdminHomeMessage = useCallback(
    async (value: HomeMessageFormValue) => {
      const saved = await updateAdminHomeMessage(value);
      if (!saved) return;

      toaster.success({
        description: t("page.admin_home_message.saved"),
        id: "admin-home-message-saved",
      });
    },
    [t, updateAdminHomeMessage],
  );

  return (
    <VStack align="stretch" gap={3} w="full">
      <AdminBreadcrumb
        items={[
          {
            label: t("page.admin_home_message.breadcrumb.admin"),
            to: "/admin",
          },
          { label: t("page.admin_home_message.breadcrumb.home_message") },
        ]}
      />

      <Heading size="3xl">{t("page.admin_home_message.heading")}</Heading>

      {homeMessageState.isLoading && <Spinner />}

      {homeMessageState.hasError && (
        <AppAlert status="error">{t(homeMessageState.error)}</AppAlert>
      )}

      {homeMessageState.isSuccess && (
        <AdminContentColumns maxColumns={2}>
          <HomeMessageForm
            actions={
              <>
                <Button loading={saveState.isLoading} size="sm" type="submit">
                  {t("page.admin_home_message.save")}
                </Button>

                <Button asChild size="sm" variant="outline">
                  <RouterLink to="/admin">
                    {t("page.admin_home_message.back_to_admin")}
                  </RouterLink>
                </Button>
              </>
            }
            disabled={saveState.isLoading}
            initialValue={homeMessageState.data}
            message={
              saveState.hasError ?
                <AppAlert dismissible status="error">
                  {t(saveState.error)}
                </AppAlert>
              : undefined
            }
            onSubmit={saveAdminHomeMessage}
          />
        </AdminContentColumns>
      )}
    </VStack>
  );
}
