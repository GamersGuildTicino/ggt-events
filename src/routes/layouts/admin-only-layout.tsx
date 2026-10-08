import { Center } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router";
import useAdminAccess from "~/auth/use-admin-access";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import LoadingPage from "../components/loading-page";

//------------------------------------------------------------------------------
// Admin Only Layout
//------------------------------------------------------------------------------

export default function AdminOnlyLayout() {
  const access = useAdminAccess();
  const { t } = useI18n();

  if (access.isLoading || access.status === "initial") return <LoadingPage />;
  if (access.hasError)
    return (
      <Center minH="100vh" p={4}>
        <AppAlert status="error">{t(access.error)}</AppAlert>
      </Center>
    );
  if (!access.data.isAdmin) return <Navigate replace to="/admin" />;

  return <Outlet />;
}
