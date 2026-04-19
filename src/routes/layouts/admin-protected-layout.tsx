import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/auth/use-auth";
import LoadingPage from "../components/loading-page";

export default function AdminProtectedLayout() {
  const location = useLocation();
  const state = { from: location };
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated)
    return <Navigate replace state={state} to="/admin/login" />;
  return <Outlet />;
}
