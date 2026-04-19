import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/auth/use-auth";
import LoadingPage from "../components/loading-page";

//------------------------------------------------------------------------------
// Admin Auth Layout
//------------------------------------------------------------------------------

export default function AdminAuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingPage />;
  if (isAuthenticated) return <Navigate replace to="/admin" />;
  return <Outlet />;
}
