/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router";
import AdminAuthLayout from "./routes/layouts/admin-auth-layout";
import AdminLayout from "./routes/layouts/admin-layout";
import AdminProtectedLayout from "./routes/layouts/admin-protected-layout";
import PublicLayout from "./routes/layouts/public-layout";

//------------------------------------------------------------------------------
// Lazy Imports
//------------------------------------------------------------------------------

const lazy =
  (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
    Component: (await load()).default,
  });

const HomePage = lazy(() => import("./routes/pages/home-page"));
const EventPage = lazy(() => import("./routes/pages/event-page"));
const AdminForgotPasswordPage = lazy(
  () => import("./routes/pages/admin-forgot-password-page"),
);
const AdminLoginPage = lazy(() => import("./routes/pages/admin-login-page"));
const AdminPage = lazy(() => import("./routes/pages/admin-page"));
const AdminEventsPage = lazy(() => import("./routes/pages/admin-events-page"));
const AdminEventsNewPage = lazy(
  () => import("./routes/pages/admin-events-new-page"),
);
const AdminEventPage = lazy(() => import("./routes/pages/admin-event-page"));
const NotFoundPage = lazy(() => import("./routes/pages/not-found-page"));

//------------------------------------------------------------------------------
// Router
//------------------------------------------------------------------------------

export const router = createBrowserRouter([
  {
    children: [
      { index: true, lazy: HomePage },
      { lazy: EventPage, path: "events/:eventId" },
    ],
    element: <PublicLayout />,
  },
  {
    children: [
      {
        children: [
          { lazy: AdminForgotPasswordPage, path: "forgot-password" },
          { lazy: AdminLoginPage, path: "login" },
        ],
        element: <AdminAuthLayout />,
      },
      {
        children: [
          {
            children: [
              { index: true, lazy: AdminPage },
              { lazy: AdminEventsPage, path: "events" },
              { lazy: AdminEventsNewPage, path: "events/new" },
              { lazy: AdminEventPage, path: "events/:eventId" },
            ],
            element: <AdminLayout />,
          },
        ],
        element: <AdminProtectedLayout />,
      },
    ],
    path: "admin",
  },
  { lazy: NotFoundPage, path: "*" },
]);
