import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/auth/use-auth";
import LoadingPage from "../components/loading-page";

//------------------------------------------------------------------------------
// Admin Protected Layout
//------------------------------------------------------------------------------

export default function AdminProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const state = { from: location };
  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated)
    return <Navigate replace state={state} to="/admin/login" />;
  return <Outlet />;
}
