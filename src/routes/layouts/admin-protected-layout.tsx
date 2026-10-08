import { Center } from "@chakra-ui/react";
import { Navigate, Outlet, useLocation } from "react-router";
import useAdminAccess from "~/auth/use-admin-access";
import { useAuth } from "~/auth/use-auth";
import useI18n from "~/i18n/use-i18n";
import AppAlert from "~/ui/app-alert";
import LoadingPage from "../components/loading-page";

//------------------------------------------------------------------------------
// Admin Protected Layout
//------------------------------------------------------------------------------

export default function AdminProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const access = useAdminAccess();
  const { t } = useI18n();
  const location = useLocation();
  const state = { from: location };
  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated)
    return <Navigate replace state={state} to="/admin/login" />;
  if (access.isLoading || access.status === "initial") return <LoadingPage />;
  if (access.hasError)
    return (
      <Center minH="100vh" p={4}>
        <AppAlert status="error">{t(access.error)}</AppAlert>
      </Center>
    );
  return <Outlet />;
}
